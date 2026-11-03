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
    <div className={`add-to-crew-container ${isOpen ? "" : "hidden"}`}>
      <div className="add-to-crew-bg"></div>
      <div className="add-to-crew-modal">
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
