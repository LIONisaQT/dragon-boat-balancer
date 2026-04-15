export type Paddler = {
  id: string;
  name: string;
  side: "left" | "right" | "both";
  power: number;
  weight: number;
  height: number;
};

export type PaddlerLocation = "left" | "right" | "drum" | "steer" | "roster";

export type PaddlerPosition = number | "drum" | "steer";

export type SideArray = (Paddler | null)[];

export type Roster = {
  id: string;
  name: string;
  paddlers: Paddler[];
};

export type Crew = {
  id: string;
  name: string;
  numRows: number;
  centerMass: number;
  leftSide: SideArray;
  rightSide: SideArray;
  drum: Paddler | null;
  steer: Paddler | null;
  roster: Paddler[];
};

export type BoatPaddler = {
  details: Paddler;
  location: PaddlerLocation;
  position: PaddlerPosition;
};
