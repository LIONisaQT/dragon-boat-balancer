import { useEffect, useState } from "react";
import "./DragonBoat.scss";
import { Crew, Paddler } from "./types";
import {
  createTeamCrew,
  createTeamPaddler,
  subscribeToTeamCrews,
  subscribeToTeamPaddlers,
} from "./services/teamData";

function DragonBoat() {
  const [teamId, setTeamId] = useState("");
  const [crews, setCrews] = useState<Crew[]>([]);
  const [paddlers, setPaddlers] = useState<Paddler[]>([]);

  useEffect(() => {
    const localId = localStorage.getItem("localTeamId") ?? crypto.randomUUID();
    setTeamId(localId);
    localStorage.setItem("localTeamId", localId);
  }, []);

  useEffect(() => {
    if (!teamId) return;

    setCrews([]);
    setPaddlers([]);

    const unsubscribeCrews = subscribeToTeamCrews(teamId, setCrews, (error) =>
      console.error(`Failed to load crews for team ${teamId}:`, error),
    );
    const unsubscribePaddlers = subscribeToTeamPaddlers(
      teamId,
      setPaddlers,
      (error) =>
        console.error(`Failed to load paddlers for team ${teamId}:`, error),
    );

    return () => {
      unsubscribeCrews();
      unsubscribePaddlers();
    };
  }, [teamId]);

  const addCrew = async () => {
    if (!teamId) return;

    try {
      await createTeamCrew(teamId);
    } catch (error) {
      console.error(`Failed to create crew for team ${teamId}:`, error);
      alert("Failed to create crew");
    }
  };

  const addPaddler = async () => {
    if (!teamId) return;

    try {
      await createTeamPaddler(teamId);
    } catch (error) {
      console.error(`Failed to create paddler for team ${teamId}:`, error);
      alert("Failed to add paddler");
    }
  };

  return (
    <>
      <h1>Dragon Boat</h1>
      <p>Team ID: {teamId}</p>
      <section className="crews">
        <h2>Your crews</h2>
        <div className="crew-list">
          {crews.map((c) => (
            <button key={c.id}>{c.name}</button>
          ))}
        </div>
        <button onClick={addCrew}>Create new crew</button>
      </section>
      <section className="paddlers">
        <h2>Your paddlers</h2>
        <div className="paddler-list">
          {paddlers.map((p) => (
            <button key={p.id}>{p.name}</button>
          ))}
        </div>
        <button onClick={addPaddler}>Add paddler</button>
      </section>
    </>
  );
}

export default DragonBoat;
