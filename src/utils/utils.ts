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

function getSectionMultiplier(
  paddlerRow: number,
  targetRow: number,
  numRows: number,
): number {
  const rowsPerSection = numRows / 3;

  let section: "front" | "middle" | "back";
  if (paddlerRow <= rowsPerSection) {
    section = "front";
  } else if (paddlerRow <= rowsPerSection * 2) {
    section = "middle";
  } else {
    section = "back";
  }

  const strategy = {
    front: 1.2,
    middle: 1.5,
    back: 1.0,
  };

  return strategy[section];
}

//power multiplier = 2
//balance multiplier = 1.5
//fBscore multiplier = 1
//happiness multiplier = 1
//Score = (Power × 2) - (Balance × 1.5) - (FBscore × 1) + (Happiness × 1)
export const generateScore = (
  paddler: Paddler,
  targetRow: number,
  numRows: number,
  left: SideArray,
  right: SideArray,
): number => {
  const powerMultiplier = 2;
  const balanceMultiplier = 1.5;
  const fbScoreMultiplier = 1;
  const happinessMultiplier = 1;

  const weightImbalance = Math.abs(sumSideWeight(left) - sumSideWeight(right));

  const com = getCenterOfMass(left, right, numRows);
  const comDistance = Math.abs(com - targetRow);

  // Determine which side the paddler is actually placed on
  const isOnLeft = left.indexOf(paddler) !== -1;
  const isOnRight = right.indexOf(paddler) !== -1;
  const actualSide = isOnLeft ? "left" : isOnRight ? "right" : null;

  // Check if paddler is on their preferred side
  const isOnPreferredSide =
    paddler.side === "both" ||
    (paddler.side === "left" && actualSide === "left") ||
    (paddler.side === "right" && actualSide === "right");
  const sidePenalty = isOnPreferredSide ? 0 : 0.15;
  const effectivePower = paddler.power * (1 - sidePenalty);

  let paddlerRow = left.indexOf(paddler);
  if (paddlerRow === -1) {
    paddlerRow = right.indexOf(paddler);
  }
  const sectionMultiplier = getSectionMultiplier(
    paddlerRow,
    targetRow,
    numRows,
  );
  const weightedPower = effectivePower * sectionMultiplier;

  const happiness = isOnPreferredSide ? 1 : 0;

  const powerScore = weightedPower * powerMultiplier;
  const balancePenalty = weightImbalance * balanceMultiplier;
  const comPenalty = comDistance * fbScoreMultiplier;
  const happinessBonus = happiness * happinessMultiplier;
  const finalScore = powerScore - balancePenalty - comPenalty + happinessBonus;

  console.log(`[generateScore] ${paddler.name}:`, {
    preferredSide: paddler.side,
    actualSide,
    isOnPreferredSide,
    sidePenalty: sidePenalty * 100 + "%",
    basePower: paddler.power,
    effectivePower: effectivePower.toFixed(2),
    paddlerRow,
    sectionMultiplier,
    weightedPower: weightedPower.toFixed(2),
    weightImbalance: weightImbalance.toFixed(2),
    com,
    comDistance: comDistance.toFixed(2),
    targetRow,
    happiness,
    scoreBreakdown: {
      powerScore: powerScore.toFixed(2),
      balancePenalty: `-${balancePenalty.toFixed(2)}`,
      comPenalty: `-${comPenalty.toFixed(2)}`,
      happinessBonus: `+${happinessBonus.toFixed(2)}`,
      finalScore: finalScore.toFixed(2),
    },
  });

  return finalScore;
};

/**
 * Greedy algorithm to find the optimal position of a paddler, respecting
 * their side preference.
 *
 *
 * Fills seat, then checks weight balance + boat's center of mass.
 *
 * Lower score is better, since that means placing a paddler there gets the
 * boat closer to the desired target.
 *
 * TODO: Factor paddler height and power level.
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
      `\n[generateLineup] Evaluating paddler: ${paddler.name} (weight: ${paddler.weight}, power: ${paddler.power}, side: ${paddler.side})`,
    );

    const candidatePositions: Array<{
      side: "left" | "right";
      index: number;
      score: number;
    }> = [];

    for (let i = 0; i < numRows; i++) {
      if ((paddler.side === "left" || paddler.side === "both") && !left[i]) {
        const tempLeft = [...left];
        tempLeft[i] = paddler;
        const score = generateScore(
          paddler,
          targetRow,
          numRows,
          tempLeft,
          right,
        );
        candidatePositions.push({ side: "left", index: i, score });
      }

      if ((paddler.side === "right" || paddler.side === "both") && !right[i]) {
        const tempRight = [...right];
        tempRight[i] = paddler;
        const score = generateScore(
          paddler,
          targetRow,
          numRows,
          left,
          tempRight,
        );
        candidatePositions.push({ side: "right", index: i, score });
      }
    }

    // There are no more spots left on the boat.
    if (candidatePositions.length === 0) {
      console.log(
        `[generateLineup] No available positions for ${paddler.name}`,
      );
      continue;
    }

    // Get their best position (greedy) - higher score is better.
    candidatePositions.sort((a, b) => b.score - a.score);
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
