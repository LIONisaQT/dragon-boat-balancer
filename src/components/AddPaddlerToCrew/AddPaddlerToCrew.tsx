import { Dispatch, SetStateAction } from "react";
import { Paddler } from "../../types";
import "./AddPaddlerToCrew.scss";
import PaddlerTable from "../PaddlerTable/PaddlerTable";

interface AddPaddlerToCrewProps {
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  paddlers: Paddler[]; // List of all paddlers on team
  selected: Paddler[];
  onSelectionChange: (paddlers: Paddler[]) => void;
  addToRosterClicked: (paddlers: Paddler[]) => void;
}

function AddPaddlerToCrew({
  openState,
  paddlers,
  selected,
  onSelectionChange,
  addToRosterClicked,
}: AddPaddlerToCrewProps) {
  const [isOpen, setOpen] = openState;

  return (
    <div className={`add-to-crew-container ${isOpen ? "" : "hidden"}`}>
      <div className="add-to-crew-bg"></div>
      <div className="add-to-crew-modal">
        <PaddlerTable
          paddlers={paddlers}
          selected={selected}
          onSelectionChange={onSelectionChange}
          onPrimaryClicked={() => {
            addToRosterClicked(selected);
            setOpen(false);
          }}
          primaryButtonText="Update crew"
          onSecondaryClicked={() => setOpen(false)}
          secondaryButtonText="Close"
        />
      </div>
    </div>
  );
}

export default AddPaddlerToCrew;
