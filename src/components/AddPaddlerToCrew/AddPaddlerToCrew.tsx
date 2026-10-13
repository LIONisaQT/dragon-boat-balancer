import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Paddler } from "../../types";
import "./AddPaddlerToCrew.scss";

interface AddPaddlerToCrewProps {
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  paddlers: Paddler[]; // List of all paddlers on team
  crewPaddlers: Paddler[];
  addToRosterClicked: (paddlers: Paddler[]) => void;
}

function AddPaddlerToCrew({
  openState,
  paddlers,
  crewPaddlers,
  addToRosterClicked,
}: AddPaddlerToCrewProps) {
  const [isOpen, setOpen] = openState;
  const [selected, setSelected] = useState<Paddler[]>(crewPaddlers);

  useEffect(() => {
    if (isOpen) setSelected(crewPaddlers);
  }, [isOpen, crewPaddlers]);

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

  return (
    <div className={`add-to-crew-container ${isOpen ? "" : "hidden"}`}>
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
              <td>
                <p>{p.name}</p>
              </td>
              <td>{p.side}</td>
              <td>{p.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => {
          addToRosterClicked(selected);
          setOpen(false);
        }}
      >
        Add to roster
      </button>
    </div>
  );
}

export default AddPaddlerToCrew;
