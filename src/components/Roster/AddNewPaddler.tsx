import { Paddler } from "../../types";
import { sanitizeNumber, sanitizeText } from "../../utils/utils";
import "./AddNewPaddler.scss";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type PaddlerFormValues = Pick<
  Paddler,
  "name" | "side" | "weight" | "power" | "height"
>;

const createInitialFormValues = (
  paddler: Paddler | null,
): PaddlerFormValues => ({
  name: paddler?.name ?? "",
  side: paddler?.side ?? "both",
  weight: paddler?.weight ?? 100,
  power: paddler?.power ?? 100,
  height: paddler?.height ?? 5.9,
});

const isPaddlerSide = (side: string): side is Paddler["side"] =>
  side === "left" || side === "right" || side === "both";

interface AddNewPaddlerProps {
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  paddler: Paddler | null;
  onSubmit: (paddler: Paddler, isNew: boolean) => void;
}

export default function AddNewPaddler({
  openState,
  paddler = null,
  onSubmit,
}: AddNewPaddlerProps) {
  const [isOpen, setOpen] = openState;
  const [formValues, setFormValues] = useState<PaddlerFormValues>(() =>
    createInitialFormValues(null),
  );

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      setFormValues(createInitialFormValues(paddler));
    } else {
      document.body.classList.remove("modal-open");
      setFormValues(createInitialFormValues(null));
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen, paddler]);

  const handleSubmit = () => {
    onSubmit(
      {
        id: paddler?.id ?? crypto.randomUUID(),
        ...formValues,
      },
      !paddler,
    );
  };

  return (
    <div className={`new-paddler-container ${isOpen ? "" : "hidden"}`}>
      <div className="background" onClick={() => setOpen(false)} />
      <div className="new-paddler-modal">
        <button className="close-button" onClick={() => setOpen(false)}>
          ✕
        </button>
        <h2>{paddler ? "Edit paddler" : "Add paddler"}</h2>
        <section>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            placeholder="Paddler name"
            value={formValues.name}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                name: sanitizeText(e.target.value),
              })
            }
          />
        </section>
        <section>
          <label htmlFor="side-pref">Side preference</label>
          <select
            id="side-pref"
            value={formValues.side}
            onChange={(e) => {
              if (isPaddlerSide(e.target.value)) {
                setFormValues({ ...formValues, side: e.target.value });
              }
            }}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="both">Both</option>
          </select>
        </section>
        <section>
          <label htmlFor="weight">Weight</label>
          <input
            type="number"
            id="weight"
            value={formValues.weight}
            min={1}
            max={999}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                weight: sanitizeNumber(e.target.value, 1, 999),
              })
            }
          />
        </section>
        <div className="button-group">
          <button
            onClick={handleSubmit}
            disabled={formValues.name.length === 0}
          >
            {paddler ? "Save" : "Add"}
          </button>
          <button onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
