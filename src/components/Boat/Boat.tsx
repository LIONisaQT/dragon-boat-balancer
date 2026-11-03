import "./Boat.scss";
import { Paddler, SideArray } from "../../types";
import { sumSideWeight, getCenterOfMass } from "../../utils/utils";
import PaddlerCard from "../PaddlerCard/PaddlerCard";

interface BoatProps {
  leftSide: SideArray;
  rightSide: SideArray;
  drum: Paddler | null;
  steer: Paddler | null;
  rowSize: number;
}

export default function Boat({
  leftSide,
  rightSide,
  drum,
  steer,
  rowSize,
}: BoatProps) {
  return (
    <section className="boat-container">
      <div className="boat">
        <div className="left paddlers">
          {leftSide.map((paddler, i) => (
            <PaddlerCard
              key={`left-slot-${i}`}
              details={paddler}
              position={i}
              location="left"
            />
          ))}
        </div>
        <div className="center">
          <div className="drum">
            <PaddlerCard details={drum} position={"drum"} location="drum" />
          </div>
          <div className="boat-stats">
            <section>
              <p>L/R Bal</p>
              <p>
                <span className="value">{sumSideWeight(leftSide)}</span>
                <span className="value">-</span>
                <span className="value">{sumSideWeight(rightSide)}</span>
              </p>
            </section>
            <section>
              <p>F/B Bal</p>
              <p className="value">
                {getCenterOfMass(leftSide, rightSide, rowSize)}
              </p>
            </section>
          </div>
          <div className="steer">
            <PaddlerCard details={steer} position={"steer"} location="steer" />
          </div>
        </div>
        <div className="right paddlers">
          {rightSide.map((paddler, i) => (
            <PaddlerCard
              key={`right-slot-${i}`}
              details={paddler}
              position={i}
              location="right"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
