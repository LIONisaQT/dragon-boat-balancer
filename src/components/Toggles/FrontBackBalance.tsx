interface FBBalanceProps {
  centerMass: number;
  onChange: (centerMass: number) => void;
}

export default function FrontBackBalance({
  centerMass,
  onChange,
}: FBBalanceProps) {
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
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </section>
  );
}
