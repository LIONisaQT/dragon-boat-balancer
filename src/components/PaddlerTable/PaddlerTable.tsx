import "./PaddlerTable.scss";

import { useEffect, useState } from "react";
import { Paddler } from "../../types";

interface TableProps {
  paddlers: Paddler[];
  initialSelection: Paddler[];
  onChecked?: (paddlers: Paddler[]) => void;
  onPrimaryClicked?: (() => void) | null;
  primaryButtonText?: string;
  onSecondaryClicked?: (() => void) | null;
  secondaryButtonText?: string;
}

function PaddlerTable({
  paddlers,
  initialSelection,
  onChecked,
  onPrimaryClicked = null,
  primaryButtonText = "Primary",
  onSecondaryClicked = null,
  secondaryButtonText = "Secondary",
}: TableProps) {
  const [selected, setSelected] = useState<Paddler[]>(initialSelection);

  const allSelected =
    paddlers.length > 0 &&
    paddlers.every((p) =>
      selected.some((selectedPaddler) => selectedPaddler.id === p.id),
    );

  const onPaddlerChecked = (paddler: Paddler) => {
    setSelected((current) =>
      current.some((selectedPaddler) => selectedPaddler.id === paddler.id)
        ? current.filter((selectedPaddler) => selectedPaddler.id !== paddler.id)
        : [...current, paddler],
    );
  };

  useEffect(() => {
    onChecked?.(selected);
  }, [onChecked, selected]);

  return (
    <div className="paddler-table">
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => setSelected(allSelected ? [] : paddlers)}
              />
            </th>
            <th>Name</th>
            <th>Side</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          {paddlers.map((p) => (
            <tr key={p.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.some((paddler) => paddler.id === p.id)}
                  onChange={() => onPaddlerChecked(p)}
                />
              </td>
              <td>{p.name}</td>
              <td>{p.side}</td>
              <td>{p.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(onPrimaryClicked !== null || onSecondaryClicked !== null) && (
        <div className="button-group">
          {onPrimaryClicked && (
            <button onClick={onPrimaryClicked}>{primaryButtonText}</button>
          )}
          {onSecondaryClicked && (
            <button onClick={onSecondaryClicked}>{secondaryButtonText}</button>
          )}
        </div>
      )}
    </div>
  );
}

export default PaddlerTable;
