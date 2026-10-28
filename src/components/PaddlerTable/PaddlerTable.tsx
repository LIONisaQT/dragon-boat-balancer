import "./PaddlerTable.scss";

import { Paddler } from "../../types";

interface TableProps {
  paddlers: Paddler[];
  selected: Paddler[];
  onSelectionChange: (paddlers: Paddler[]) => void;
  onPaddlerClicked?: ((paddler: Paddler) => void) | null;
  onPrimaryClicked?: (() => void) | null;
  primaryButtonText?: string;
  onSecondaryClicked?: (() => void) | null;
  secondaryButtonText?: string;
}

function PaddlerTable({
  paddlers,
  selected,
  onSelectionChange,
  onPaddlerClicked = null,
  onPrimaryClicked = null,
  primaryButtonText = "Primary",
  onSecondaryClicked = null,
  secondaryButtonText = "Secondary",
}: TableProps) {
  const allSelected =
    paddlers.length > 0 &&
    paddlers.every((p) =>
      selected.some((selectedPaddler) => selectedPaddler.id === p.id),
    );

  const onPaddlerChecked = (paddler: Paddler) => {
    onSelectionChange(
      selected.some((selectedPaddler) => selectedPaddler.id === paddler.id)
        ? selected.filter(
            (selectedPaddler) => selectedPaddler.id !== paddler.id,
          )
        : [...selected, paddler],
    );
  };

  return (
    <div className="paddler-table">
      <table>
        <thead>
          <tr>
            <th>
              <input
                className="table-checkbox"
                type="checkbox"
                checked={allSelected}
                onChange={() => onSelectionChange(allSelected ? [] : paddlers)}
              />
            </th>
            <th>Name</th>
            <th>Side</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          {paddlers.map((p) => (
            <tr key={p.id} onClick={() => onPaddlerClicked?.(p)}>
              <td>
                <input
                  className="table-checkbox"
                  type="checkbox"
                  checked={selected.some((paddler) => paddler.id === p.id)}
                  onClick={(event) => event.stopPropagation()}
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
