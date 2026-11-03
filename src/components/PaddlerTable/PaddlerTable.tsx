import "./PaddlerTable.scss";

import { Paddler } from "../../types";

interface TableProps {
  paddlers: Paddler[];
  selected: Paddler[];
  onSelectionChange: (paddlers: Paddler[]) => void;
  onPaddlerClicked?: ((paddler: Paddler) => void) | null;
  onPrimaryAction?: (() => void) | null;
  primaryActionLabel?: string;
  onSecondaryAction?: (() => void) | null;
  secondaryActionLabel?: string;
}

function PaddlerTable({
  paddlers,
  selected,
  onSelectionChange,
  onPaddlerClicked = null,
  onPrimaryAction = null,
  primaryActionLabel = "Primary",
  onSecondaryAction = null,
  secondaryActionLabel = "Secondary",
}: TableProps) {
  const selectedIds = new Set(selected.map((paddler) => paddler.id));
  const allSelected =
    paddlers.length > 0 &&
    paddlers.every((paddler) => selectedIds.has(paddler.id));

  const onPaddlerChecked = (paddler: Paddler) => {
    onSelectionChange(
      selectedIds.has(paddler.id)
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
                  checked={selectedIds.has(p.id)}
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
      {(onPrimaryAction !== null || onSecondaryAction !== null) && (
        <div className="button-group">
          {onPrimaryAction && (
            <button onClick={onPrimaryAction}>{primaryActionLabel}</button>
          )}
          {onSecondaryAction && (
            <button onClick={onSecondaryAction}>{secondaryActionLabel}</button>
          )}
        </div>
      )}
    </div>
  );
}

export default PaddlerTable;
