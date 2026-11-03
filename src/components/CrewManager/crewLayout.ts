import { Paddler, PaddlerLocation, SideArray } from "../../types";

type IndexedPaddlerLocation = Exclude<PaddlerLocation, "drum" | "steer">;

const isPaddler = (value: unknown): value is Paddler => {
  if (typeof value !== "object" || value === null) return false;
  const paddler = value as Record<string, unknown>;

  return (
    typeof paddler.id === "string" &&
    typeof paddler.name === "string" &&
    (paddler.side === "left" ||
      paddler.side === "right" ||
      paddler.side === "both") &&
    typeof paddler.power === "number" &&
    typeof paddler.weight === "number" &&
    typeof paddler.height === "number"
  );
};

const isPaddlerLocation = (value: unknown): value is PaddlerLocation =>
  value === "left" ||
  value === "right" ||
  value === "drum" ||
  value === "steer" ||
  value === "roster";

export type PaddlerDropData =
  | { location: IndexedPaddlerLocation; position: number }
  | { location: "drum"; position: "drum" }
  | { location: "steer"; position: "steer" };

export type PaddlerDragData = PaddlerDropData & { details: Paddler };

export function getPaddlerDragData(value: unknown): PaddlerDragData | null {
  if (typeof value !== "object" || value === null) return null;
  const data = value as Record<string, unknown>;

  if (!isPaddler(data.details)) return null;
  const dropData = getPaddlerDropData(value);
  return dropData ? { ...dropData, details: data.details } : null;
}

export function getPaddlerDropData(value: unknown): PaddlerDropData | null {
  if (typeof value !== "object" || value === null) return null;
  const data = value as Record<string, unknown>;

  if (!isPaddlerLocation(data.location)) return null;

  if (data.location === "drum") {
    return data.position === "drum"
      ? { location: "drum", position: "drum" }
      : null;
  }
  if (data.location === "steer") {
    return data.position === "steer"
      ? { location: "steer", position: "steer" }
      : null;
  }

  return typeof data.position === "number" &&
    Number.isInteger(data.position) &&
    data.position >= 0
    ? { location: data.location, position: data.position }
    : null;
}

export function getCrewPaddlers(
  roster: Paddler[],
  leftSide: SideArray,
  rightSide: SideArray,
  drum: Paddler | null,
  steer: Paddler | null,
): Paddler[] {
  const members = [
    ...roster,
    ...leftSide.filter((paddler): paddler is Paddler => paddler !== null),
    ...rightSide.filter((paddler): paddler is Paddler => paddler !== null),
    ...(drum ? [drum] : []),
    ...(steer ? [steer] : []),
  ];
  const uniqueMembers = new Map<string, Paddler>();
  members.forEach((paddler) => uniqueMembers.set(paddler.id, paddler));
  return [...uniqueMembers.values()];
}

export function resizeSide(
  side: SideArray,
  numRows: number,
): { side: SideArray; removed: Paddler[] } {
  let resized = side;
  let removed: Paddler[] = [];

  if (numRows > resized.length) {
    resized = [...resized, ...Array(numRows - resized.length).fill(null)];
  } else if (numRows < resized.length) {
    removed = resized
      .slice(numRows)
      .filter((paddler): paddler is Paddler => paddler !== null);
    resized = resized.slice(0, numRows);
  }

  return { side: resized, removed };
}

export function getRecalledRoster(
  roster: Paddler[],
  leftSide: SideArray,
  rightSide: SideArray,
  drum: Paddler | null,
  steer: Paddler | null,
): Paddler[] {
  return [
    ...roster,
    ...leftSide.filter((paddler): paddler is Paddler => paddler !== null),
    ...rightSide.filter((paddler): paddler is Paddler => paddler !== null),
    ...(drum ? [drum] : []),
    ...(steer ? [steer] : []),
  ];
}

export function removePaddlerFromSide(
  side: SideArray,
  paddler: Paddler,
  position: number,
): SideArray {
  const updatedSide = [...side];
  if (updatedSide[position]?.id === paddler.id) {
    updatedSide[position] = null;
  } else {
    const index = updatedSide.findIndex(
      (current) => current?.id === paddler.id,
    );
    if (index !== -1) updatedSide[index] = null;
  }
  return updatedSide;
}

export function placePaddlerInSide(
  side: SideArray,
  paddler: Paddler,
  position: number,
): SideArray {
  const updatedSide = [...side];
  const existingIndex = updatedSide.findIndex(
    (current) => current?.id === paddler.id,
  );
  updatedSide[existingIndex === -1 ? position : existingIndex] = paddler;
  return updatedSide;
}

export function insertPaddlerInRoster(
  roster: Paddler[],
  paddler: Paddler,
  position: number,
): Paddler[] {
  const existingIndex = roster.findIndex(
    (current) => current.id === paddler.id,
  );
  const updatedRoster = [...roster];

  if (existingIndex !== -1) updatedRoster[existingIndex] = paddler;
  else updatedRoster.splice(position, 0, paddler);

  return updatedRoster;
}
