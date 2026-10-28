import { useCallback, useEffect, useState } from "react";
import "./DragonBoat.scss";
import { Crew, Paddler } from "./types";
import {
  createTeamCrew,
  createTeamPaddler,
  deleteTeamPaddlers,
  subscribeToTeamCrews,
  subscribeToTeamPaddlers,
  updateTeamCrew,
} from "./services/teamData";
import CrewManager from "./components/CrewManager/CrewManager";
import AddNewPaddler from "./components/Roster/AddNewPaddler";
import PaddlerTable from "./components/PaddlerTable/PaddlerTable";

function DragonBoat() {
  const [teamId, setTeamId] = useState("");
  const [crews, setCrews] = useState<Crew[]>([]);
  const [paddlers, setPaddlers] = useState<Paddler[]>([]);
  const [selected, setSelected] = useState<Paddler[]>([]);

  const [currCrew, setCurrCrew] = useState<Crew | undefined>(undefined);

  const [addModalOpen, setModalOpen] = useState(false);

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

  const addPaddler = async (paddler: Paddler) => {
    if (!teamId) return;

    try {
      await createTeamPaddler(teamId, paddler);
    } catch (error) {
      console.error(`Failed to create paddler for team ${teamId}:`, error);
      alert("Failed to add paddler");
    }
  };

  const deletePaddlers = async (paddlersToDelete: Paddler[]) => {
    if (!teamId || paddlersToDelete.length === 0) return;

    try {
      await deleteTeamPaddlers(teamId, paddlersToDelete);
      setSelected([]);
    } catch (error) {
      console.error(`Failed to delete paddlers from team ${teamId}:`, error);
      alert("Failed to delete selected paddlers");
    }
  };

  const onEditCrew = useCallback(
    async (updatedCrew: Crew) => {
      if (!teamId) return;

      try {
        await updateTeamCrew(teamId, updatedCrew);
        console.log(`Crew ${updatedCrew.id} updated successfully`);
      } catch (error) {
        console.error("Error editing crew:", error);
        throw error;
      }
    },
    [teamId],
  );

  const onCloseClicked = () => setCurrCrew(undefined);

  return (
    <>
      <h1>Dragon Boat</h1>
      <p>Team ID: {teamId}</p>
      {currCrew ? (
        <CrewManager
          paddlers={paddlers}
          crew={currCrew}
          onClose={onCloseClicked}
          onEdit={onEditCrew}
        />
      ) : (
        <div className="dragon-boat-main">
          <section className="crews">
            <div className="crew-list">
              <table>
                <thead>
                  <tr>
                    <th>Crew name</th>
                    <th>#</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {crews.map((c) => (
                    <tr key={c.id}>
                      <td className="crew-name" onClick={() => setCurrCrew(c)}>
                        {c.name}
                      </td>
                      <td>{c.roster.length}</td>
                      <td>
                        <div className="options">
                          <button>Copy</button>
                          <button>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addCrew}>Create new crew</button>
          </section>
          <section className="paddlers">
            <h2>Your paddlers</h2>
            <PaddlerTable
              paddlers={paddlers}
              selected={selected}
              onSelectionChange={setSelected}
              onPrimaryClicked={() => setModalOpen(true)}
              primaryButtonText="Add paddler"
              onSecondaryClicked={
                selected.length > 0 ? () => deletePaddlers(selected) : null
              }
              secondaryButtonText="Delete selected"
            />
            <AddNewPaddler
              openState={[addModalOpen, setModalOpen]}
              paddler={null}
              onSubmit={addPaddler}
            />
          </section>
        </div>
      )}
    </>
  );
}

export default DragonBoat;
