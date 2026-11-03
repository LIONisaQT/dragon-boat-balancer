import { Paddler } from "../../types";
import "./AddPaddlerToCrew.scss";
import PaddlerTable from "../PaddlerTable/PaddlerTable";

interface AddPaddlerToCrewProps {
  isOpen: boolean;
  onClose: () => void;
  paddlers: Paddler[]; // List of all paddlers on team
  selected: Paddler[];
  onSelectionChange: (paddlers: Paddler[]) => void;
  onAddToRoster: (paddlers: Paddler[]) => void;
}

function AddPaddlerToCrew({
  isOpen,
  onClose,
  paddlers,
  selected,
  onSelectionChange,
  onAddToRoster,
}: AddPaddlerToCrewProps) {
  return (
    <div className="modal-overlay" hidden={!isOpen}>
      <div
        className="modal-panel add-to-crew-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Update crew"
      >
        <PaddlerTable
          paddlers={paddlers}
          selected={selected}
          onSelectionChange={onSelectionChange}
          onPrimaryAction={() => {
            onAddToRoster(selected);
            onClose();
          }}
          primaryActionLabel="Update crew"
          onSecondaryAction={onClose}
          secondaryActionLabel="Close"
        />
      </div>
    </div>
  );
}

export default AddPaddlerToCrew;
