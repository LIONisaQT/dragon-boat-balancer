import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { Crew, Paddler } from "../types";

export function subscribeToTeamCrews(
  teamId: string,
  onCrews: (crews: Crew[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const crewsRef = collection(db, "teams", teamId, "crews");

  return onSnapshot(
    crewsRef,
    (snapshot) => {
      onCrews(
        snapshot.docs.map(
          (crewDoc) =>
            ({
              ...crewDoc.data(),
              id: crewDoc.id,
            }) as Crew,
        ),
      );
    },
    onError,
  );
}

export function subscribeToTeamPaddlers(
  teamId: string,
  onPaddlers: (paddlers: Paddler[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const paddlersRef = collection(db, "teams", teamId, "paddlers");

  return onSnapshot(
    paddlersRef,
    (snapshot) => {
      onPaddlers(
        snapshot.docs.map(
          (paddlerDoc) =>
            ({
              ...paddlerDoc.data(),
              id: paddlerDoc.id,
            }) as Paddler,
        ),
      );
    },
    onError,
  );
}

export async function createTeamCrew(teamId: string): Promise<void> {
  const crewRef = doc(collection(db, "teams", teamId, "crews"));
  const crew: Crew = {
    id: crewRef.id,
    name: "Crew",
    numRows: 10,
    centerMass: 0,
    leftSide: Array(10).fill(null),
    rightSide: Array(10).fill(null),
    drum: null,
    steer: null,
    roster: [],
  };

  await setDoc(crewRef, crew);
}

export async function createTeamPaddler(teamId: string): Promise<void> {
  const paddlerRef = doc(collection(db, "teams", teamId, "paddlers"));
  const paddler: Paddler = {
    id: paddlerRef.id,
    name: "Paddler",
    side: "both",
    power: 0,
    weight: 0,
    height: 0,
  };

  await setDoc(paddlerRef, paddler);
}
