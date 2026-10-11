import { ActionError, type ActionAPIContext, type ActionErrorCode } from "astro:actions";

export type FryRequestKind = "send" | "read";

interface RequestBudget {
  limit: number;
  windowMs: number;
}

interface RequestWindow {
  count: number;
  resetsAt: number;
}

const tenMinutesMs = 10 * 60 * 1000;
const budgetsByKind: Record<FryRequestKind, RequestBudget> = {
  send: { limit: 12, windowMs: tenMinutesMs },
  read: { limit: 40, windowMs: tenMinutesMs },
};
const maxTrackedClients = 2000;
const unknownClientKey = "unknown-client";
const windowsByClientKey = new Map<string, RequestWindow>();

const refusalMessagesByKind: Record<FryRequestKind, string> = {
  send: "Too many rankings from this connection. Try again in a few minutes.",
  read: "Too many crowd requests from this connection. Try again in a few minutes.",
};

function refuse(code: ActionErrorCode, message: string): never {
  throw new ActionError({ code, message });
}

function isOriginOfThisSite(origin: string, context: ActionAPIContext): boolean {
  if (origin === context.url.origin) return true;
  if (!URL.canParse(origin)) return false;
  const hostHeader = context.request.headers.get("host");
  return hostHeader !== null && new URL(origin).host === hostHeader;
}

function assertSameOrigin(context: ActionAPIContext): void {
  const secFetchSite = context.request.headers.get("sec-fetch-site");
  if (secFetchSite !== null && secFetchSite !== "same-origin") {
    refuse("FORBIDDEN", "This request has to come from a page on this site.");
  }
  const origin = context.request.headers.get("origin");
  if (origin === null) refuse("FORBIDDEN", "This request has to come from a page on this site.");
  if (isOriginOfThisSite(origin, context)) return;
  refuse("FORBIDDEN", "This request has to come from a page on this site.");
}

function readClientAddress(context: ActionAPIContext): string {
  try {
    return context.clientAddress;
  } catch {
    return unknownClientKey;
  }
}

function makeRoomForNewClient(now: number): void {
  if (windowsByClientKey.size < maxTrackedClients) return;
  for (const [clientKey, requestWindow] of windowsByClientKey) {
    if (requestWindow.resetsAt <= now) windowsByClientKey.delete(clientKey);
  }
  if (windowsByClientKey.size < maxTrackedClients) return;
  const oldestClientKey = windowsByClientKey.keys().next().value;
  if (oldestClientKey !== undefined) windowsByClientKey.delete(oldestClientKey);
}

function assertWithinBudget(context: ActionAPIContext, kind: FryRequestKind): void {
  const budget = budgetsByKind[kind];
  const clientKey = `${kind}:${readClientAddress(context)}`;
  const now = Date.now();
  const openWindow = windowsByClientKey.get(clientKey);
  if (openWindow !== undefined && openWindow.resetsAt > now) {
    openWindow.count += 1;
    if (openWindow.count > budget.limit) refuse("TOO_MANY_REQUESTS", refusalMessagesByKind[kind]);
    return;
  }
  if (openWindow === undefined) makeRoomForNewClient(now);
  windowsByClientKey.delete(clientKey);
  windowsByClientKey.set(clientKey, { count: 1, resetsAt: now + budget.windowMs });
}

export function guardFryRequest(context: ActionAPIContext, kind: FryRequestKind): void {
  assertSameOrigin(context);
  assertWithinBudget(context, kind);
}
