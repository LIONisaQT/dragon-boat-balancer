interface NumRowsProps {
  numRows: number;
  onChange: (numRows: number) => void;
}

export default function NumRows({ numRows, onChange }: NumRowsProps) {
  return (
    <section className="num-rows-range">
      <h3>Number of rows: {numRows}</h3>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={numRows}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </section>
  );
}
