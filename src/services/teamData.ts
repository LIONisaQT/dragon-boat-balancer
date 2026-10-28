import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { Paddler, StoredCrew } from "../types";

export function subscribeToTeamCrews(
  teamId: string,
  onCrews: (crews: StoredCrew[]) => void,
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
            }) as StoredCrew,
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
  const crew: StoredCrew = {
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

export async function copyTeamCrew(
  teamId: string,
  crew: StoredCrew,
): Promise<void> {
  const crewRef = doc(collection(db, "teams", teamId, "crews"));
  const copiedCrew: StoredCrew = {
    ...crew,
    id: crewRef.id,
    name: `Copy of ${crew.name}`,
    leftSide: [...crew.leftSide],
    rightSide: [...crew.rightSide],
    roster: [...crew.roster],
  };

  await setDoc(crewRef, copiedCrew);
}

export async function deleteTeamCrew(
  teamId: string,
  crewId: string,
): Promise<void> {
  const crewRef = doc(db, "teams", teamId, "crews", crewId);
  await deleteDoc(crewRef);
}

export async function createTeamPaddler(
  teamId: string,
  paddler: Paddler,
): Promise<void> {
  const paddlerRef = doc(db, "teams", teamId, "paddlers", paddler.id);
  await setDoc(paddlerRef, paddler);
}

export async function updateTeamCrew(
  teamId: string,
  crew: StoredCrew,
): Promise<void> {
  const crewRef = doc(db, "teams", teamId, "crews", crew.id);
  await updateDoc(crewRef, crew);
}

export async function deleteTeamPaddlers(
  teamId: string,
  paddlers: Paddler[],
): Promise<void> {
  const paddlerIds = new Set(paddlers.map((paddler) => paddler.id));
  if (paddlerIds.size === 0) return;

  const crewsRef = collection(db, "teams", teamId, "crews");
  const crewsSnapshot = await getDocs(crewsRef);
  const crewUpdates = crewsSnapshot.docs.flatMap((crewDoc) => {
    const crew = crewDoc.data() as StoredCrew;
    const roster = crew.roster.filter(
      (paddlerId) => !paddlerIds.has(paddlerId),
    );
    const leftSide = crew.leftSide.map((paddlerId) =>
      paddlerId && paddlerIds.has(paddlerId) ? null : paddlerId,
    );
    const rightSide = crew.rightSide.map((paddlerId) =>
      paddlerId && paddlerIds.has(paddlerId) ? null : paddlerId,
    );
    const drum = crew.drum && paddlerIds.has(crew.drum) ? null : crew.drum;
    const steer = crew.steer && paddlerIds.has(crew.steer) ? null : crew.steer;

    const changed =
      roster.length !== crew.roster.length ||
      leftSide.some((paddler, index) => paddler !== crew.leftSide[index]) ||
      rightSide.some((paddler, index) => paddler !== crew.rightSide[index]) ||
      drum !== crew.drum ||
      steer !== crew.steer;

    return changed
      ? [
          {
            ref: crewDoc.ref,
            data: { roster, leftSide, rightSide, drum, steer },
          },
        ]
      : [];
  });

  for (let offset = 0; offset < crewUpdates.length; offset += 500) {
    const batch = writeBatch(db);
    crewUpdates.slice(offset, offset + 500).forEach(({ ref, data }) => {
      batch.update(ref, data);
    });
    await batch.commit();
  }

  const paddlersRef = collection(db, "teams", teamId, "paddlers");
  const paddlersSnapshot = await getDocs(paddlersRef);
  const paddlerDocsToDelete = paddlersSnapshot.docs.filter(
    (paddlerDoc) =>
      paddlerIds.has(paddlerDoc.id) ||
      paddlerIds.has((paddlerDoc.data() as Paddler).id),
  );

  for (let offset = 0; offset < paddlerDocsToDelete.length; offset += 500) {
    const batch = writeBatch(db);
    paddlerDocsToDelete.slice(offset, offset + 500).forEach((paddlerDoc) => {
      batch.delete(paddlerDoc.ref);
    });
    await batch.commit();
  }
}
