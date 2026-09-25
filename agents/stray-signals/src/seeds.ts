import type { Topic } from "./schema";

/**
 * Starting points for the crawl. Every host is verified on first run (its feed must
 * resolve); dead or off-topic ones are dropped automatically. Discovery then grows
 * the pool through Substack's "recommended by" graph, so this list only needs to
 * point the crawler in the right direction.
 */
export const SEEDS: { host: string; topics: Topic[] }[] = [
  // ideas & theories
  { host: "www.astralcodexten.com", topics: ["ideas", "science"] },
  { host: "www.experimental-history.com", topics: ["science", "ideas"] },
  { host: "www.theintrinsicperspective.com", topics: ["science", "philosophy"] },
  { host: "www.overcomingbias.com", topics: ["ideas", "thinking"] },
  { host: "www.gurwinder.blog", topics: ["psychology", "thinking"] },
  { host: "www.henrikkarlsson.xyz", topics: ["ideas", "philosophy"] },
  { host: "ianleslie.substack.com", topics: ["ideas"] },
  { host: "www.samkriss.com", topics: ["ideas", "philosophy"] },
  { host: "www.ageofinvention.xyz", topics: ["ideas", "science"] },
  // psychology, human nature & critical thinking
  { host: "paulbloom.substack.com", topics: ["psychology"] },
  { host: "www.robkhenderson.com", topics: ["psychology"] },
  { host: "www.optimallyirrational.com", topics: ["psychology", "thinking"] },
  { host: "www.everythingisbullshit.blog", topics: ["thinking", "psychology"] },
  // writing & reading
  { host: "www.commonreader.co.uk", topics: ["writing"] },
  { host: "katherinemay.substack.com", topics: ["writing", "nature"] },
  { host: "www.personalcanon.com", topics: ["writing", "ideas"] },
  { host: "georgesaunders.substack.com", topics: ["writing"] },
  // poetry
  { host: "maggiesmith.substack.com", topics: ["poetry", "writing"] },
  { host: "jamescrews.substack.com", topics: ["poetry"] },
  { host: "oxfordpoetry.substack.com", topics: ["poetry"] },
  { host: "ordinaryplots.substack.com", topics: ["poetry"] },
  // nature
  { host: "lauraerickson.substack.com", topics: ["nature"] },
  { host: "nerdyaboutnature.substack.com", topics: ["nature", "science"] },
  { host: "mycostories.substack.com", topics: ["nature", "science"] },
  { host: "www.thescrublands.com", topics: ["nature"] },
  // philosophy
  { host: "philosophybear.substack.com", topics: ["philosophy"] },
  { host: "theconvivialsociety.substack.com", topics: ["philosophy"] },
  { host: "justinehsmith.substack.com", topics: ["philosophy"] },
  { host: "agnescallard.substack.com", topics: ["philosophy"] },
  { host: "joecarlsmith.substack.com", topics: ["philosophy"] },
  { host: "www.honest-broker.com", topics: ["ideas", "philosophy"] },
  // money & economics
  { host: "www.noahpinion.blog", topics: ["money"] },
  { host: "www.netinterest.co", topics: ["money"] },
  { host: "kyla.substack.com", topics: ["money"] },
  { host: "www.apricitas.io", topics: ["money"] },
  { host: "adamtooze.substack.com", topics: ["money", "ideas"] },
  // science
  { host: "stuartritchie.substack.com", topics: ["science"] },
  { host: "erictopol.substack.com", topics: ["science"] },
  { host: "yourlocalepidemiologist.substack.com", topics: ["science"] },
  { host: "seantrott.substack.com", topics: ["science"] },
  { host: "davideagleman.substack.com", topics: ["science"] },
  { host: "thephysicsjournal.substack.com", topics: ["science", "space"] },
  // deep space
  { host: "startswithabang.substack.com", topics: ["space", "science"] },
  { host: "startalk.substack.com", topics: ["space", "science"] },
  { host: "www.thequantumcat.space", topics: ["space", "science"] },
  { host: "planetocracy.org", topics: ["space", "ideas"] },
  { host: "coreypowell.substack.com", topics: ["space", "science"] },
];

/**
 * Substack category leaderboards scanned for new publications, two pages per run,
 * rotating deeper each week. Subcategory filters are not supported by the endpoint,
 * so space writers are found through Science and the recommendation graph.
 */
export const CATEGORIES: { id: number; name: string; topics: Topic[] }[] = [
  { id: 134, name: "Science", topics: ["science", "space", "psychology"] },
  { id: 114, name: "Philosophy", topics: ["philosophy", "thinking"] },
  { id: 153, name: "Finance", topics: ["money"] },
  { id: 18, name: "History", topics: ["ideas"] },
  { id: 339, name: "Literature", topics: ["writing", "poetry"] },
  { id: 15414, name: "Climate & Environment", topics: ["nature"] },
];
