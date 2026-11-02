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
  teamExists,
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
  const [isEditingTeamId, setIsEditingTeamId] = useState(false);
  const [teamIdDraft, setTeamIdDraft] = useState("");
  const [crews, setCrews] = useState<StoredCrew[]>([]);
  const [paddlers, setPaddlers] = useState<Paddler[]>([]);
  const [paddlersLoaded, setPaddlersLoaded] = useState(false);
  const [selected, setSelected] = useState<Paddler[]>([]);
  const [renamingCrewId, setRenamingCrewId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const [currCrewId, setCurrCrewId] = useState<string | null>(null);

  const [clickedPaddler, setClickedPaddler] = useState<Paddler | null>(null);
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
      setModalOpen(false);
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

  const onPaddlerClicked = (paddler: Paddler) => {
    setClickedPaddler(paddler);
    setModalOpen(true);
  };

  useEffect(() => {
    if (addModalOpen) return;
    setClickedPaddler(null);
  }, [addModalOpen]);

  const copyTeamIdToClipboard = async (crewId: string) => {
    try {
      await navigator.clipboard.writeText(crewId);
    } catch (err) {
      console.error("Failed to copy crew ID:", crewId, err);
    }
  };

  const submitTeamId = async () => {
    const incomingTeamId = teamIdDraft.trim();
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(incomingTeamId)) {
      alert("The team ID pattern does not match a valid UUID.");
      return;
    }

    try {
      if (!(await teamExists(incomingTeamId))) {
        alert(`The team with UUID ${incomingTeamId} could not be found.`);
        return;
      }

      localStorage.setItem("localTeamId", incomingTeamId);
      setCurrCrewId(null);
      setSelected([]);
      setRenamingCrewId(null);
      setClickedPaddler(null);
      setModalOpen(false);
      setTeamId(incomingTeamId);
      setIsEditingTeamId(false);
    } catch (error) {
      console.error(`Failed to load team ${incomingTeamId}:`, error);
      alert("Failed to load the team");
    }
  };

  return (
    <>
      <h1>Dragon Boat</h1>
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
          <section className="team-id-section">
            {isEditingTeamId ? (
              <input
                className="team-id team-id-input text-input"
                autoFocus
                value={teamIdDraft}
                onChange={(event) => setTeamIdDraft(event.target.value)}
                onBlur={() => setIsEditingTeamId(false)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void submitTeamId();
                  } else if (event.key === "Escape") {
                    setIsEditingTeamId(false);
                  }
                }}
                aria-label="Team ID"
              />
            ) : (
              <button
                className="team-id"
                onClick={() => copyTeamIdToClipboard(teamId)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                {teamId}
              </button>
            )}
            <button
              className="team-id-action"
              aria-label={isEditingTeamId ? "Go to team" : "Edit team ID"}
              title={isEditingTeamId ? "Go to team" : "Edit team ID"}
              onMouseDown={(event) => {
                if (isEditingTeamId) event.preventDefault();
              }}
              onClick={() => {
                if (isEditingTeamId) {
                  void submitTeamId();
                } else {
                  setTeamIdDraft(teamId);
                  setIsEditingTeamId(true);
                }
              }}
            >
              {isEditingTeamId ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12h15m0 0-6.75-6.75M19.5 12l-6.75 6.75"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                  />
                </svg>
              )}
            </button>
          </section>
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
                            className="text-input"
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
                            className="action-button"
                            onClick={() => {
                              setRenameDraft(c.name);
                              setRenamingCrewId(c.id);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                              />
                            </svg>
                          </button>
                          <button
                            className="action-button"
                            onClick={() => copyCrew(c)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                ry="2"
                              ></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() => deleteCrew(c.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
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
              onPaddlerClicked={onPaddlerClicked}
              onPrimaryClicked={() => setModalOpen(true)}
              primaryButtonText="Create new paddler"
              onSecondaryClicked={
                selected.length > 0 ? () => deletePaddlers(selected) : null
              }
              secondaryButtonText="Delete selected"
            />
            <AddNewPaddler
              openState={[addModalOpen, setModalOpen]}
              paddler={clickedPaddler}
              onSubmit={addPaddler}
            />
          </section>
        </div>
      )}
    </>
  );
}

export default DragonBoat;
