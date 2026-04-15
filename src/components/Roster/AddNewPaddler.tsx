import { BoatPaddler, Paddler } from "../../types";
import { sanitizeNumber, sanitizeText } from "../../utils/utils";
import "./AddNewPaddler.scss";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface AddNewPaddlerProps {
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  paddler: BoatPaddler | null;
  onSubmit: (paddler: BoatPaddler, isNew: boolean) => void;
}

export default function AddNewPaddler({
  openState,
  paddler = null,
  onSubmit,
}: AddNewPaddlerProps) {
  const [isOpen, setOpen] = openState;
  const [name, setName] = useState<string>("");
  const [side, setSide] = useState("both");
  const [weight, setWeight] = useState(100);
  const [power, setPower] = useState(100);
  const [height, setHeight] = useState(5.9);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      setName(paddler ? paddler.details.name : "");
      setSide(paddler ? paddler.details.side : "both");
      setWeight(paddler ? paddler.details.weight : 100);
      setPower(paddler ? paddler.details.power : 100);
      setHeight(paddler ? paddler.details.height : 5.9);
    } else {
      document.body.classList.remove("modal-open");
      setName("");
      setSide("both");
      setWeight(100);
      setPower(100);
      setHeight(5.9);
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen, paddler]);

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
            value={name}
            onChange={(e) => setName(sanitizeText(e.target.value))}
          />
        </section>
        <section>
          <label htmlFor="side-pref">Side preference</label>
          <select
            id="side-pref"
            value={side}
            onChange={(e) =>
              setSide(e.target.value as "left" | "right" | "both")
            }
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="both">Both</option>
          </select>
        </section>
        <section>
          <label htmlFor="power">Power</label>
          <input
            type="number"
            id="power"
            placeholder={String(power)}
            value={power}
            min={1}
            max={999}
            onChange={(e) => setPower(sanitizeNumber(e.target.value, 1, 999))}
            onKeyDown={(e) => {
              if (
                [
                  "Backspace",
                  "Delete",
                  "Tab",
                  "Escape",
                  "Enter",
                  "ArrowLeft",
                  "ArrowRight",
                  "Home",
                  "End",
                ].includes(e.key)
              ) {
                return;
              }

              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }

              const currentValue = e.currentTarget.value;
              if (currentValue.length >= 3 && /[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          ></input>
        </section>
        <section>
          <label htmlFor="weight">Weight</label>
          <input
            type="number"
            id="weight"
            placeholder={String(weight)}
            value={weight}
            min={1}
            max={999}
            onChange={(e) => setWeight(sanitizeNumber(e.target.value, 1, 999))}
            onKeyDown={(e) => {
              if (
                [
                  "Backspace",
                  "Delete",
                  "Tab",
                  "Escape",
                  "Enter",
                  "ArrowLeft",
                  "ArrowRight",
                  "Home",
                  "End",
                ].includes(e.key)
              ) {
                return;
              }

              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }

              const currentValue = e.currentTarget.value;
              if (currentValue.length >= 3 && /[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          ></input>
        </section>
        <section>
          <label htmlFor="height">Height</label>
          <input
            type="number"
            id="height"
            placeholder={String(height)}
            value={height}
            min={0}
            max={7}
            onChange={(e) => setHeight(sanitizeNumber(e.target.value, 1, 999))}
            onKeyDown={(e) => {
              if (
                [
                  "Backspace",
                  "Delete",
                  "Tab",
                  "Escape",
                  "Enter",
                  "ArrowLeft",
                  "ArrowRight",
                  "Home",
                  "End",
                ].includes(e.key)
              ) {
                return;
              }

              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }

              const currentValue = e.currentTarget.value;
              if (currentValue.length >= 3 && /[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          ></input>
        </section>
        <div className="button-group">
          <button
            onClick={() =>
              onSubmit(
                {
                  details: {
                    id: paddler ? paddler.details.id : crypto.randomUUID(),
                    name,
                    side,
                    weight,
                    power,
                    height,
                  } as Paddler,
                  location: paddler ? paddler.location : "roster",
                  position: paddler ? paddler.position : 0,
                },
                !paddler,
              )
            }
            disabled={name.length === 0}
          >
            {paddler ? "Save" : "Add"}
          </button>
          <button onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
