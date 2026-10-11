export type FryListId = "shapes" | "chains";

interface FryEntryDetail {
  shapeName: string;
  qualifier?: string;
  sourceUrl?: string;
}

export interface FryEntry {
  id: string;
  name: string;
  artShapeId: string;
  artAlt: string;
  logoPath?: string;
  detail?: FryEntryDetail;
}

export interface FryList {
  id: FryListId;
  heading: string;
  rankedEntries: FryEntry[];
  benchEntries: FryEntry[];
}

interface FryShape {
  id: string;
  name: string;
  artAlt: string;
}

interface FryChain {
  id: string;
  name: string;
  shapeId: string;
  qualifier?: string;
  sourceUrl?: string;
}

const rankedShapes: FryShape[] = [
  { id: "curly", name: "Curly", artAlt: "A curly fry coiled like a spring" },
  { id: "regular", name: "Regular", artAlt: "Straight-cut fries standing in a paper cup with a red stripe" },
  { id: "tater-tots", name: "Tater tots (or gems)", artAlt: "Three tater tots stacked in a small pyramid" },
  { id: "hash-brown-patty", name: "Hash brown patty", artAlt: "An oval hash brown patty covered in shredded potato" },
  { id: "smiley-face", name: "Smiley faces", artAlt: "A round potato smiley face with two eye holes and a grin" },
  { id: "jojos", name: "Jojos", artAlt: "Two breaded potato wedges speckled with seasoning" },
  { id: "steak", name: "Steak", artAlt: "Two thick steak fries crossed in an X" },
  { id: "matchstick", name: "Matchstick", artAlt: "A loose pile of short, thin matchstick fries" },
  { id: "potato-wedge", name: "Potato wedge", artAlt: "A plain potato wedge with the skin left on its curved side" },
  { id: "sweet-potato", name: "Sweet potato", artAlt: "A pile of orange sweet potato fries with salt on them" },
  { id: "shoestring", name: "Shoestring", artAlt: "A tangled nest of long, thin shoestring fries" },
  { id: "crinkle", name: "Crinkle", artAlt: "Three crinkle-cut fries with ridged edges" },
  { id: "waffle", name: "Waffle", artAlt: "A round waffle fry with a lattice of square holes" },
];

const benchShapes: FryShape[] = [
  { id: "cottage", name: "Cottage", artAlt: "Three round cottage fries with ridged faces" },
  { id: "home-fries", name: "Home fries", artAlt: "A pile of browned potato cubes flecked with herbs" },
  { id: "sidewinders", name: "Sidewinders", artAlt: "Two thick fries twisted into S curves" },
  { id: "tornado-potato", name: "Tornado potato", artAlt: "A spiral-cut potato fanned out along a wooden skewer" },
  { id: "british-chips", name: "British chips", artAlt: "Thick-cut chips in a newspaper cone" },
  { id: "loaded", name: "Loaded", artAlt: "A pile of fries under melted cheese, bacon bits, and chives" },
];

const rankedChains: FryChain[] = [
  { id: "burger-king", name: "Burger King", shapeId: "regular" },
  { id: "taco-bell", name: "Taco Bell", shapeId: "regular", qualifier: "seasoned", sourceUrl: "https://www.tacobell.com/food/sides-sweets/nacho-fries" },
  { id: "wendys", name: "Wendy’s", shapeId: "regular" },
  { id: "dairy-queen", name: "Dairy Queen", shapeId: "regular" },
  { id: "arbys", name: "Arby’s", shapeId: "curly" },
  { id: "mcdonalds", name: "McDonald’s", shapeId: "regular" },
  { id: "red-robin", name: "Red Robin", shapeId: "steak", sourceUrl: "https://www.redrobin.com/menu/bottomless/steak-fries" },
  { id: "shake-shack", name: "Shake Shack", shapeId: "crinkle" },
  { id: "popeyes", name: "Popeyes", shapeId: "regular" },
  { id: "culvers", name: "Culver’s", shapeId: "crinkle", sourceUrl: "https://www.culvers.com/menu-and-nutrition/sides/crinkle-cut-fries" },
  { id: "nathans-famous", name: "Nathan’s Famous", shapeId: "crinkle" },
  { id: "chick-fil-a", name: "Chick-fil-A", shapeId: "waffle" },
  { id: "five-guys", name: "Five Guys", shapeId: "regular", qualifier: "hand-cut", sourceUrl: "https://www.fiveguys.com/menu/fries/" },
];

const benchChains: FryChain[] = [
  { id: "in-n-out", name: "In-N-Out", shapeId: "regular", qualifier: "fresh-cut" },
  { id: "raising-canes", name: "Raising Cane’s", shapeId: "crinkle" },
  { id: "whataburger", name: "Whataburger", shapeId: "regular" },
  { id: "sonic", name: "Sonic", shapeId: "crinkle" },
  { id: "checkers-rallys", name: "Checkers & Rally’s", shapeId: "regular", qualifier: "seasoned" },
  { id: "zaxbys", name: "Zaxby’s", shapeId: "crinkle", qualifier: "seasoned" },
  { id: "steak-n-shake", name: "Steak ’n Shake", shapeId: "shoestring" },
];

const chainIdsWithoutPublicDomainLogo = new Set(["zaxbys"]);

const shapesById = new Map([...rankedShapes, ...benchShapes].map((shape) => [shape.id, shape]));

const toShapeEntry = (shape: FryShape): FryEntry => ({
  id: shape.id,
  name: shape.name,
  artShapeId: shape.id,
  artAlt: shape.artAlt,
});

const toChainEntry = (chain: FryChain): FryEntry => {
  const shape = shapesById.get(chain.shapeId);
  if (!shape) throw new Error(`Chain ${chain.id} names unknown fry shape ${chain.shapeId}`);
  return {
    id: chain.id,
    name: chain.name,
    artShapeId: shape.id,
    artAlt: "",
    logoPath: chainIdsWithoutPublicDomainLogo.has(chain.id) ? undefined : `/blog/logo-${chain.id}.svg`,
    detail: { shapeName: shape.name, qualifier: chain.qualifier, sourceUrl: chain.sourceUrl },
  };
};

export const fryLists: Record<FryListId, FryList> = {
  shapes: {
    id: "shapes",
    heading: "The shapes",
    rankedEntries: rankedShapes.map(toShapeEntry),
    benchEntries: benchShapes.map(toShapeEntry),
  },
  chains: {
    id: "chains",
    heading: "The chains",
    rankedEntries: rankedChains.map(toChainEntry),
    benchEntries: benchChains.map(toChainEntry),
  },
};

export const fryArtPathFor = (entry: FryEntry): string => `/blog/fry-${entry.artShapeId}.svg`;

export const fryListIds = Object.keys(fryLists) as [FryListId, ...FryListId[]];

export const maxEntriesPerFryList = Math.max(
  ...Object.values(fryLists).map((list) => list.rankedEntries.length + list.benchEntries.length),
);

export function isCompleteFryOrder(list: FryList, orderedEntryIds: string[]): boolean {
  const knownEntryIds = new Set([...list.rankedEntries, ...list.benchEntries].map((entry) => entry.id));
  const distinctOrderedIds = new Set(orderedEntryIds);
  return (
    distinctOrderedIds.size === orderedEntryIds.length &&
    orderedEntryIds.every((entryId) => knownEntryIds.has(entryId)) &&
    list.rankedEntries.every((entry) => distinctOrderedIds.has(entry.id))
  );
}
