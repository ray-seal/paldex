import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pals = JSON.parse(readFileSync(new URL("../src/data/pals.json", import.meta.url), "utf8"));
const data = JSON.parse(readFileSync(new URL("../src/data/breeding.json", import.meta.url), "utf8"));
const byId = new Map(pals.map(pal => [pal.gameId, pal]));
const pairKey = (a, b) => [a, b].sort().join("|");
const specialByPair = new Map();

for (const combo of data.specialCombos) {
  assert.ok(combo.parents.every(id => byId.has(id)), `Unknown parent in recipe: ${combo.parents.join(" + ")}`);
  assert.ok(byId.has(combo.child), `Unknown child in recipe: ${combo.child}`);
  const key = pairKey(...combo.parents);
  if (!specialByPair.has(key)) specialByPair.set(key, []);
  specialByPair.get(key).push(combo.child);
}

const specialChildIds = new Set(data.specialCombos.map(combo => combo.child));
const childPool = pals
  .filter(pal => pal.breedableAsChild && !specialChildIds.has(pal.gameId))
  .sort((a, b) => a.combiRank - b.combiRank
    || (a.breedOrder ?? 999999999) - (b.breedOrder ?? 999999999)
    || a.gameId.localeCompare(b.gameId));

assert.equal(data.gameVersion, "1.0.5");
assert.equal(childPool.length, 184, "The 1.0.5 ordinary breeding pool should contain 184 Pals.");

function offspring(parentA, parentB) {
  const special = specialByPair.get(pairKey(parentA, parentB));
  if (special?.length) return special;
  if (parentA === parentB && byId.get(parentA)?.breedableAsChild) return [parentA];

  const a = byId.get(parentA);
  const b = byId.get(parentB);
  assert.ok(a && b, "Both parents must exist in the Pal roster.");
  const targetRank = Math.floor((a.combiRank + b.combiRank + 1) / 2);
  let low = 0;
  let high = childPool.length;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (childPool[middle].combiRank < targetRank) low = middle + 1;
    else high = middle;
  }

  if (low === 0) return [childPool[0].gameId];
  if (low === childPool.length) return [childPool.at(-1).gameId];

  const lower = childPool[low - 1];
  const upper = childPool[low];
  const best = targetRank - lower.combiRank < upper.combiRank - targetRank ? lower : upper;
  return [best.gameId];
}

const cases = [
  ["lazydragon", "eleccat", "lazydragon_electric", "Relaxaurus + Sparkit => Relaxaurus Lux"],
  ["captainpenguin", "ronin", "whitemoth", "Penking + Bushi => Sibelyx"],
  ["grassgolem", "kingbahamut", "anubis", "Dualith + Blazamut => Anubis"],
  ["tentacleturtle", "domearmordragon", "ghostrabbit", "Turtacle + Aegidron tie => Nitemary"],
];

for (const [a, b, expected, label] of cases) {
  assert.ok(offspring(a, b).includes(expected), label);
  console.log(`PASS ${label}`);
}

console.log(`PASS ${pals.length} Pal records, ${data.specialCombos.length} recipes, ${childPool.length} ordinary child candidates.`);
