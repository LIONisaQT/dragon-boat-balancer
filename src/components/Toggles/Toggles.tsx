import "./Toggles.scss";
import FrontBackBalance from "./FrontBackBalance";
import NumRows from "./NumRows";

interface TogglesProps {
  centerMass: number;
  onCenterMassChange: (centerMass: number) => void;
  numRows: number;
  onNumRowsChange: (numRows: number) => void;
}

export default function Toggles({
  centerMass,
  onCenterMassChange,
  numRows,
  onNumRowsChange,
}: TogglesProps) {
  return (
    <section className="toggles">
      <FrontBackBalance centerMass={centerMass} onChange={onCenterMassChange} />
      <NumRows numRows={numRows} onChange={onNumRowsChange} />
    </section>
  );
}
