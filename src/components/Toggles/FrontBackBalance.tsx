import { Dispatch, SetStateAction } from "react";

interface FBBalanceProps {
  centerMassState: [number, Dispatch<SetStateAction<number>>];
}

export default function FrontBackBalance({ centerMassState }: FBBalanceProps) {
  const [centerMass, setCenterMass] = centerMassState;

  return (
    <section className="front-back-balance">
      <h3>Front/back balance</h3>
      <p>Desired center of mass for boat: {centerMass}</p>
      <input
        type="range"
        min={1}
        max={10}
        step={0.5}
        value={centerMass}
        onChange={(e) => setCenterMass(Number(e.target.value))}
      />
    </section>
  );
}
