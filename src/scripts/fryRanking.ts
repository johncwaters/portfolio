import { actions } from "astro:actions";
import { fryArtPathFor, fryLists, isCompleteFryOrder, type FryList } from "../data/fryRanking";
import type { FryTallies } from "../utils/fryBallots";

type MoveDirection = "higher" | "lower";
type CrowdTrigger = "sent" | "in_view";
type CrowdVersusAuthor = "higher" | "lower" | "same";

interface StoredRanking {
  order: string[];
  sentOrder: string[] | null;
}

const voterIdStorageKey = "fry-ranking:voter-id";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function readStoredText(storageKey: string): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function writeStoredTextWhenStorageAllows(storageKey: string, text: string): void {
  try {
    localStorage.setItem(storageKey, text);
  } catch {
    return;
  }
}

function parseJsonOrNull(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function createVoterIdWithoutSecureContext(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = [...randomBytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const variantDigit = "89ab"[randomBytes[8] % 4];
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variantDigit}${hex.slice(17, 20)}-${hex.slice(20)}`;
}

function readOrCreateVoterId(): string {
  const storedVoterId = readStoredText(voterIdStorageKey);
  if (storedVoterId !== null && uuidPattern.test(storedVoterId)) return storedVoterId;
  const newVoterId = createVoterIdWithoutSecureContext();
  writeStoredTextWhenStorageAllows(voterIdStorageKey, newVoterId);
  return newVoterId;
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

function readStoredRanking(list: FryList, storageKey: string): StoredRanking | null {
  const stored = parseJsonOrNull(readStoredText(storageKey) ?? "null");
  if (typeof stored !== "object" || stored === null) return null;
  const { order, sentOrder } = stored as Record<string, unknown>;
  if (!isStringArray(order) || !isCompleteFryOrder(list, order)) return null;
  const isSentOrderUsable = isStringArray(sentOrder) && isCompleteFryOrder(list, sentOrder);
  return { order, sentOrder: isSentOrderUsable ? sentOrder : null };
}

function toOrdinal(rank: number): string {
  const lastTwoDigits = rank % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return `${rank}th`;
  const suffixByLastDigit: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  return `${rank}${suffixByLastDigit[rank % 10] ?? "th"}`;
}

function requireElement<ElementType extends Element>(root: ParentNode, selector: string): ElementType {
  const element = root.querySelector<ElementType>(selector);
  if (!element) throw new Error(`Fry ranking markup is missing ${selector}`);
  return element;
}

const hasSameOrder = (firstOrder: string[], secondOrder: string[]): boolean =>
  firstOrder.length === secondOrder.length && firstOrder.every((entryId, index) => entryId === secondOrder[index]);

const captureFryEvent = (eventName: string, properties: Record<string, unknown>): void =>
  window.posthog?.capture(eventName, properties);

interface SlidingRow {
  row: HTMLElement;
  startOffset: number;
}

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const moveSlideMs = 260;
const settleTiming = { duration: 340, easing: "ease-out" };
const rankPopKeyframes = [{ transform: "scale(1.6)" }, { transform: "scale(1)" }];
const movementArrivalKeyframes = [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }];
const rowArrivalKeyframes = [{ opacity: 0, transform: "translateY(-14px) scale(0.96)" }, { opacity: 1, transform: "none" }];
const rowFlashKeyframes = [{ boxShadow: "0 0 0 3px #ff6b6e" }, { boxShadow: "0 0 0 3px transparent" }];
const crowdRowArrivalKeyframes = [{ opacity: 0 }, { opacity: 1 }];
const crowdRevealEasing = "cubic-bezier(0.16, 1, 0.3, 1)";
const easeOutCubic = (progress: number): number => 1 - (1 - progress) ** 3;
let finishSlideInFlight: (() => void) | null = null;

function flashRow(row: HTMLElement): void {
  if (reducedMotionQuery.matches) return;
  row.animate(rowFlashKeyframes, { duration: 800, easing: "ease-out" });
}

function playRowArrival(row: HTMLElement): void {
  if (reducedMotionQuery.matches) return;
  row.animate(rowArrivalKeyframes, settleTiming);
  flashRow(row);
}

function revealCrowdRows(crowdRowsElement: HTMLElement): void {
  if (reducedMotionQuery.matches) return;
  [...crowdRowsElement.children].forEach((crowdRow, index) => {
    const staggeredStart = { delay: index * 45, easing: crowdRevealEasing, fill: "backwards" as const };
    crowdRow.animate(crowdRowArrivalKeyframes, { ...staggeredStart, duration: 320 });
    const bar = crowdRow.querySelector<HTMLElement>("[data-crowd-bar]");
    bar?.animate([{ transform: "scaleX(0)" }, { transform: bar.style.transform }], { ...staggeredStart, duration: 640 });
  });
}

function slideRowsWhilePageFollows(slidingRows: SlidingRow[], pageFollowDistance: number): void {
  const scrollTopAtStart = window.scrollY;
  const startedAt = performance.now();
  let frameId = 0;
  const showProgress = (progress: number): void => {
    const easedProgress = easeOutCubic(progress);
    const scrolledDistance = Math.round(pageFollowDistance * easedProgress);
    const scrollRoundingError = scrolledDistance - pageFollowDistance * easedProgress;
    for (const { row, startOffset } of slidingRows) {
      row.style.transform = `translateY(${startOffset * (1 - easedProgress) + scrollRoundingError}px)`;
    }
    window.scrollTo({ top: scrollTopAtStart + scrolledDistance, behavior: "instant" });
  };
  const finish = (): void => {
    cancelAnimationFrame(frameId);
    finishSlideInFlight = null;
    for (const { row } of slidingRows) {
      row.style.transform = "";
      row.style.zIndex = "";
    }
    window.scrollTo({ top: scrollTopAtStart + pageFollowDistance, behavior: "instant" });
  };
  const showNextFrame = (now: number): void => {
    const progress = Math.min(Math.max((now - startedAt) / moveSlideMs, 0), 1);
    if (progress === 1) return finish();
    showProgress(progress);
    frameId = requestAnimationFrame(showNextFrame);
  };
  finishSlideInFlight = finish;
  showProgress(0);
  frameId = requestAnimationFrame(showNextFrame);
}

function keepMovedRowUnderPointer(
  row: HTMLElement,
  rowTopBeforeMove: number,
  displacedRow: HTMLElement,
  displacedTopBeforeMove: number,
): void {
  const pageFollowDistance = row.getBoundingClientRect().top - rowTopBeforeMove;
  if (reducedMotionQuery.matches) {
    window.scrollBy({ top: pageFollowDistance, behavior: "instant" });
    return;
  }
  row.style.zIndex = "1";
  slideRowsWhilePageFollows(
    [
      { row, startOffset: -pageFollowDistance },
      { row: displacedRow, startOffset: displacedTopBeforeMove - displacedRow.getBoundingClientRect().top },
    ],
    pageFollowDistance,
  );
  flashRow(row);
}

function setUpFryRanking(listElement: HTMLElement, list: FryList, voterId: string): void {
  const storageKey = `fry-ranking:${list.id}`;
  const entriesById = new Map([...list.rankedEntries, ...list.benchEntries].map((entry) => [entry.id, entry]));
  const authorOrder = list.rankedEntries.map((entry) => entry.id);
  const authorRankByEntryId = new Map(authorOrder.map((entryId, index) => [entryId, index + 1]));
  const rowsByEntryId = new Map(
    [...listElement.querySelectorAll<HTMLElement>("[data-entry-id]")].map((row) => [row.dataset.entryId ?? "", row]),
  );
  const orderElement = requireElement<HTMLElement>(listElement, "[data-fry-order]");
  const benchElement = requireElement<HTMLElement>(listElement, "[data-fry-bench]");
  const benchRowsElement = requireElement<HTMLElement>(listElement, "[data-fry-bench-rows]");
  const addButtons = [...listElement.querySelectorAll<HTMLButtonElement>("[data-add-entry]")];
  const sendButton = requireElement<HTMLButtonElement>(listElement, "[data-send]");
  const statusElement = requireElement<HTMLElement>(listElement, "[data-fry-status]");
  const crowdElement = requireElement<HTMLElement>(document, `[data-fry-crowd="${list.id}"]`);
  const crowdStatusElement = requireElement<HTMLElement>(crowdElement, "[data-crowd-status]");
  const crowdReloadButton = requireElement<HTMLButtonElement>(crowdElement, "[data-crowd-reload]");
  const crowdTableElement = requireElement<HTMLElement>(crowdElement, "[data-crowd-table]");
  const crowdOrderElement = requireElement<HTMLElement>(crowdElement, "[data-crowd-order]");
  const crowdFightElement = requireElement<HTMLElement>(crowdElement, "[data-crowd-fight]");
  const crowdAddedElement = requireElement<HTMLElement>(crowdElement, "[data-crowd-added]");
  const crowdAddedRowsElement = requireElement<HTMLElement>(crowdElement, "[data-crowd-added-rows]");
  const crowdRowTemplate = requireElement<HTMLTemplateElement>(crowdElement, "[data-crowd-row]");
  const crowdAddedRowTemplate = requireElement<HTMLTemplateElement>(crowdElement, "[data-crowd-added-row]");

  const storedRanking = readStoredRanking(list, storageKey);
  let currentOrder = storedRanking?.order ?? authorOrder;
  let sentOrder = storedRanking?.sentOrder ?? null;
  let sendProblem: "failed" | "throttled" | null = null;
  let isSending = false;
  let latestChangeNote = "";
  let hasRenderedOnce = false;
  let isCrowdShownFromOwnSend = false;

  const rowFor = (entryId: string): HTMLElement => {
    const row = rowsByEntryId.get(entryId);
    if (!row) throw new Error(`Fry ranking has no row for ${entryId}`);
    return row;
  };
  const nameOf = (entryId: string): string => entriesById.get(entryId)?.name ?? entryId;
  const moveButtonFor = (entryId: string, direction: MoveDirection): HTMLButtonElement =>
    requireElement<HTMLButtonElement>(rowFor(entryId), `[data-move="${direction}"]`);

  function describeMovement(rank: number, authorRank: number | undefined): string {
    if (authorRank === undefined) return "Your pick";
    if (rank === authorRank) return "";
    const direction = rank < authorRank ? "Up" : "Down";
    return `${direction} ${Math.abs(rank - authorRank)}, was ${toOrdinal(authorRank)}`;
  }

  function describeSendState(): string {
    if (isSending) return "Sending…";
    if (sendProblem === "throttled") return "Too many rankings are coming in. Yours is still saved in this browser; try again later.";
    if (sendProblem === "failed") return "Couldn’t send. Your ranking is still saved in this browser.";
    if (sentOrder === null) return "Not sent yet.";
    if (hasSameOrder(sentOrder, currentOrder)) return "Sent. Change anything and send again to replace it.";
    return "This no longer matches the ranking you sent. Press Send ranking to update it.";
  }

  function summarizeDisagreement(order: string[]) {
    const distances = authorOrder.map((entryId) => ({
      entryId,
      distance: Math.abs(order.indexOf(entryId) + 1 - (authorRankByEntryId.get(entryId) ?? 0)),
    }));
    const biggestMove = distances.reduce((biggest, candidate) => (candidate.distance > biggest.distance ? candidate : biggest));
    return {
      moved_count: distances.filter(({ distance }) => distance > 0).length,
      total_distance: distances.reduce((total, { distance }) => total + distance, 0),
      biggest_mover: biggestMove.distance > 0 ? biggestMove.entryId : null,
      biggest_move_distance: biggestMove.distance,
      added_entries: order.filter((entryId) => !authorRankByEntryId.has(entryId)),
    };
  }

  function placeRowsInCurrentOrder(): void {
    orderElement.append(...currentOrder.map(rowFor));
    const benchedRows = [...rowsByEntryId].filter(([entryId]) => !currentOrder.includes(entryId)).map(([, row]) => row);
    benchRowsElement.append(...benchedRows);
  }

  function showChangedText(element: HTMLElement, text: string, arrivalKeyframes: Keyframe[]): void {
    if (element.textContent === text) return;
    element.textContent = text;
    if (hasRenderedOnce && !reducedMotionQuery.matches) element.animate(arrivalKeyframes, settleTiming);
  }

  const recordRankedRowTops = (): Map<HTMLElement, number> =>
    new Map(currentOrder.map((entryId) => [rowFor(entryId), rowFor(entryId).getBoundingClientRect().top]));

  function slideRowsFromRecordedTops(recordedTopByRow: Map<HTMLElement, number>): void {
    if (reducedMotionQuery.matches) return;
    for (const [row, recordedTop] of recordedTopByRow) {
      const distance = recordedTop - row.getBoundingClientRect().top;
      const isStillRanked = row.parentElement === orderElement;
      if (isStillRanked && distance !== 0) {
        row.animate([{ transform: `translateY(${distance}px)` }, { transform: "none" }], settleTiming);
      }
    }
  }

  function renderRanking(): void {
    currentOrder.forEach((entryId, index) => {
      const row = rowFor(entryId);
      const rank = index + 1;
      const authorRank = authorRankByEntryId.get(entryId);
      const movementElement = requireElement<HTMLElement>(row, "[data-movement]");
      showChangedText(requireElement<HTMLElement>(row, "[data-rank]"), String(rank), rankPopKeyframes);
      showChangedText(movementElement, describeMovement(rank, authorRank), movementArrivalKeyframes);
      movementElement.toggleAttribute("data-moved", rank !== authorRank);
      moveButtonFor(entryId, "higher").disabled = index === 0;
      moveButtonFor(entryId, "lower").disabled = index === currentOrder.length - 1;
    });
    for (const addButton of addButtons) addButton.hidden = currentOrder.includes(addButton.dataset.addEntry ?? "");
    benchElement.hidden = addButtons.every((addButton) => addButton.hidden);
    sendButton.disabled = isSending;
    statusElement.textContent = [latestChangeNote, describeSendState()].filter(Boolean).join(" ");
  }

  function keepChange(changeNote: string): void {
    latestChangeNote = changeNote;
    sendProblem = null;
    writeStoredTextWhenStorageAllows(storageKey, JSON.stringify({ order: currentOrder, sentOrder }));
    renderRanking();
  }

  function moveEntry(entryId: string, direction: MoveDirection): void {
    const fromIndex = currentOrder.indexOf(entryId);
    const toIndex = direction === "higher" ? fromIndex - 1 : fromIndex + 1;
    const displacedEntryId = currentOrder[toIndex];
    if (fromIndex === -1 || displacedEntryId === undefined) return;

    const row = rowFor(entryId);
    const displacedRow = rowFor(displacedEntryId);
    const topBeforeMove = row.getBoundingClientRect().top;
    const displacedTopBeforeMove = displacedRow.getBoundingClientRect().top;
    const reordered = [...currentOrder];
    reordered[fromIndex] = displacedEntryId;
    reordered[toIndex] = entryId;
    currentOrder = reordered;
    if (direction === "higher") row.after(displacedRow);
    if (direction === "lower") row.before(displacedRow);
    keepChange(`${nameOf(entryId)} is now ${toOrdinal(toIndex + 1)} of ${currentOrder.length}.`);

    const oppositeDirection: MoveDirection = direction === "higher" ? "lower" : "higher";
    if (moveButtonFor(entryId, direction).disabled) moveButtonFor(entryId, oppositeDirection).focus({ preventScroll: true });
    keepMovedRowUnderPointer(row, topBeforeMove, displacedRow, displacedTopBeforeMove);
    captureFryEvent("fry_entry_moved", {
      list: list.id,
      entry: entryId,
      direction,
      from_rank: fromIndex + 1,
      to_rank: toIndex + 1,
      author_rank: authorRankByEntryId.get(entryId) ?? null,
    });
  }

  function addEntry(entryId: string): void {
    if (currentOrder.includes(entryId) || !rowsByEntryId.has(entryId)) return;
    currentOrder = [...currentOrder, entryId];
    orderElement.append(rowFor(entryId));
    keepChange(`${nameOf(entryId)} added at the bottom. Move it where it belongs.`);
    playRowArrival(rowFor(entryId));
    moveButtonFor(entryId, "higher").focus();
    captureFryEvent("fry_entry_added", { list: list.id, entry: entryId });
  }

  function removeEntry(entryId: string): void {
    if (authorRankByEntryId.has(entryId) || !currentOrder.includes(entryId)) return;
    const rowTopsBeforeRemoval = recordRankedRowTops();
    currentOrder = currentOrder.filter((orderedEntryId) => orderedEntryId !== entryId);
    benchRowsElement.append(rowFor(entryId));
    keepChange(`${nameOf(entryId)} removed.`);
    slideRowsFromRecordedTops(rowTopsBeforeRemoval);
    addButtons.find((addButton) => addButton.dataset.addEntry === entryId)?.focus();
    captureFryEvent("fry_entry_removed", { list: list.id, entry: entryId });
  }

  function resetToAuthorOrder(): void {
    const disagreementBeforeReset = summarizeDisagreement(currentOrder);
    const rowTopsBeforeReset = recordRankedRowTops();
    currentOrder = authorOrder;
    placeRowsInCurrentOrder();
    keepChange("Reset to the starting order.");
    slideRowsFromRecordedTops(rowTopsBeforeReset);
    captureFryEvent("fry_ranking_reset", { list: list.id, ...disagreementBeforeReset });
  }

  function fillCrowdRowIdentity(crowdRow: DocumentFragment, entryId: string, averageRank: number): void {
    const entry = entriesById.get(entryId);
    if (!entry) return;
    requireElement<HTMLImageElement>(crowdRow, "[data-crowd-art]").src = fryArtPathFor(entry);
    requireElement<HTMLElement>(crowdRow, "[data-crowd-name]").textContent = entry.name;
    requireElement<HTMLElement>(crowdRow, "[data-crowd-average]").textContent = averageRank.toFixed(1);
  }

  function describeCrowdCount(ballotCount: number): string {
    if (ballotCount === 0) return "No rankings sent yet. Yours would be the first.";
    if (ballotCount === 1 && sentOrder !== null) return "Based on 1 ranking, and it’s yours. You are the crowd.";
    if (ballotCount === 1) return "Based on 1 ranking.";
    return `Based on ${ballotCount} rankings.`;
  }

  function compareCrowdWithAuthor(crowdRank: number, authorRank: number): { versus: CrowdVersusAuthor; shown: string; spoken: string } {
    const gap = Math.abs(crowdRank - authorRank);
    if (gap === 0) return { versus: "same", shown: "=", spoken: "Same as mine." };
    if (crowdRank < authorRank) return { versus: "higher", shown: `▲ ${gap}`, spoken: `${gap} higher than my ${toOrdinal(authorRank)}.` };
    return { versus: "lower", shown: `▼ ${gap}`, spoken: `${gap} lower than my ${toOrdinal(authorRank)}.` };
  }

  function barFillFor(averageRank: number): number {
    const shareOfWayToLastSpot = (averageRank - 1) / (authorOrder.length - 1);
    return Math.min(Math.max(1 - shareOfWayToLastSpot, 0.03), 1);
  }

  function showCrowd(tallies: FryTallies, trigger: CrowdTrigger): void {
    const talliesByEntryId = new Map(tallies.entries.map((tally) => [tally.id, tally]));
    const crowdRankedEntries = authorOrder
      .flatMap((entryId) => {
        const tally = talliesByEntryId.get(entryId);
        return tally ? [tally] : [];
      })
      .sort((firstTally, secondTally) => firstTally.averageRank - secondTally.averageRank)
      .map((tally, index) => ({ ...tally, crowdRank: index + 1, authorRank: authorRankByEntryId.get(tally.id) ?? 0 }));
    const readerAddedEntries = tallies.entries
      .filter((tally) => !authorRankByEntryId.has(tally.id) && entriesById.has(tally.id))
      .sort((firstTally, secondTally) => secondTally.ballotCount - firstTally.ballotCount);
    const biggestFight = crowdRankedEntries.reduce<(typeof crowdRankedEntries)[number] | null>((biggest, candidate) => {
      const candidateGap = Math.abs(candidate.crowdRank - candidate.authorRank);
      const biggestGap = biggest ? Math.abs(biggest.crowdRank - biggest.authorRank) : 0;
      return candidateGap > biggestGap ? candidate : biggest;
    }, null);

    crowdStatusElement.textContent = describeCrowdCount(tallies.ballotCount);
    crowdOrderElement.replaceChildren();
    crowdAddedRowsElement.replaceChildren();
    for (const crowdEntry of crowdRankedEntries) {
      const crowdRow = crowdRowTemplate.content.cloneNode(true) as DocumentFragment;
      const comparison = compareCrowdWithAuthor(crowdEntry.crowdRank, crowdEntry.authorRank);
      const versusElement = requireElement<HTMLElement>(crowdRow, "[data-crowd-versus]");
      fillCrowdRowIdentity(crowdRow, crowdEntry.id, crowdEntry.averageRank);
      requireElement<HTMLElement>(crowdRow, "[data-crowd-rank]").textContent = String(crowdEntry.crowdRank);
      requireElement<HTMLElement>(crowdRow, "[data-crowd-bar]").style.transform = `scaleX(${barFillFor(crowdEntry.averageRank)})`;
      versusElement.textContent = comparison.shown;
      versusElement.dataset.versus = comparison.versus;
      requireElement<HTMLElement>(crowdRow, "[data-crowd-versus-spoken]").textContent = comparison.spoken;
      crowdOrderElement.append(crowdRow);
    }
    for (const addedEntry of readerAddedEntries) {
      const addedRow = crowdAddedRowTemplate.content.cloneNode(true) as DocumentFragment;
      fillCrowdRowIdentity(addedRow, addedEntry.id, addedEntry.averageRank);
      requireElement<HTMLElement>(addedRow, "[data-crowd-added-share]").textContent = `${addedEntry.ballotCount} of ${tallies.ballotCount}`;
      crowdAddedRowsElement.append(addedRow);
    }
    crowdTableElement.hidden = crowdRankedEntries.length === 0;
    crowdAddedElement.hidden = readerAddedEntries.length === 0;
    crowdFightElement.hidden = tallies.ballotCount === 0;
    revealCrowdRows(crowdOrderElement);
    revealCrowdRows(crowdAddedRowsElement);
    crowdFightElement.textContent = biggestFight
      ? `Biggest fight with me: ${nameOf(biggestFight.id)}. I have it ${toOrdinal(biggestFight.authorRank)}, the crowd has it ${toOrdinal(biggestFight.crowdRank)}.`
      : "The crowd matches my order exactly. Suspicious.";
    captureFryEvent("fry_crowd_viewed", {
      list: list.id,
      trigger,
      ballot_count: tallies.ballotCount,
      crowd_order: crowdRankedEntries.map((crowdEntry) => crowdEntry.id),
      biggest_fight: biggestFight?.id ?? null,
    });
  }

  async function loadCrowd(): Promise<void> {
    crowdReloadButton.hidden = true;
    crowdStatusElement.textContent = "Loading…";
    const crowdResult = await actions.readFryCrowd({ listId: list.id }).catch(() => null);
    if (isCrowdShownFromOwnSend) return;
    if (!crowdResult || crowdResult.error) {
      crowdStatusElement.textContent = "Couldn’t load the leaderboard.";
      crowdReloadButton.hidden = false;
      return;
    }
    showCrowd(crowdResult.data, "in_view");
  }

  const crowdInViewObserver = new IntersectionObserver(
    (observedEntries) => {
      if (!observedEntries.some((observedEntry) => observedEntry.isIntersecting)) return;
      crowdInViewObserver.disconnect();
      void loadCrowd();
    },
    { rootMargin: "200px" },
  );

  async function sendRanking(): Promise<void> {
    if (isSending) return;
    const orderBeingSent = [...currentOrder];
    isSending = true;
    sendProblem = null;
    latestChangeNote = "";
    renderRanking();
    const sendResult = await actions.sendFryRanking({ voterId, listId: list.id, order: orderBeingSent }).catch(() => null);
    isSending = false;
    if (!sendResult || sendResult.error) {
      const errorCode = sendResult?.error?.code ?? "NETWORK";
      sendProblem = errorCode === "TOO_MANY_REQUESTS" ? "throttled" : "failed";
      renderRanking();
      captureFryEvent("fry_ranking_send_failed", { list: list.id, error_code: errorCode });
      return;
    }
    const isResend = sentOrder !== null;
    sentOrder = orderBeingSent;
    writeStoredTextWhenStorageAllows(storageKey, JSON.stringify({ order: currentOrder, sentOrder }));
    renderRanking();
    captureFryEvent("fry_ranking_sent", {
      list: list.id,
      order: orderBeingSent,
      entry_count: orderBeingSent.length,
      is_resend: isResend,
      ...summarizeDisagreement(orderBeingSent),
    });
    isCrowdShownFromOwnSend = true;
    crowdInViewObserver.disconnect();
    crowdReloadButton.hidden = true;
    showCrowd(sendResult.data, "sent");
  }

  crowdReloadButton.addEventListener("click", () => void loadCrowd());

  listElement.addEventListener("click", (event) => {
    const pressedButton = event.target instanceof Element ? event.target.closest("button") : null;
    if (!pressedButton) return;
    finishSlideInFlight?.();
    const entryId = pressedButton.closest<HTMLElement>("[data-entry-id]")?.dataset.entryId;
    const moveDirection = pressedButton.dataset.move;
    if (entryId && (moveDirection === "higher" || moveDirection === "lower")) return moveEntry(entryId, moveDirection);
    if (entryId && pressedButton.hasAttribute("data-remove")) return removeEntry(entryId);
    if (pressedButton.dataset.addEntry) return addEntry(pressedButton.dataset.addEntry);
    if (pressedButton.hasAttribute("data-send")) return void sendRanking();
    if (pressedButton.hasAttribute("data-reset")) return resetToAuthorOrder();
  });

  for (const scriptedElement of listElement.querySelectorAll<HTMLElement>("[data-needs-script]")) scriptedElement.hidden = false;
  placeRowsInCurrentOrder();
  renderRanking();
  hasRenderedOnce = true;
  crowdInViewObserver.observe(crowdElement);
}

const voterId = readOrCreateVoterId();
for (const listElement of document.querySelectorAll<HTMLElement>("[data-fry-list]")) {
  const list = Object.values(fryLists).find((candidate) => candidate.id === listElement.dataset.fryList);
  if (list) setUpFryRanking(listElement, list, voterId);
}
