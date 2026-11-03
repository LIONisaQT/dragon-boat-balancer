import { useCallback, useEffect, useMemo, useState } from "react";
import { Crew, Paddler, StoredCrew } from "./types";
import {
  copyTeamCrew,
  createTeamCrew,
  deleteTeamCrew,
  deleteTeamPaddlers,
  saveTeamPaddler,
  subscribeToTeamCrews,
  subscribeToTeamPaddlers,
  teamExists,
  updateTeamCrew,
} from "./services/teamData";
import CrewManager from "./components/CrewManager/CrewManager";
import TeamOverview from "./components/TeamOverview/TeamOverview";
import { resolveCrew, storeCrew } from "./utils/crewData";
import useTheme from "./hooks/useTheme";

type PaddlerLoadStatus = "loading" | "loaded" | "error";

function getInitialTeamId(): string {
  try {
    return localStorage.getItem("localTeamId") ?? crypto.randomUUID();
  } catch (error) {
    console.error("Failed to read the saved team ID:", error);
    return crypto.randomUUID();
  }
}

async function runTeamOperation(
  operation: () => Promise<void>,
  context: string,
  failureMessage: string,
): Promise<boolean> {
  try {
    await operation();
    return true;
  } catch (error) {
    console.error(context, error);
    alert(failureMessage);
    return false;
  }
}

const isUuidV4 = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

function App() {
  useTheme();

  const [teamId, setTeamId] = useState(getInitialTeamId);
  const [crews, setCrews] = useState<StoredCrew[]>([]);
  const [paddlers, setPaddlers] = useState<Paddler[]>([]);
  const [paddlerLoadStatus, setPaddlerLoadStatus] =
    useState<PaddlerLoadStatus>("loading");
  const [paddlerLoadError, setPaddlerLoadError] = useState<string | null>(null);
  const [currentCrewId, setCurrentCrewId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("localTeamId", teamId);
    } catch (error) {
      console.error("Failed to save the team ID locally:", error);
      alert("The team ID could not be saved in this browser.");
    }
  }, [teamId]);

  useEffect(() => {
    setCrews([]);
    setPaddlers([]);
    setPaddlerLoadStatus("loading");
    setPaddlerLoadError(null);

    const unsubscribeCrews = subscribeToTeamCrews(teamId, setCrews, (error) =>
      console.error(`Failed to load crews for team ${teamId}:`, error),
    );
    const unsubscribePaddlers = subscribeToTeamPaddlers(
      teamId,
      (teamPaddlers) => {
        setPaddlers(teamPaddlers);
        setPaddlerLoadStatus("loaded");
        setPaddlerLoadError(null);
      },
      (error) => {
        console.error(`Failed to load paddlers for team ${teamId}:`, error);
        setPaddlerLoadStatus("error");
        setPaddlerLoadError(error.message);
      },
    );

    return () => {
      unsubscribeCrews();
      unsubscribePaddlers();
    };
  }, [teamId]);

  const addCrew = () =>
    runTeamOperation(
      () => createTeamCrew(teamId),
      `Failed to create crew for team ${teamId}:`,
      "Failed to create crew",
    );

  const deleteCrew = (crewId: string) =>
    runTeamOperation(
      () => deleteTeamCrew(teamId, crewId),
      `Failed to delete crew ${crewId} from team ${teamId}:`,
      "Failed to delete crew",
    );

  const copyCrew = (crew: StoredCrew) =>
    runTeamOperation(
      () => copyTeamCrew(teamId, crew),
      `Failed to copy crew ${crew.id} for team ${teamId}:`,
      "Failed to copy crew",
    );

  const saveCrewName = async (
    crew: StoredCrew,
    name: string,
  ): Promise<boolean> => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      alert("Crew name cannot be blank.");
      return false;
    }

    return runTeamOperation(
      () => updateTeamCrew(teamId, { ...crew, name: normalizedName }),
      `Failed to rename crew ${crew.id} for team ${teamId}:`,
      "Failed to rename crew",
    );
  };

  const savePaddler = (paddler: Paddler) =>
    runTeamOperation(
      () => saveTeamPaddler(teamId, paddler),
      `Failed to save paddler ${paddler.id} for team ${teamId}:`,
      "Failed to save paddler",
    );

  const deletePaddlers = (paddlersToDelete: Paddler[]) => {
    if (paddlersToDelete.length === 0) return;
    void runTeamOperation(
      () => deleteTeamPaddlers(teamId, paddlersToDelete),
      `Failed to delete paddlers from team ${teamId}:`,
      "Failed to delete selected paddlers",
    );
  };

  const onEditCrew = useCallback(
    (updatedCrew: Crew) =>
      runTeamOperation(
        () => updateTeamCrew(teamId, storeCrew(updatedCrew)),
        `Failed to save crew ${updatedCrew.id} for team ${teamId}:`,
        "Failed to save crew changes",
      ).then(() => undefined),
    [teamId],
  );

  const changeTeam = async (incomingTeamId: string): Promise<boolean> => {
    if (!isUuidV4(incomingTeamId)) {
      alert("The team ID pattern does not match a valid UUID.");
      return false;
    }

    try {
      if (!(await teamExists(incomingTeamId))) {
        alert(`The team with UUID ${incomingTeamId} could not be found.`);
        return false;
      }

      setCurrentCrewId(null);
      setTeamId(incomingTeamId);
      return true;
    } catch (error) {
      console.error(`Failed to load team ${incomingTeamId}:`, error);
      alert("Failed to load the team");
      return false;
    }
  };

  const paddlersById = useMemo(
    () => new Map(paddlers.map((paddler) => [paddler.id, paddler])),
    [paddlers],
  );
  const storedCurrentCrew = crews.find((crew) => crew.id === currentCrewId);
  const resolvedCurrentCrew = useMemo(
    () =>
      storedCurrentCrew && paddlerLoadStatus === "loaded"
        ? resolveCrew(storedCurrentCrew, paddlersById)
        : undefined,
    [storedCurrentCrew, paddlerLoadStatus, paddlersById],
  );

  const renderCrewView = () => {
    if (paddlerLoadStatus === "loading") {
      return <p>Loading crew paddlers...</p>;
    }
    if (paddlerLoadStatus === "error") {
      return (
        <section>
          <p>Could not load paddlers for this team.</p>
          {paddlerLoadError && <p>{paddlerLoadError}</p>}
          <button onClick={() => setCurrentCrewId(null)}>Back to crews</button>
        </section>
      );
    }
    if (!storedCurrentCrew) {
      return (
        <section>
          <p>This crew is no longer available.</p>
          <button onClick={() => setCurrentCrewId(null)}>Back to crews</button>
        </section>
      );
    }
    if (
      resolvedCurrentCrew &&
      resolvedCurrentCrew.missingPaddlerIds.length > 0
    ) {
      return (
        <section>
          <p>
            This crew refers to paddlers that are missing from the team:{" "}
            {resolvedCurrentCrew.missingPaddlerIds.join(", ")}
          </p>
          <button onClick={() => setCurrentCrewId(null)}>Back to crews</button>
        </section>
      );
    }
    if (!resolvedCurrentCrew) return null;

    return (
      <CrewManager
        key={storedCurrentCrew.id}
        paddlers={paddlers}
        crew={resolvedCurrentCrew.crew}
        onClose={() => setCurrentCrewId(null)}
        onEdit={onEditCrew}
      />
    );
  };

  return (
    <>
      <h1>DB Crew Manager</h1>
      {currentCrewId ? (
        renderCrewView()
      ) : (
        <TeamOverview
          key={teamId}
          teamId={teamId}
          crews={crews}
          paddlers={paddlers}
          paddlerLoadError={paddlerLoadError}
          onChangeTeam={changeTeam}
          onSelectCrew={setCurrentCrewId}
          onCreateCrew={addCrew}
          onCopyCrew={copyCrew}
          onDeleteCrew={deleteCrew}
          onRenameCrew={saveCrewName}
          onSavePaddler={savePaddler}
          onDeletePaddlers={deletePaddlers}
        />
      )}
    </>
  );
}

export default App;
