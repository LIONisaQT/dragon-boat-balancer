import { Crew, Paddler } from "../../types";

const samePaddlerIds = (
  current: Array<Paddler | null>,
  updated: Array<Paddler | null>,
): boolean =>
  current.length === updated.length &&
  current.every((paddler, index) => paddler?.id === updated[index]?.id);

export function hasCrewChanged(current: Crew, updated: Crew): boolean {
  return (
    current.id !== updated.id ||
    current.name !== updated.name ||
    current.numRows !== updated.numRows ||
    current.centerMass !== updated.centerMass ||
    !samePaddlerIds(current.roster, updated.roster) ||
    !samePaddlerIds(current.leftSide, updated.leftSide) ||
    !samePaddlerIds(current.rightSide, updated.rightSide) ||
    current.drum?.id !== updated.drum?.id ||
    current.steer?.id !== updated.steer?.id
  );
}
