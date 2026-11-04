import { useEffect, useMemo, useRef, useState } from "react";
import { Paddler, StoredCrew } from "../../types";
import AddNewPaddler from "../Roster/AddNewPaddler";
import PaddlerTable from "../PaddlerTable/PaddlerTable";
import "./TeamOverview.scss";

interface TeamOverviewProps {
  teamId: string;
  crews: StoredCrew[];
  paddlers: Paddler[];
  paddlerLoadError: string | null;
  onChangeTeam: (teamId: string) => Promise<boolean>;
  onSelectCrew: (crewId: string) => void;
  onCreateCrew: () => void;
  onCopyCrew: (crew: StoredCrew) => void;
  onDeleteCrew: (crewId: string) => void;
  onRenameCrew: (crew: StoredCrew, name: string) => Promise<boolean>;
  onSavePaddler: (paddler: Paddler) => Promise<boolean>;
  onDeletePaddlers: (paddlers: Paddler[]) => void;
}

export default function TeamOverview({
  teamId,
  crews,
  paddlers,
  paddlerLoadError,
  onChangeTeam,
  onSelectCrew,
  onCreateCrew,
  onCopyCrew,
  onDeleteCrew,
  onRenameCrew,
  onSavePaddler,
  onDeletePaddlers,
}: TeamOverviewProps) {
  const [isEditingTeamId, setIsEditingTeamId] = useState(false);
  const [teamIdDraft, setTeamIdDraft] = useState(teamId);
  const teamIdInputRef = useRef<HTMLInputElement>(null);
  const [selectedPaddlerIds, setSelectedPaddlerIds] = useState<string[]>([]);
  const [renamingCrewId, setRenamingCrewId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const cancelRenameOnBlur = useRef(false);
  const [clickedPaddlerId, setClickedPaddlerId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    if (isEditingTeamId) {
      teamIdInputRef.current?.select();
    }
  }, [isEditingTeamId]);

  const selectedPaddlers = useMemo(() => {
    const selectedIds = new Set(selectedPaddlerIds);
    return paddlers.filter((paddler) => selectedIds.has(paddler.id));
  }, [paddlers, selectedPaddlerIds]);
  const clickedPaddler =
    paddlers.find((paddler) => paddler.id === clickedPaddlerId) ?? null;

  useEffect(() => {
    const paddlerIds = new Set(paddlers.map((paddler) => paddler.id));
    setSelectedPaddlerIds((currentIds) =>
      currentIds.filter((id) => paddlerIds.has(id)),
    );
  }, [paddlers]);

  const copyTeamIdToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(teamId);
    } catch (error) {
      console.error(`Failed to copy team ID ${teamId}:`, error);
    }
  };

  const submitTeamId = async () => {
    if (await onChangeTeam(teamIdDraft.trim())) {
      setIsEditingTeamId(false);
    }
  };

  const saveCrewName = async (crew: StoredCrew) => {
    if (await onRenameCrew(crew, renameDraft)) {
      setRenamingCrewId((currentId) =>
        currentId === crew.id ? null : currentId,
      );
    }
  };

  const savePaddler = async (paddler: Paddler) => {
    if (await onSavePaddler(paddler)) {
      setAddModalOpen(false);
      setClickedPaddlerId(null);
    }
  };

  const startEditingTeamId = () => {
    setTeamIdDraft(teamId);
    setIsEditingTeamId(true);
  };

  return (
    <div className="dragon-boat-main">
      <section className="team-id-section">
        {isEditingTeamId ? (
          <input
            ref={teamIdInputRef}
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
          <button className="team-id" onClick={copyTeamIdToClipboard}>
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
            if (isEditingTeamId) void submitTeamId();
            else startEditingTeamId();
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
              {crews.map((crew) => (
                <tr key={crew.id}>
                  <td
                    className="crew-name"
                    onClick={() => {
                      if (renamingCrewId !== crew.id) onSelectCrew(crew.id);
                    }}
                  >
                    {renamingCrewId === crew.id ? (
                      <input
                        className="text-input"
                        autoFocus
                        value={renameDraft}
                        onChange={(event) => setRenameDraft(event.target.value)}
                        onClick={(event) => event.stopPropagation()}
                        onBlur={() => {
                          if (cancelRenameOnBlur.current) {
                            cancelRenameOnBlur.current = false;
                            return;
                          }
                          void saveCrewName(crew);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            event.currentTarget.blur();
                          } else if (event.key === "Escape") {
                            cancelRenameOnBlur.current = true;
                            setRenameDraft(crew.name);
                            setRenamingCrewId(null);
                            event.currentTarget.blur();
                          }
                        }}
                      />
                    ) : (
                      crew.name
                    )}
                  </td>
                  <td>
                    <div className="options">
                      <button
                        className="action-button"
                        aria-label={`Rename ${crew.name}`}
                        onClick={() => {
                          setRenameDraft(crew.name);
                          setRenamingCrewId(crew.id);
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
                        aria-label={`Duplicate ${crew.name}`}
                        onClick={() => onCopyCrew(crew)}
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
                        aria-label={`Delete ${crew.name}`}
                        onClick={() => onDeleteCrew(crew.id)}
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
        <button onClick={onCreateCrew}>Create new crew</button>
      </section>
      <section className="paddlers">
        <h2>Your paddlers</h2>
        {paddlerLoadError && (
          <p role="alert">
            Could not load paddlers for this team: {paddlerLoadError}
          </p>
        )}
        <PaddlerTable
          paddlers={paddlers}
          selected={selectedPaddlers}
          onSelectionChange={(selection) =>
            setSelectedPaddlerIds(selection.map((paddler) => paddler.id))
          }
          onPaddlerClicked={(paddler) => {
            setClickedPaddlerId(paddler.id);
            setAddModalOpen(true);
          }}
          onPrimaryAction={() => {
            setClickedPaddlerId(null);
            setAddModalOpen(true);
          }}
          primaryActionLabel="Create new paddler"
          onSecondaryAction={
            selectedPaddlers.length > 0
              ? () => onDeletePaddlers(selectedPaddlers)
              : null
          }
          secondaryActionLabel="Delete selected"
        />
        <AddNewPaddler
          isOpen={addModalOpen}
          onClose={() => {
            setAddModalOpen(false);
            setClickedPaddlerId(null);
          }}
          paddler={clickedPaddler}
          onSubmit={(paddler) => void savePaddler(paddler)}
        />
      </section>
    </div>
  );
}
