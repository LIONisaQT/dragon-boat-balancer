import { Paddler } from "../../types";
import { sanitizeNumber, sanitizeText } from "../../utils/utils";
import "./AddNewPaddler.scss";
import { useEffect, useState } from "react";

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
  isOpen: boolean;
  onClose: () => void;
  paddler: Paddler | null;
  onSubmit: (paddler: Paddler) => void;
}

export default function AddNewPaddler({
  isOpen,
  onClose,
  paddler = null,
  onSubmit,
}: AddNewPaddlerProps) {
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
    onSubmit({
      id: paddler?.id ?? crypto.randomUUID(),
      ...formValues,
    });
  };

  return (
    <div
      className="modal-overlay"
      hidden={!isOpen}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        className="modal-panel new-paddler-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paddler-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <h2 id="paddler-modal-title">
          {paddler ? "Edit paddler" : "Add paddler"}
        </h2>
        <section>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            className="text-input paddler-name-input"
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
            className="select-input"
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
            className="text-input paddler-weight-input"
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
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
