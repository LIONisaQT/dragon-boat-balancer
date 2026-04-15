import "./App.scss";
import CrewList from "./components/CrewList/CrewList";
import CrewManager from "./components/CrewManager/CrewManager";
import { Crew } from "./types";
import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import useTheme from "./hooks/useTheme";

export default function App() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [activeCrews, setActiveCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleTheme, getThemeSVG } = useTheme();

  const [seenCrewIds, setSeenCrewIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("seenCrewIds");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Deduplicate immediately on load
      return Array.isArray(parsed) ? [...new Set(parsed)] : [];
    } catch {
      console.error("Failed to parse seenCrewIds from localStorage");
      return [];
    }
  });

  useEffect(() => {
    const saved = localStorage.getItem("seenCrewIds");
    if (saved) {
      try {
        const ids: string[] = JSON.parse(saved);
        // Remove duplicates before setting
        setSeenCrewIds([...new Set(ids)]);
      } catch (err) {
        console.error("Failed to parse seenCrewIds from localStorage:", err);
        setSeenCrewIds([]);
      }
    }
  }, []);

  useEffect(() => {
    const uniqueIds = [...new Set(seenCrewIds)];
    if (uniqueIds.length !== seenCrewIds.length) {
      setSeenCrewIds(uniqueIds);
      return;
    }

    localStorage.setItem("seenCrewIds", JSON.stringify(uniqueIds));

    if (uniqueIds.length === 0) {
      setCrews([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const batches: string[][] = [];
    for (let i = 0; i < uniqueIds.length; i += 10) {
      batches.push(uniqueIds.slice(i, i + 10));
    }

    const unsubscribes: (() => void)[] = [];

    batches.forEach((batch) => {
      const crewsRef = collection(db, "crews");
      const q = query(crewsRef, where(documentId(), "in", batch));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const foundIds = snapshot.docs.map((doc) => doc.id);
          const missingIds = batch.filter((id) => !foundIds.includes(id));

          // Only remove missing IDs if the snapshot was successful
          if (missingIds.length > 0) {
            setSeenCrewIds((prev) => {
              const filtered = prev.filter((id) => !missingIds.includes(id));
              localStorage.setItem("seenCrewIds", JSON.stringify(filtered));
              return filtered;
            });
          }

          setCrews((prev) => {
            const existing = prev.filter((c) => !batch.includes(c.id));
            const batchData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Crew[];
            return [...existing, ...batchData];
          });
          setLoading(false);
        },
        (err) => {
          console.error("Firestore snapshot failed:", err);
          // Do NOT remove any IDs on error
          setLoading(false);
        },
      );

      unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [seenCrewIds]);

  const onViewClicked = (crew: Crew) => {
    setActiveCrews((prev) => [...prev, crew]);
  };

  const onDeleteClicked = async (crewId: string) => {
    try {
      const crewRef = doc(db, "crews", crewId);
      await deleteDoc(crewRef);
      setSeenCrewIds((prev) => prev.filter((id) => id !== crewId));
    } catch (err) {
      console.error("Error deleting crew:", err);
      alert("Failed to delete crew");
    }
  };

  const onCreateClicked = async (crew?: Crew) => {
    const newId = crypto.randomUUID();

    const newCrew: Crew = {
      id: newId,
      name: crew ? `Copy of ${crew.name}` : "New crew",
      numRows: crew?.numRows ?? 10,
      centerMass: crew?.centerMass ?? 5,
      leftSide: crew?.leftSide ?? Array(10).fill(null),
      rightSide: crew?.rightSide ?? Array(10).fill(null),
      drum: crew?.drum ?? null,
      steer: crew?.steer ?? null,
      roster: crew?.roster ?? [],
    };

    try {
      // addDoc() automatically generates an ID if you omit one
      await setDoc(doc(db, "crews", newCrew.id), newCrew);

      if (!seenCrewIds.includes(newCrew.id)) {
        const updatedIds = [...seenCrewIds, newCrew.id];
        setSeenCrewIds(updatedIds);
      }
    } catch (err) {
      console.error("Error adding crew:", err);
      throw err;
    }
  };

  const onEditCrew = useCallback(async (updatedCrew: Crew) => {
    try {
      const crewRef = doc(db, "crews", updatedCrew.id);
      await updateDoc(crewRef, updatedCrew);
      console.log(`Crew ${updatedCrew.id} updated successfully`);
    } catch (err) {
      console.error("Error editing crew:", err);
      throw err;
    }
  }, []);

  const onCloseClicked = (crew: Crew) => {
    setActiveCrews((prev) => prev.filter((c) => c.id !== crew.id));
  };

  if (loading) {
    return (
      <div>
        <h2>Getting data...</h2>
      </div>
    );
  }

  return (
    <>
      <div className="header">
        <h1 className="title">Dragon Boat Balancer</h1>
        <button className="toggle-theme" onClick={toggleTheme}>
          {getThemeSVG()}
        </button>
      </div>
      {activeCrews.length === 0 && (
        <CrewList
          data={crews}
          setCrewIds={setSeenCrewIds}
          onView={onViewClicked}
          onCopy={onCreateClicked}
          onDelete={onDeleteClicked}
          onCreate={onCreateClicked}
        />
      )}
      <section className="active-crews">
        <>
          {activeCrews.map((crew, i) => (
            <CrewManager
              key={`${i}-${crew.id}`}
              crew={crew}
              onClose={onCloseClicked}
              onEdit={onEditCrew}
            />
          ))}
          {activeCrews.length > 0 && (
            <div className="crew-dropdown-container">
              <label htmlFor="crews">View another crew:</label>
              <select
                name="crews"
                id="crews"
                onChange={(e) => console.log(e.target.value)}
              >
                {crews
                  .filter((c) => !activeCrews.includes(c))
                  .map((crew, i) => (
                    <option key={`${i}-${crew.id}`} value={crew.id}>
                      {crew.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </>
      </section>
    </>
  );
}
