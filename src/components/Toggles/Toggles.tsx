import "./Toggles.scss";
import { Dispatch, SetStateAction } from "react";
import FrontBackBalance from "./FrontBackBalance";
import NumRows from "./NumRows";

interface TogglesProps {
  centerMassState: [number, Dispatch<SetStateAction<number>>];
  numRowsState: [number, Dispatch<SetStateAction<number>>];
}

export default function Toggles({
  centerMassState,
  numRowsState,
}: TogglesProps) {
  return (
    <section className="toggles">
      <FrontBackBalance centerMassState={centerMassState} />
      <NumRows numRowsState={numRowsState} />
    </section>
  );
}
