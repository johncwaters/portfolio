import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { fryListIds, fryLists, isCompleteFryOrder, maxEntriesPerFryList } from "../data/fryRanking";
import { readFryTallies, saveFryBallot } from "../utils/fryBallots";
import { guardFryRequest } from "../utils/fryRequestGuard";

const fryListIdSchema = z.enum(fryListIds);

export const server = {
  sendFryRanking: defineAction({
    input: z.object({
      voterId: z.uuid(),
      listId: fryListIdSchema,
      order: z.array(z.string().max(40)).max(maxEntriesPerFryList),
    }),
    handler: async ({ voterId, listId, order }, context) => {
      guardFryRequest(context, "send");
      const list = fryLists[listId];
      if (!isCompleteFryOrder(list, order)) {
        throw new ActionError({ code: "BAD_REQUEST", message: "Order must rank every entry on the list exactly once." });
      }
      const outcome = await saveFryBallot(list, voterId, order);
      if (outcome.status === "over-budget") {
        throw new ActionError({ code: "TOO_MANY_REQUESTS", message: "Too many rankings came in today." });
      }
      if (outcome.status === "contended") {
        throw new ActionError({ code: "SERVICE_UNAVAILABLE", message: "Too many rankings arrived at once." });
      }
      return outcome.tallies;
    },
  }),
  readFryCrowd: defineAction({
    input: z.object({ listId: fryListIdSchema }),
    handler: async ({ listId }, context) => {
      guardFryRequest(context, "read");
      return readFryTallies(fryLists[listId]);
    },
  }),
};
