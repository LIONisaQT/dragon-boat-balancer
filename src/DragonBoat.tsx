import { useCallback, useEffect, useMemo, useState } from "react";
import "./DragonBoat.scss";
import { Crew, Paddler, StoredCrew } from "./types";
import {
  createTeamCrew,
  createTeamPaddler,
  copyTeamCrew,
  deleteTeamCrew,
  deleteTeamPaddlers,
  subscribeToTeamCrews,
  subscribeToTeamPaddlers,
  updateTeamCrew,
} from "./services/teamData";
import CrewManager from "./components/CrewManager/CrewManager";
import AddNewPaddler from "./components/Roster/AddNewPaddler";
import PaddlerTable from "./components/PaddlerTable/PaddlerTable";

function resolveCrew(
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

function storeCrew(crew: Crew): StoredCrew {
  return {
    ...crew,
    roster: crew.roster.map((paddler) => paddler.id),
    leftSide: crew.leftSide.map((paddler) => paddler?.id ?? null),
    rightSide: crew.rightSide.map((paddler) => paddler?.id ?? null),
    drum: crew.drum?.id ?? null,
    steer: crew.steer?.id ?? null,
  };
}

function DragonBoat() {
  const [teamId, setTeamId] = useState("");
  const [crews, setCrews] = useState<StoredCrew[]>([]);
  const [paddlers, setPaddlers] = useState<Paddler[]>([]);
  const [paddlersLoaded, setPaddlersLoaded] = useState(false);
  const [selected, setSelected] = useState<Paddler[]>([]);
  const [renamingCrewId, setRenamingCrewId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const [currCrewId, setCurrCrewId] = useState<string | null>(null);

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
    setPaddlersLoaded(false);

    const unsubscribeCrews = subscribeToTeamCrews(teamId, setCrews, (error) =>
      console.error(`Failed to load crews for team ${teamId}:`, error),
    );
    const unsubscribePaddlers = subscribeToTeamPaddlers(
      teamId,
      (teamPaddlers) => {
        setPaddlers(teamPaddlers);
        setPaddlersLoaded(true);
      },
      (error) => {
        console.error(`Failed to load paddlers for team ${teamId}:`, error);
        setPaddlersLoaded(true);
      },
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

  const deleteCrew = async (crewId: string) => {
    if (!teamId) return;

    try {
      await deleteTeamCrew(teamId, crewId);
    } catch (error) {
      console.error(
        `Failed to delete crew ${crewId} from team ${teamId}:`,
        error,
      );
      alert("Failed to delete crew");
    }
  };

  const copyCrew = async (crew: StoredCrew) => {
    if (!teamId) return;

    try {
      await copyTeamCrew(teamId, crew);
    } catch (error) {
      console.error(
        `Failed to copy crew ${crew.id} for team ${teamId}:`,
        error,
      );
      alert("Failed to copy crew");
    }
  };

  const saveCrewName = async (crew: StoredCrew) => {
    if (!teamId) return;

    try {
      await updateTeamCrew(teamId, { ...crew, name: renameDraft });
      setRenamingCrewId((currentId) =>
        currentId === crew.id ? null : currentId,
      );
    } catch (error) {
      console.error(
        `Failed to rename crew ${crew.id} for team ${teamId}:`,
        error,
      );
      alert("Failed to rename crew");
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
        await updateTeamCrew(teamId, storeCrew(updatedCrew));
        console.log(`Crew ${updatedCrew.id} updated successfully`);
      } catch (error) {
        console.error("Error editing crew:", error);
        throw error;
      }
    },
    [teamId],
  );

  const onCloseClicked = () => setCurrCrewId(null);
  const paddlersById = useMemo(
    () => new Map(paddlers.map((paddler) => [paddler.id, paddler])),
    [paddlers],
  );
  const storedCurrCrew = crews.find((crew) => crew.id === currCrewId);
  const resolvedCurrCrew = useMemo(
    () =>
      storedCurrCrew && paddlersLoaded
        ? resolveCrew(storedCurrCrew, paddlersById)
        : undefined,
    [storedCurrCrew, paddlersLoaded, paddlersById],
  );

  return (
    <>
      <h1>Dragon Boat</h1>
      <p>Team ID: {teamId}</p>
      {currCrewId ? (
        !paddlersLoaded ? (
          <p>Loading crew paddlers...</p>
        ) : !storedCurrCrew ? (
          <section>
            <p>This crew is no longer available.</p>
            <button onClick={onCloseClicked}>Back to crews</button>
          </section>
        ) : resolvedCurrCrew &&
          resolvedCurrCrew.missingPaddlerIds.length > 0 ? (
          <section>
            <p>
              This crew refers to paddlers that are missing from the team:{" "}
              {resolvedCurrCrew.missingPaddlerIds.join(", ")}
            </p>
            <button onClick={onCloseClicked}>Back to crews</button>
          </section>
        ) : resolvedCurrCrew ? (
          <CrewManager
            key={storedCurrCrew.id}
            paddlers={paddlers}
            crew={resolvedCurrCrew.crew}
            onClose={onCloseClicked}
            onEdit={onEditCrew}
          />
        ) : null
      ) : (
        <div className="dragon-boat-main">
          <section className="crews">
            <div className="crew-list">
              <table>
                <thead>
                  <tr>
                    <th>Crew name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {crews.map((c) => (
                    <tr key={c.id}>
                      <td
                        className="crew-name"
                        onClick={() => {
                          if (renamingCrewId !== c.id) setCurrCrewId(c.id);
                        }}
                      >
                        {renamingCrewId === c.id ? (
                          <input
                            autoFocus
                            value={renameDraft}
                            onChange={(event) =>
                              setRenameDraft(event.target.value)
                            }
                            onClick={(event) => event.stopPropagation()}
                            onBlur={() =>
                              setRenamingCrewId((currentId) =>
                                currentId === c.id ? null : currentId,
                              )
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                void saveCrewName(c);
                              }
                            }}
                          />
                        ) : (
                          c.name
                        )}
                      </td>
                      <td>
                        <div className="options">
                          <button
                            onClick={() => {
                              setRenameDraft(c.name);
                              setRenamingCrewId(c.id);
                            }}
                          >
                            Rename
                          </button>
                          <button onClick={() => copyCrew(c)}>Copy</button>
                          <button onClick={() => deleteCrew(c.id)}>
                            Delete
                          </button>
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
