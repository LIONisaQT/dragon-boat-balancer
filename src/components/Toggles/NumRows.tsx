import { Dispatch, SetStateAction } from "react";

interface NumRowsProps {
  numRowsState: [number, Dispatch<SetStateAction<number>>];
}

export default function NumRows({ numRowsState }: NumRowsProps) {
  const [numRows, setNumRows] = numRowsState;

  return (
    <section className="num-rows-range">
      <h3>Number of rows: {numRows}</h3>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={numRows}
        onChange={(e) => setNumRows(Number(e.target.value))}
      />
    </section>
  );
}
