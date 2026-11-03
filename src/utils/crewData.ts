import { Crew, Paddler, StoredCrew } from "../types";

export function resolveCrew(
  crew: StoredCrew,
  paddlersById: Map<string, Paddler>,
): { crew: Crew; missingPaddlerIds: string[] } {
  const missingPaddlerIds = new Set<string>();
  const resolvePaddler = (paddlerId: string): Paddler => {
    const paddler = paddlersById.get(paddlerId);
    if (!paddler) missingPaddlerIds.add(paddlerId);
    return (
      paddler ?? {
        id: paddlerId,
        name: "",
        side: "both",
        power: 0,
        weight: 0,
        height: 0,
      }
    );
  };

  return {
    crew: {
      ...crew,
      roster: crew.roster.map(resolvePaddler),
      leftSide: crew.leftSide.map((id) => (id ? resolvePaddler(id) : null)),
      rightSide: crew.rightSide.map((id) => (id ? resolvePaddler(id) : null)),
      drum: crew.drum ? resolvePaddler(crew.drum) : null,
      steer: crew.steer ? resolvePaddler(crew.steer) : null,
    },
    missingPaddlerIds: [...missingPaddlerIds],
  };
}

export function storeCrew(crew: Crew): StoredCrew {
  return {
    ...crew,
    roster: crew.roster.map((paddler) => paddler.id),
    leftSide: crew.leftSide.map((paddler) => paddler?.id ?? null),
    rightSide: crew.rightSide.map((paddler) => paddler?.id ?? null),
    drum: crew.drum?.id ?? null,
    steer: crew.steer?.id ?? null,
  };
}
