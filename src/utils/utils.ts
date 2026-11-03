import { Paddler, SideArray } from "../types";

export const sumSideWeight = (side: SideArray): number =>
  side.reduce((total, paddler) => total + (paddler?.weight ?? 0), 0);

export const getCenterOfMass = (
  left: SideArray,
  right: SideArray,
  rowSize: number,
): number => {
  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < rowSize; i++) {
    const leftPaddler = left[i];
    const rightPaddler = right[i];

    if (leftPaddler) {
      weightedSum += i * leftPaddler.weight;
      totalWeight += leftPaddler.weight;
    }

    if (rightPaddler) {
      weightedSum += i * rightPaddler.weight;
      totalWeight += rightPaddler.weight;
    }
  }

  if (totalWeight === 0) return 0;

  return Number((weightedSum / totalWeight + 1).toFixed(2));
};

export const generateScore = (
  paddler: Paddler,
  targetRow: number,
  numRows: number,
  left: SideArray,
  right: SideArray,
): number => {
  const balanceMultiplier = 1.5;

  const weightImbalance = Math.abs(sumSideWeight(left) - sumSideWeight(right));
  const com = getCenterOfMass(left, right, numRows);
  const comDistance = Math.abs(com - targetRow);
  const balancePenalty = weightImbalance * balanceMultiplier;
  const score = balancePenalty + comDistance;

  console.log(`[generateScore] ${paddler.name}:`, {
    weightImbalance: weightImbalance.toFixed(2),
    balancePenalty: balancePenalty.toFixed(2),
    com,
    comDistance: comDistance.toFixed(2),
    targetRow,
    score,
  });

  return score;
};

/**
 * Greedy algorithm that prioritizes weight balance, then side preference.
 *
 * Lower scores indicate better weight balance. Side preference is used only
 * to break ties between positions with the same score.
 *
 * @param {Paddler[]} roster - List of paddlers.
 * @param {number} targetRow - Row where center of mass is located at.
 * @param {number} numRows - Number of rows in the boat.
 */

export const generateLineup = (
  roster: Paddler[],
  targetRow: number,
  numRows: number,
): { left: SideArray; right: SideArray; remainingRoster: Paddler[] } => {
  console.log(`[generateLineup] Starting lineup generation:`, {
    rosterSize: roster.length,
    targetRow,
    numRows,
  });

  const left: SideArray = Array(numRows).fill(null);
  const right: SideArray = Array(numRows).fill(null);

  let available = [...roster];

  // Sort paddlers by weight since heavier weights influence center of mass more.
  const sortedPaddlers = [...available].sort((a, b) => b.weight - a.weight);

  for (const paddler of sortedPaddlers) {
    console.log(
      `\n[generateLineup] Evaluating paddler: ${paddler.name} (weight: ${paddler.weight}, side: ${paddler.side})`,
    );

    const candidatePositions: Array<{
      side: "left" | "right";
      index: number;
      score: number;
      sidePreferencePenalty: number;
    }> = [];

    for (let i = 0; i < numRows; i++) {
      if (!left[i]) {
        const tempLeft = [...left];
        tempLeft[i] = paddler;
        const score = generateScore(
          paddler,
          targetRow,
          numRows,
          tempLeft,
          right,
        );
        candidatePositions.push({
          side: "left",
          index: i,
          score,
          sidePreferencePenalty:
            paddler.side !== "both" && paddler.side !== "left" ? 1 : 0,
        });
      }

      if (!right[i]) {
        const tempRight = [...right];
        tempRight[i] = paddler;
        const score = generateScore(
          paddler,
          targetRow,
          numRows,
          left,
          tempRight,
        );
        candidatePositions.push({
          side: "right",
          index: i,
          score,
          sidePreferencePenalty:
            paddler.side !== "both" && paddler.side !== "right" ? 1 : 0,
        });
      }
    }

    // There are no more spots left on the boat.
    if (candidatePositions.length === 0) {
      console.log(
        `[generateLineup] No available positions for ${paddler.name}`,
      );
      continue;
    }

    // Weight balance wins; side preference breaks ties.
    candidatePositions.sort(
      (a, b) =>
        a.score - b.score || a.sidePreferencePenalty - b.sidePreferencePenalty,
    );
    const best = candidatePositions[0];

    console.log(
      `[generateLineup] Candidate positions for ${paddler.name}:`,
      candidatePositions
        .map((p) => `${p.side}[${p.index}]: ${p.score.toFixed(2)}`)
        .join(", "),
    );
    console.log(
      `[generateLineup] Selected position: ${best.side}[${
        best.index
      }] with score ${best.score.toFixed(2)}`,
    );

    if (best.side === "left") left[best.index] = paddler;
    else right[best.index] = paddler;

    // Remove paddler from available list.
    available = available.filter((p) => p.name !== paddler.name);
  }

  const finalLeftWeight = sumSideWeight(left);
  const finalRightWeight = sumSideWeight(right);
  const finalCom = getCenterOfMass(left, right, numRows);

  console.log(`\n[generateLineup] Lineup generation complete:`, {
    leftWeight: finalLeftWeight.toFixed(2),
    rightWeight: finalRightWeight.toFixed(2),
    weightDifference: Math.abs(finalLeftWeight - finalRightWeight).toFixed(2),
    centerOfMass: finalCom.toFixed(2),
    targetRow,
    comDistance: Math.abs(finalCom - targetRow).toFixed(2),
    remainingRoster: available.length,
  });

  return { left, right, remainingRoster: available };
};

export const sortRosterByWeight = (roster: Paddler[]): Paddler[] =>
  [...roster].sort((a, b) => b.weight - a.weight);

export const sortRosterBySide = (roster: Paddler[]): Paddler[] => {
  const sideOrder: Record<"left" | "right" | "both", number> = {
    left: 0,
    both: 1,
    right: 2,
  };
  return [...roster].sort((a, b) => sideOrder[a.side] - sideOrder[b.side]);
};

export const sanitizeText = (text: string): string =>
  text.replace(/[^a-zA-Z0-9\-'\s]/g, "").replace(/\s+/g, " ");

export function sanitizeNumber(
  value: string | number,
  min: number = 0,
  max: number = 999,
): number {
  const num = Number(value);
  if (isNaN(num) || num < min) return min;
  if (num > max) return max;
  return num;
}
