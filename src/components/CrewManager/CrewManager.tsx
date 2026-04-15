import "./CrewManager.scss";
import {
  DragEndEvent,
  DndContext,
  pointerWithin,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core";
import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
} from "react";
import {
  Paddler,
  SideArray,
  PaddlerLocation,
  Crew,
  BoatPaddler,
} from "../../types";
import { generateLineup } from "../../utils/utils";
import Boat from "../Boat/Boat";
import Roster from "../Roster/Roster";
import Toggles from "../Toggles/Toggles";
import AddNewPaddler from "../Roster/AddNewPaddler";

const DEBOUNCE_TIMER = 1000;

interface CrewManagerProps {
  crew: Crew;
  onClose?: (crew: Crew) => void;
  onEdit?: (crew: Crew) => void;
}

export default function CrewManager({
  crew,
  onClose,
  onEdit,
}: CrewManagerProps) {
  const isMounted = useRef(false);

  const [numRows, setNumRows] = useState(crew.numRows);
  const [centerMass, setCenterMass] = useState(crew.centerMass);

  const [roster, setRoster] = useState<Paddler[]>(crew.roster);
  const [leftSide, setLeftSide] = useState<SideArray>(crew.leftSide);
  const [rightSide, setRightSide] = useState<SideArray>(crew.rightSide);
  const [drum, setDrum] = useState<Paddler | null>(crew.drum);
  const [steer, setSteer] = useState<Paddler | null>(crew.steer);

  const [name, setName] = useState(crew.name);
  const [updatedName, setUpdatedName] = useState(crew.name);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedPaddler, setSelectedPaddler] = useState<BoatPaddler | null>(
    null,
  );

  useEffect(() => {
    // Prevent saving on mount
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const updatedCrew = {
      ...crew,
      name: updatedName,
      numRows,
      centerMass,
      leftSide,
      rightSide,
      drum,
      steer,
      roster,
    };

    // Prevent saving when nothing has changed
    if (JSON.stringify(updatedCrew) !== JSON.stringify(crew)) {
      // Debounce edit calls
      const handler = setTimeout(() => {
        onEdit?.(updatedCrew);
      }, DEBOUNCE_TIMER);

      return () => clearTimeout(handler);
    }
  }, [
    crew,
    onEdit,
    updatedName,
    numRows,
    centerMass,
    leftSide,
    rightSide,
    drum,
    steer,
    roster,
  ]);

  useEffect(() => {
    const resizeSide = (setSide: Dispatch<SetStateAction<SideArray>>) => {
      setSide((prev) => {
        const copy = [...prev];

        if (numRows > copy.length) {
          copy.push(...Array(numRows - copy.length).fill(null));
        } else if (numRows < copy.length) {
          const removed = copy.slice(numRows).filter(Boolean) as Paddler[];
          if (removed.length > 0) {
            setRoster((prevRoster) => [...prevRoster, ...removed]);
          }
          copy.length = numRows;
        }

        return copy;
      });
    };

    resizeSide(setLeftSide);
    resizeSide(setRightSide);
  }, [numRows, setRoster, setLeftSide, setRightSide]);

  const removeMap = useMemo<
    Record<PaddlerLocation, (p: Paddler, pos: number) => void>
  >(
    () => ({
      left: (p, pos) => {
        setLeftSide((prev) => {
          const copy = [...prev];
          if (pos !== undefined && copy[pos]?.id === p.id) {
            copy[pos] = null;
          } else {
            const index = copy.findIndex((x) => x?.id === p.id);
            if (index !== -1) copy[index] = null;
          }
          return copy;
        });
      },
      right: (p, pos) => {
        setRightSide((prev) => {
          const copy = [...prev];
          if (pos !== undefined && copy[pos]?.id === p.id) {
            copy[pos] = null;
          } else {
            const index = copy.findIndex((x) => x?.id === p.id);
            if (index !== -1) copy[index] = null;
          }
          return copy;
        });
      },
      drum: (p) => setDrum((prev) => (prev?.id === p.id ? null : prev)),
      steer: (p) => setSteer((prev) => (prev?.id === p.id ? null : prev)),
      roster: (p) => setRoster((prev) => prev.filter((x) => x.id !== p.id)),
    }),
    [setLeftSide, setRightSide, setDrum, setSteer, setRoster],
  );

  const addMap = useMemo<
    Record<PaddlerLocation, (p: Paddler, targetPos: number) => void>
  >(
    () => ({
      left: (p: Paddler, targetPos: number) => {
        setLeftSide((prev) => {
          const copy = [...prev];
          const existingIndex = copy.findIndex((x) => x?.id === p.id);
          if (existingIndex !== -1) {
            copy[existingIndex ?? targetPos] = p;
          } else {
            copy[targetPos] = p;
          }
          return copy;
        });
      },
      right: (p: Paddler, targetPos: number) => {
        setRightSide((prev) => {
          const copy = [...prev];
          const existingIndex = copy.findIndex((x) => x?.id === p.id);
          if (existingIndex !== -1) {
            copy[existingIndex] = p;
          } else {
            copy[targetPos] = p;
          }
          return copy;
        });
      },
      drum: (p: Paddler) => {
        setDrum((prev) => (prev?.id === p.id ? p : p));
      },
      steer: (p: Paddler) => {
        setSteer((prev) => (prev?.id === p.id ? p : p));
      },
      roster: (p: Paddler, index: number) => {
        setRoster((prev) => {
          const existingIndex = prev.findIndex((x) => x.id === p.id);
          if (existingIndex !== -1) {
            const newRoster = [...prev];
            newRoster[existingIndex] = p;
            return newRoster;
          } else {
            const newRoster = [...prev];
            newRoster.splice(index, 0, p);
            return newRoster;
          }
        });
      },
    }),
    [setLeftSide, setRightSide, setDrum, setSteer, setRoster],
  );

  const getTarget = (loc: PaddlerLocation) => {
    switch (loc) {
      case "left":
        return leftSide;
      case "right":
        return rightSide;
      case "roster":
        return roster;
      case "drum":
        return drum ? [drum] : [null];
      case "steer":
        return steer ? [steer] : [null];
    }
  };

  // Util method for single slot positions
  const getSingleSlot = (loc: PaddlerLocation) =>
    loc === "drum" ? drum : steer;

  // Util method for single slot positions
  const setSingleSlot = (loc: PaddlerLocation, value: Paddler | null) => {
    if (loc === "drum") setDrum(value);
    else if (loc === "steer") setSteer(value);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    const dragged = active.data.current?.details as Paddler;
    const currentLocation = active.data.current?.location as PaddlerLocation;
    const currentPosition = active.data.current?.position ?? 0;

    const destination = over?.data.current;
    const newLocation = destination?.location as PaddlerLocation | undefined;
    const newPosition = destination?.position;

    // Dropped outside → return to roster
    if (!destination) {
      if (currentLocation === "roster") return;
      removeMap[currentLocation]?.(dragged, currentPosition);
      addMap["roster"]?.(dragged, roster.length);
      return;
    }

    // Same location + same position → nothing to do
    if (currentLocation === newLocation && currentPosition === newPosition)
      return;

    const isSourceArray = !["drum", "steer"].includes(currentLocation);
    const isDestArray = !["drum", "steer"].includes(newLocation!);

    // Read destination before removing anything
    const existingDest = isDestArray
      ? ((getTarget(newLocation!) as Paddler[])[
          newPosition ?? (getTarget(newLocation!) as Paddler[]).length
        ] ?? null)
      : getSingleSlot(newLocation!);
    const destIndex = isDestArray
      ? (newPosition ?? (getTarget(newLocation!) as Paddler[]).length)
      : 0;

    // Remove dragged from source
    if (isSourceArray) removeMap[currentLocation]?.(dragged, currentPosition);
    else setSingleSlot(currentLocation, null);

    // Place dragged into destination, swap if needed
    if (isDestArray) {
      if (existingDest) {
        removeMap[newLocation!]?.(existingDest, destIndex);
        if (isSourceArray)
          addMap[currentLocation]?.(existingDest, currentPosition);
        else setSingleSlot(currentLocation, existingDest);
      }
      addMap[newLocation!]?.(dragged, destIndex);
    } else {
      if (existingDest) {
        if (isSourceArray)
          addMap[currentLocation]?.(existingDest, currentPosition);
        else setSingleSlot(currentLocation, existingDest);
      }
      setSingleSlot(newLocation!, dragged);
    }
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
    setRoster((prev) => [
      ...prev,
      ...leftSide.filter((p): p is Paddler => p !== null),
      ...rightSide.filter((p): p is Paddler => p !== null),
      ...(drum ? [drum] : []),
      ...(steer ? [steer] : []),
    ]);

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
    setSelectedPaddler(null);
    setAddModalOpen(true);
  };

  const onEditClicked = () => setAddModalOpen(true);

  const onSubmit = (paddler: BoatPaddler, isNew: boolean) => {
    if (isNew) {
      setRoster((prev) => [...prev, paddler.details]);
    } else {
      if (getSingleSlot(paddler.location)) {
        setSingleSlot(paddler.location, paddler.details);
      } else {
        addMap[paddler.location]?.(paddler.details, paddler.position as number);
      }
    }

    setAddModalOpen(false);
  };

  useEffect(() => {
    if (!addModalOpen) setSelectedPaddler(null);
  }, [addModalOpen]);

  const deletePaddler = (
    paddler: Paddler,
    location: PaddlerLocation,
    position: number | "drum" | "steer",
  ) => {
    removeMap[location]?.(paddler, position as number);
  };

  const copyCrewIdToClipboard = async (crewId: string) => {
    try {
      await navigator.clipboard.writeText(crewId);
    } catch (err) {
      console.error("Failed to copy crew ID:", crewId, err);
    }
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
          defaultValue={crew.name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setUpdatedName(name)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
        />
        <button
          className="crew-id"
          onClick={() => copyCrewIdToClipboard(crew.id)}
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
          {crew.id}
        </button>
      </section>
      <DndContext
        onDragEnd={handleDragEnd}
        collisionDetection={pointerWithin}
        sensors={[pointerSensor]}
      >
        <div className="crew-manager">
          <section className="main">
            <Toggles
              centerMassState={[centerMass, setCenterMass]}
              numRowsState={[numRows, setNumRows]}
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
              clickPaddler={setSelectedPaddler}
              editPaddler={onEditClicked}
              deletePaddler={deletePaddler}
            />
          </section>
          <Roster
            rosterState={[roster, setRoster]}
            addNew={onAddNewClicked}
            clickPaddler={setSelectedPaddler}
            editPaddler={onEditClicked}
            deletePaddler={deletePaddler}
          />
        </div>
        <AddNewPaddler
          openState={[addModalOpen, setAddModalOpen]}
          paddler={selectedPaddler}
          onSubmit={onSubmit}
        />
      </DndContext>
    </div>
  );
}
