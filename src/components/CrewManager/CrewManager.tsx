import "./CrewManager.scss";
import {
  DragEndEvent,
  DndContext,
  pointerWithin,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Paddler,
  SideArray,
  PaddlerLocation,
  PaddlerPosition,
  Crew,
} from "../../types";
import { generateLineup } from "../../utils/utils";
import {
  getCrewPaddlers,
  getPaddlerDragData,
  getPaddlerDropData,
  getRecalledRoster,
  insertPaddlerInRoster,
  placePaddlerInSide,
  removePaddlerFromSide,
  resizeSide,
} from "./crewLayout";
import { hasCrewChanged } from "./crewPersistence";
import Boat from "../Boat/Boat";
import Roster from "../Roster/Roster";
import Toggles from "../Toggles/Toggles";
import AddPaddlerToCrew from "../AddPaddlerToCrew/AddPaddlerToCrew";

const DEBOUNCE_TIMER = 1000;

interface CrewManagerProps {
  paddlers: Paddler[];
  crew: Crew;
  onClose?: (crew: Crew) => void;
  onEdit?: (crew: Crew) => void;
}

export default function CrewManager({
  paddlers,
  crew,
  onClose,
  onEdit,
}: CrewManagerProps) {
  const hasMounted = useRef(false);

  const [numRows, setNumRows] = useState(crew.numRows);
  const [centerMass, setCenterMass] = useState(crew.centerMass);

  const [roster, setRoster] = useState<Paddler[]>(crew.roster);
  const [leftSide, setLeftSide] = useState<SideArray>(crew.leftSide);
  const [rightSide, setRightSide] = useState<SideArray>(crew.rightSide);
  const [drum, setDrum] = useState<Paddler | null>(crew.drum);
  const [steer, setSteer] = useState<Paddler | null>(crew.steer);

  const crewPaddlers = useMemo(() => {
    return getCrewPaddlers(roster, leftSide, rightSide, drum, steer);
  }, [roster, leftSide, rightSide, drum, steer]);

  const [nameDraft, setNameDraft] = useState(crew.name);
  const [committedName, setCommittedName] = useState(crew.name);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCrewPaddlers, setSelectedCrewPaddlers] = useState<Paddler[]>(
    [],
  );

  useEffect(() => {
    setNumRows(crew.numRows);
    setCenterMass(crew.centerMass);
    setRoster(crew.roster);
    setLeftSide(crew.leftSide);
    setRightSide(crew.rightSide);
    setDrum(crew.drum);
    setSteer(crew.steer);
    setNameDraft(crew.name);
    setCommittedName(crew.name);
  }, [crew]);

  useEffect(() => {
    // Prevent saving on mount
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const updatedCrew = {
      ...crew,
      name: committedName,
      numRows,
      centerMass,
      leftSide,
      rightSide,
      drum,
      steer,
      roster,
    };

    if (hasCrewChanged(crew, updatedCrew)) {
      const handler = setTimeout(() => {
        onEdit?.(updatedCrew);
      }, DEBOUNCE_TIMER);

      return () => clearTimeout(handler);
    }
  }, [
    crew,
    onEdit,
    committedName,
    numRows,
    centerMass,
    leftSide,
    rightSide,
    drum,
    steer,
    roster,
  ]);

  useEffect(() => {
    const leftResize = resizeSide(leftSide, numRows);
    const rightResize = resizeSide(rightSide, numRows);

    if (leftResize.side !== leftSide) setLeftSide(leftResize.side);
    if (rightResize.side !== rightSide) setRightSide(rightResize.side);

    const removed = [...leftResize.removed, ...rightResize.removed];
    if (removed.length > 0) {
      setRoster((previousRoster) => [...previousRoster, ...removed]);
    }
  }, [numRows, leftSide, rightSide, setRoster]);

  const removePaddler = (
    location: PaddlerLocation,
    paddler: Paddler,
    position: PaddlerPosition,
  ) => {
    switch (location) {
      case "left":
        if (typeof position === "number") {
          setLeftSide((side) => removePaddlerFromSide(side, paddler, position));
        }
        break;
      case "right":
        if (typeof position === "number") {
          setRightSide((side) =>
            removePaddlerFromSide(side, paddler, position),
          );
        }
        break;
      case "drum":
        setDrum((current) => (current?.id === paddler.id ? null : current));
        break;
      case "steer":
        setSteer((current) => (current?.id === paddler.id ? null : current));
        break;
      case "roster":
        setRoster((current) =>
          current.filter((member) => member.id !== paddler.id),
        );
        break;
    }
  };

  const addPaddler = (
    location: PaddlerLocation,
    paddler: Paddler,
    position: PaddlerPosition,
  ) => {
    switch (location) {
      case "left":
        if (typeof position === "number") {
          setLeftSide((side) => placePaddlerInSide(side, paddler, position));
        }
        break;
      case "right":
        if (typeof position === "number") {
          setRightSide((side) => placePaddlerInSide(side, paddler, position));
        }
        break;
      case "drum":
        setDrum(paddler);
        break;
      case "steer":
        setSteer(paddler);
        break;
      case "roster":
        if (typeof position === "number") {
          setRoster((current) =>
            insertPaddlerInRoster(current, paddler, position),
          );
        }
        break;
    }
  };

  const getPaddlerAt = (
    location: PaddlerLocation,
    position: PaddlerPosition,
  ): Paddler | null => {
    switch (location) {
      case "left":
        return typeof position === "number"
          ? (leftSide[position] ?? null)
          : null;
      case "right":
        return typeof position === "number"
          ? (rightSide[position] ?? null)
          : null;
      case "roster":
        return typeof position === "number" ? (roster[position] ?? null) : null;
      case "drum":
        return drum;
      case "steer":
        return steer;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const source = getPaddlerDragData(active.data.current);
    if (!source) return;

    // Dropped outside → return to roster
    if (!over) {
      if (source.location === "roster") return;
      removePaddler(source.location, source.details, source.position);
      addPaddler("roster", source.details, roster.length);
      return;
    }

    const destination = getPaddlerDropData(over.data.current);
    if (!destination) return;
    const { location: newLocation, position: newPosition } = destination;

    // Same location + same position → nothing to do
    if (source.location === newLocation && source.position === newPosition) {
      return;
    }

    // Read destination before removing anything
    const existingDestination = getPaddlerAt(newLocation, newPosition);

    // Remove dragged from source
    removePaddler(source.location, source.details, source.position);

    // Place dragged into destination, swap if needed
    if (existingDestination) {
      removePaddler(newLocation, existingDestination, newPosition);
      addPaddler(source.location, existingDestination, source.position);
    }
    addPaddler(newLocation, source.details, newPosition);
  };

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const onGenerateLineupClicked = () => {
    const available = [
      ...roster,
      ...leftSide.filter((p): p is Paddler => p !== null),
      ...rightSide.filter((p): p is Paddler => p !== null),
    ];

    const lineup = generateLineup(available, centerMass, numRows);

    setLeftSide(lineup.left);
    setRightSide(lineup.right);
    setRoster(lineup.remainingRoster);
  };

  const onRecallClicked = () => {
    setRoster((previousRoster) =>
      getRecalledRoster(previousRoster, leftSide, rightSide, drum, steer),
    );

    setLeftSide(Array(numRows).fill(null));
    setRightSide(Array(numRows).fill(null));
    setDrum(null);
    setSteer(null);
  };

  const isRecallEnabled =
    leftSide.some((p) => p !== null) ||
    rightSide.some((p) => p !== null) ||
    drum !== null ||
    steer !== null;

  const onAddNewClicked = () => {
    setSelectedCrewPaddlers(crewPaddlers);
    setAddModalOpen(true);
  };

  const addToRoster = (paddlers: Paddler[]) => {
    const selectedIds = new Set(paddlers.map((p) => p.id));
    const seatedIds = new Set(
      [
        ...leftSide.filter((p): p is Paddler => p !== null),
        ...rightSide.filter((p): p is Paddler => p !== null),
        ...(drum ? [drum] : []),
        ...(steer ? [steer] : []),
      ].map((p) => p.id),
    );

    setRoster((currentRoster) => {
      const retained = currentRoster.filter(
        (p) => selectedIds.has(p.id) && !seatedIds.has(p.id),
      );
      const retainedIds = new Set(retained.map((p) => p.id));
      const additions = paddlers.filter(
        (p) => !seatedIds.has(p.id) && !retainedIds.has(p.id),
      );
      return [...retained, ...additions];
    });
    setLeftSide((current) =>
      current.map((p) => (p && !selectedIds.has(p.id) ? null : p)),
    );
    setRightSide((current) =>
      current.map((p) => (p && !selectedIds.has(p.id) ? null : p)),
    );
    setDrum((current) =>
      current && !selectedIds.has(current.id) ? null : current,
    );
    setSteer((current) =>
      current && !selectedIds.has(current.id) ? null : current,
    );
  };

  return (
    <div className="crew-manager-container">
      {onClose && (
        <button className="close-button" onClick={() => onClose(crew)}>
          ✕
        </button>
      )}
      <section className="crew-info-header">
        <input
          className="crew-name"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={() => setCommittedName(nameDraft)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
        />
      </section>
      <DndContext
        onDragEnd={handleDragEnd}
        collisionDetection={pointerWithin}
        sensors={[pointerSensor]}
      >
        <div className="crew-manager">
          <section className="main">
            <Toggles
              centerMass={centerMass}
              onCenterMassChange={setCenterMass}
              numRows={numRows}
              onNumRowsChange={setNumRows}
            />
            <section className="button-group">
              <button onClick={onGenerateLineupClicked}>Generate lineup</button>
              <button onClick={onRecallClicked} disabled={!isRecallEnabled}>
                Recall all paddlers
              </button>
            </section>
            <Boat
              leftSide={leftSide}
              rightSide={rightSide}
              drum={drum}
              steer={steer}
              rowSize={numRows}
            />
          </section>
          <Roster
            roster={roster}
            onRosterChange={setRoster}
            addNew={onAddNewClicked}
          />
        </div>
        <AddPaddlerToCrew
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          paddlers={paddlers}
          selected={selectedCrewPaddlers}
          onSelectionChange={setSelectedCrewPaddlers}
          onAddToRoster={addToRoster}
        />
      </DndContext>
    </div>
  );
}
