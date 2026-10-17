import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Paddler } from "../../types";
import "./AddPaddlerToCrew.scss";
import PaddlerTable from "../PaddlerTable/PaddlerTable";

interface AddPaddlerToCrewProps {
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  paddlers: Paddler[]; // List of all paddlers on team
  crewPaddlers: Paddler[]; // List of all paddlers on the current crew
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

  const onPaddlerChecked = (paddlers: Paddler[]) => {
    setSelected(paddlers);
  };

  return (
    <div className={`add-to-crew-container ${isOpen ? "" : "hidden"}`}>
      <div className="add-to-crew-bg"></div>
      <div className="add-to-crew-modal">
        <PaddlerTable
          paddlers={paddlers}
          initialSelection={selected}
          onChecked={onPaddlerChecked}
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
