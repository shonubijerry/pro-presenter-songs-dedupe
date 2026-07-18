import type { DuplicateGroup, SongFeature } from "../types";

export function buildFeature(fileName: string, rawText: string): SongFeature {
  const normalizedLines = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim().toLowerCase().replace(/\s+/g, " "))
    .filter(Boolean);

  return {
    fileName,
    rawText,
    normalizedLines,
    lineCount: normalizedLines.length,
  };
}

export function buildDuplicateGroups(songs: SongFeature[], threshold: number): DuplicateGroup[] {
  const count = songs.length;
  const parent = new Array<number>(count).fill(0).map((_, index) => index);

  const find = (value: number): number => {
    while (parent[value] !== value) {
      parent[value] = parent[parent[value]];
      value = parent[value];
    }
    return value;
  };

  const union = (left: number, right: number): void => {
    const rootLeft = find(left);
    const rootRight = find(right);
    if (rootLeft !== rootRight) {
      parent[rootRight] = rootLeft;
    }
  };

  const scoreMatrix: number[][] = new Array(count);
  for (let i = 0; i < count; i += 1) {
    scoreMatrix[i] = new Array(count).fill(0);
    scoreMatrix[i][i] = 1;
  }

  for (let i = 0; i < count; i += 1) {
    for (let j = i + 1; j < count; j += 1) {
      const score = similarityScore(songs[i], songs[j]);
      scoreMatrix[i][j] = score;
      scoreMatrix[j][i] = score;
      if (score >= threshold) {
        union(i, j);
      }
    }
  }

  const grouped = new Map<number, number[]>();
  for (let index = 0; index < count; index += 1) {
    const root = find(index);
    const list = grouped.get(root) ?? [];
    list.push(index);
    grouped.set(root, list);
  }

  const duplicates: DuplicateGroup[] = [];
  for (const memberIndexes of grouped.values()) {
    if (memberIndexes.length < 2) {
      continue;
    }

    const anchor = memberIndexes[0];
    const members = memberIndexes
      .map((songIndex) => ({
        fileName: songs[songIndex].fileName,
        score: songIndex === anchor ? 1 : scoreMatrix[anchor][songIndex],
      }))
      .sort((left, right) => right.score - left.score);

    duplicates.push({ members });
  }

  return duplicates;
}

export function chooseKeptFiles(songs: SongFeature[], groups: DuplicateGroup[]): Set<string> {
  const duplicateNames = new Set<string>();
  const keepSet = new Set<string>();

  for (const group of groups) {
    const sorted = [...group.members].sort((left, right) => right.score - left.score);
    if (sorted.length > 0) {
      keepSet.add(sorted[0].fileName);
    }
    for (const member of sorted.slice(1)) {
      duplicateNames.add(member.fileName);
    }
  }

  for (const song of songs) {
    if (!duplicateNames.has(song.fileName)) {
      keepSet.add(song.fileName);
    }
  }

  return keepSet;
}

/**
 * Port of Python's difflib.SequenceMatcher approach:
 *   line_ratio = SequenceMatcher(None, lines_a, lines_b).ratio()
 *   text_ratio = SequenceMatcher(None, joined_a, joined_b).ratio()
 *   score      = (line_ratio + text_ratio) / 2
 *
 * SequenceMatcher.ratio() = 2*M / T where M = matching elements, T = total elements.
 * We approximate this with a multiset-intersection Dice coefficient.
 */
function similarityScore(left: SongFeature, right: SongFeature): number {
  if (left.lineCount === 0 || right.lineCount === 0) {
    return 0;
  }
  const lineRatio = multisetDice(left.normalizedLines, right.normalizedLines);
  const textRatio = bigramDice(left.normalizedLines.join("\n"), right.normalizedLines.join("\n"));
  return (lineRatio + textRatio) / 2;
}

/** 2*|multiset intersection| / (|a| + |b|) — matches Python SequenceMatcher on lists */
function multisetDice(a: string[], b: string[]): number {
  if (a.length + b.length === 0) return 1;
  const freq = new Map<string, number>();
  for (const item of a) freq.set(item, (freq.get(item) ?? 0) + 1);
  let matches = 0;
  for (const item of b) {
    const n = freq.get(item) ?? 0;
    if (n > 0) { matches++; freq.set(item, n - 1); }
  }
  return (2 * matches) / (a.length + b.length);
}

/** Bigram Dice coefficient — approximates Python SequenceMatcher on joined text */
function bigramDice(a: string, b: string): number {
  if (a.length + b.length < 4) return a === b ? 1 : 0;
  const freq = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const bg = a.slice(i, i + 2);
    freq.set(bg, (freq.get(bg) ?? 0) + 1);
  }
  let intersection = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.slice(i, i + 2);
    const n = freq.get(bg) ?? 0;
    if (n > 0) { intersection++; freq.set(bg, n - 1); }
  }
  const totalA = Math.max(0, a.length - 1);
  const totalB = Math.max(0, b.length - 1);
  return (2 * intersection) / (totalA + totalB);
}
