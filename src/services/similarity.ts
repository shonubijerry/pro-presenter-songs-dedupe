import type { DuplicateGroup, SongFeature } from "../types";

export function buildFeature(fileName: string, rawText: string): SongFeature {
  const normalizedLines = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim().toLowerCase().replace(/\s+/g, " "))
    .filter(Boolean);
  const normalizedText = normalizedLines.join("\n");
  const lineFreq = buildFrequency(normalizedLines);
  const bigramFreq = buildBigramFrequency(normalizedText);
  const bigramCount = countFrequencyItems(bigramFreq);

  return {
    fileName,
    rawText,
    normalizedLines,
    normalizedText,
    lineCount: normalizedLines.length,
    lineFreq,
    bigramCount,
    bigramFreq,
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

  for (let i = 0; i < count; i += 1) {
    for (let j = i + 1; j < count; j += 1) {
      if (!canReachThreshold(songs[i], songs[j], threshold)) {
        continue;
      }

      const score = similarityScore(songs[i], songs[j]);
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
        score: songIndex === anchor ? 1 : similarityScore(songs[anchor], songs[songIndex]),
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

  const lineRatio = multisetDiceFromFreq(left.lineFreq, left.lineCount, right.lineFreq, right.lineCount);
  const textRatio =
    left.bigramCount === 0 || right.bigramCount === 0
      ? left.normalizedText === right.normalizedText
        ? 1
        : 0
      : multisetDiceFromFreq(left.bigramFreq, left.bigramCount, right.bigramFreq, right.bigramCount);

  return (lineRatio + textRatio) / 2;
}

function canReachThreshold(left: SongFeature, right: SongFeature, threshold: number): boolean {
  const maxLineRatio = maxDiceByCount(left.lineCount, right.lineCount);
  const maxAverageFromLineBound = (maxLineRatio + 1) / 2;
  if (maxAverageFromLineBound < threshold) {
    return false;
  }

  const maxTextRatio = maxDiceByCount(left.bigramCount, right.bigramCount);
  const maxAverageFromTextBound = (1 + maxTextRatio) / 2;
  if (maxAverageFromTextBound < threshold) {
    return false;
  }

  return true;
}

function maxDiceByCount(leftCount: number, rightCount: number): number {
  const total = leftCount + rightCount;
  if (total === 0) {
    return 1;
  }

  return (2 * Math.min(leftCount, rightCount)) / total;
}

/** 2*|multiset intersection| / (|a| + |b|) — matches Python SequenceMatcher on lists */
function multisetDiceFromFreq(
  leftFreq: Map<string, number>,
  leftCount: number,
  rightFreq: Map<string, number>,
  rightCount: number,
): number {
  const total = leftCount + rightCount;
  if (total === 0) {
    return 1;
  }

  const [smaller, larger] =
    leftFreq.size <= rightFreq.size ? [leftFreq, rightFreq] : [rightFreq, leftFreq];

  let intersection = 0;
  for (const [item, count] of smaller) {
    const otherCount = larger.get(item) ?? 0;
    intersection += Math.min(count, otherCount);
  }

  return (2 * intersection) / total;
}

function buildFrequency(items: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const item of items) {
    freq.set(item, (freq.get(item) ?? 0) + 1);
  }
  return freq;
}

function buildBigramFrequency(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  if (text.length < 2) {
    return freq;
  }

  for (let i = 0; i < text.length - 1; i += 1) {
    const bigram = text.slice(i, i + 2);
    freq.set(bigram, (freq.get(bigram) ?? 0) + 1);
  }

  return freq;
}

function countFrequencyItems(freq: Map<string, number>): number {
  let total = 0;
  for (const count of freq.values()) {
    total += count;
  }
  return total;
}
