import "./Roster.scss";
import { Paddler } from "../../types";
import { sortRosterByWeight, sortRosterBySide } from "../../utils/utils";
import PaddlerCard from "../PaddlerCard/PaddlerCard";

interface RosterProps {
  roster: Paddler[];
  onRosterChange: (roster: Paddler[]) => void;
  addNew: () => void;
}

export default function Roster({
  roster,
  onRosterChange,
  addNew,
}: RosterProps) {
  return (
    <section className="roster-container">
      <h2>Reserve</h2>
      <section className="button-group">
        <button onClick={() => onRosterChange(sortRosterByWeight(roster))}>
          Sort by weight
        </button>
        <button onClick={() => onRosterChange(sortRosterBySide(roster))}>
          Sort by side
        </button>
      </section>
      <div className="roster">
        {roster.map((paddler, i) => (
          <PaddlerCard
            key={paddler.id}
            details={paddler}
            position={i}
            location="roster"
          />
        ))}
      </div>
      <section className="button-group">
        <button onClick={addNew}>Update crew</button>
      </section>
    </section>
  );
}
