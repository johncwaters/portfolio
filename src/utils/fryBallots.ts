import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { z } from "astro/zod";
import { isCompleteFryOrder, type FryList, type FryListId } from "../data/fryRanking";

interface FryEntryTally {
  id: string;
  ballotCount: number;
  averageRank: number;
}

export interface FryTallies {
  ballotCount: number;
  entries: FryEntryTally[];
}

type SaveBallotOutcome =
  | { status: "saved"; tallies: FryTallies }
  | { status: "unchanged"; tallies: FryTallies }
  | { status: "over-budget" }
  | { status: "contended" };

const storedBallotSchema = z.object({ voterId: z.string(), order: z.array(z.string()), sentAt: z.number() });
const writeBudgetSchema = z.object({ utcDay: z.string(), writesUsed: z.number().int().nonnegative() });
const storedListSchema = z.object({ ballots: z.array(storedBallotSchema), writeBudget: writeBudgetSchema });

type StoredBallot = z.infer<typeof storedBallotSchema>;
type WriteBudget = z.infer<typeof writeBudgetSchema>;
type StoredList = z.infer<typeof storedListSchema>;

interface LoadedList {
  storedList: StoredList;
  version: string | null;
}

interface KnownList {
  storedList: StoredList;
  knownAt: number;
}

const maxBallotsPerList = 2000;
const maxWritesPerListPerUtcDay = 20;
const maxSaveAttempts = 3;
const retryBackoffBaseMs = 150;
const talliesMemoTtlMs = 5 * 60 * 1000;
const blobCacheMaxAgeSeconds = 5 * 60;

const devStoredListByListId = new Map<FryListId, StoredList>();
const latestKnownListByListId = new Map<FryListId, KnownList>();
const saveChainByListId = new Map<FryListId, Promise<unknown>>();

const emptyStoredList = (): StoredList => ({ ballots: [], writeBudget: { utcDay: "", writesUsed: 0 } });
const blobPathnameFor = (listId: FryListId): string => `fry-rankings/${listId}.json`;
const utcDayOf = (timestamp: number): string => new Date(timestamp).toISOString().slice(0, 10);
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
const jitteredBackoffMs = (attempt: number): number => retryBackoffBaseMs * 2 ** (attempt - 1) * (0.5 + Math.random());

const hasSameOrder = (firstOrder: string[], secondOrder: string[]): boolean =>
  firstOrder.length === secondOrder.length && firstOrder.every((entryId, index) => entryId === secondOrder[index]);

function rememberList(listId: FryListId, storedList: StoredList): void {
  latestKnownListByListId.set(listId, { storedList, knownAt: Date.now() });
}

async function loadList(listId: FryListId, mustBeFresh: boolean): Promise<LoadedList> {
  if (import.meta.env.DEV) {
    const storedList = devStoredListByListId.get(listId) ?? emptyStoredList();
    rememberList(listId, storedList);
    return { storedList, version: null };
  }
  const stored = await get(blobPathnameFor(listId), { access: "private", useCache: !mustBeFresh });
  if (stored === null) {
    const storedList = emptyStoredList();
    rememberList(listId, storedList);
    return { storedList, version: null };
  }
  if (stored.statusCode !== 200) throw new Error(`Unexpected status ${stored.statusCode} reading fry ballots`);
  if (!stored.blob.etag) throw new Error("Fry ballots read carried no etag");
  const storedText = await new Response(stored.stream).text();
  const storedList = storedListSchema.parse(JSON.parse(storedText));
  rememberList(listId, storedList);
  return { storedList, version: stored.blob.etag };
}

async function storeListIfUnchanged(listId: FryListId, storedList: StoredList, versionWhenLoaded: string | null): Promise<boolean> {
  if (import.meta.env.DEV) {
    devStoredListByListId.set(listId, storedList);
    rememberList(listId, storedList);
    return true;
  }
  const overwriteGuard = versionWhenLoaded === null ? {} : { allowOverwrite: true, ifMatch: versionWhenLoaded };
  try {
    await put(blobPathnameFor(listId), JSON.stringify(storedList), {
      access: "private",
      contentType: "application/json",
      cacheControlMaxAge: blobCacheMaxAgeSeconds,
      ...overwriteGuard,
    });
    rememberList(listId, storedList);
    return true;
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return false;
    throw error;
  }
}

function tallyBallots(list: FryList, storedList: StoredList): FryTallies {
  const completeOrders = storedList.ballots.map((ballot) => ballot.order).filter((order) => isCompleteFryOrder(list, order));
  const rankSumByEntryId = new Map<string, number>();
  const ballotCountByEntryId = new Map<string, number>();
  for (const order of completeOrders) {
    order.forEach((entryId, index) => {
      rankSumByEntryId.set(entryId, (rankSumByEntryId.get(entryId) ?? 0) + index + 1);
      ballotCountByEntryId.set(entryId, (ballotCountByEntryId.get(entryId) ?? 0) + 1);
    });
  }
  return {
    ballotCount: completeOrders.length,
    entries: [...ballotCountByEntryId].map(([id, ballotCount]) => ({
      id,
      ballotCount,
      averageRank: (rankSumByEntryId.get(id) ?? 0) / ballotCount,
    })),
  };
}

const budgetForUtcDay = (writeBudget: WriteBudget, utcDay: string): WriteBudget =>
  writeBudget.utcDay === utcDay ? writeBudget : { utcDay, writesUsed: 0 };

const isBudgetSpent = (writeBudget: WriteBudget, utcDay: string): boolean =>
  writeBudget.utcDay === utcDay && writeBudget.writesUsed >= maxWritesPerListPerUtcDay;

function unchangedOutcomeFor(list: FryList, storedList: StoredList, voterId: string, order: string[]): SaveBallotOutcome | null {
  const existingBallot = storedList.ballots.find((ballot) => ballot.voterId === voterId);
  if (!existingBallot || !hasSameOrder(existingBallot.order, order)) return null;
  return { status: "unchanged", tallies: tallyBallots(list, storedList) };
}

function knownOverBudgetOutcomeFor(list: FryList, voterId: string, order: string[], now: number): SaveBallotOutcome | null {
  const knownList = latestKnownListByListId.get(list.id);
  if (!knownList || !isBudgetSpent(knownList.storedList.writeBudget, utcDayOf(now))) return null;
  return unchangedOutcomeFor(list, knownList.storedList, voterId, order) ?? { status: "over-budget" };
}

function withBallotReplaced(ballots: StoredBallot[], newBallot: StoredBallot): StoredBallot[] {
  const otherBallots = ballots.filter((ballot) => ballot.voterId !== newBallot.voterId);
  const newestOtherBallots = otherBallots.slice(-(maxBallotsPerList - 1));
  return [...newestOtherBallots, newBallot];
}

function runAfterEarlierSaves<Outcome>(listId: FryListId, save: () => Promise<Outcome>): Promise<Outcome> {
  const earlierSaves = saveChainByListId.get(listId) ?? Promise.resolve();
  const thisSave = earlierSaves.then(save);
  saveChainByListId.set(listId, thisSave.catch(() => undefined));
  return thisSave;
}

async function saveFryBallotNow(list: FryList, voterId: string, order: string[]): Promise<SaveBallotOutcome> {
  const knownOutcome = knownOverBudgetOutcomeFor(list, voterId, order, Date.now());
  if (knownOutcome) return knownOutcome;
  for (let attempt = 0; attempt < maxSaveAttempts; attempt += 1) {
    if (attempt > 0) await sleep(jitteredBackoffMs(attempt));
    const now = Date.now();
    const { storedList, version } = await loadList(list.id, true);
    const unchangedOutcome = unchangedOutcomeFor(list, storedList, voterId, order);
    if (unchangedOutcome) return unchangedOutcome;
    const todaysBudget = budgetForUtcDay(storedList.writeBudget, utcDayOf(now));
    if (isBudgetSpent(todaysBudget, todaysBudget.utcDay)) return { status: "over-budget" };
    const updatedList: StoredList = {
      ballots: withBallotReplaced(storedList.ballots, { voterId, order, sentAt: now }),
      writeBudget: { ...todaysBudget, writesUsed: todaysBudget.writesUsed + 1 },
    };
    const wasStored = await storeListIfUnchanged(list.id, updatedList, version);
    if (wasStored) return { status: "saved", tallies: tallyBallots(list, updatedList) };
  }
  return { status: "contended" };
}

export async function readFryTallies(list: FryList): Promise<FryTallies> {
  const knownList = latestKnownListByListId.get(list.id);
  if (knownList && Date.now() - knownList.knownAt < talliesMemoTtlMs) return tallyBallots(list, knownList.storedList);
  const { storedList } = await loadList(list.id, false);
  return tallyBallots(list, storedList);
}

export const saveFryBallot = (list: FryList, voterId: string, order: string[]): Promise<SaveBallotOutcome> =>
  runAfterEarlierSaves(list.id, () => saveFryBallotNow(list, voterId, order));
