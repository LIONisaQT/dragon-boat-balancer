import "./PaddlerCard.scss";
import { Paddler, PaddlerLocation } from "../../types";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface PaddlerProps {
  details: Paddler | null;
  location: PaddlerLocation;
  position: number | "drum" | "steer";
}

export default function PaddlerCard({
  details,
  position,
  location,
}: PaddlerProps) {
  const id = details
    ? `paddler-${details.id}`
    : `empty-${location}-${position}`;

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
    isDragging,
    over,
  } = useDraggable({
    id,
    data: { details, position, location },
    disabled: !details,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id,
    data: { details, position, location },
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  };

  return (
    <div
      ref={setNodeRef}
      className={`paddler-card ${details ? "details" : "empty"} ${
        isDragging ? `dragging ${over ? "" : "return"}` : ""
      } ${isOver ? "dragged-over" : ""}`}
      style={style}
      {...listeners}
      {...attributes}
    >
      {details ? (
        <div className="info-card">
          <p className="name-container">
            {typeof position === "number" &&
            (location === "left" || location === "right") ? (
              <span>{position + 1}. </span>
            ) : null}
            <span className="name">{details.name}</span>
          </p>
          <div className="info">
            <p className={`${details.side} side`}>
              {details.side[0].toUpperCase()}
            </p>
            <p className="weight">{details.weight}</p>
          </div>
        </div>
      ) : (
        <div className="empty-slot">
          <p>
            {location !== "left" && location !== "right"
              ? location.charAt(0).toUpperCase() + location.slice(1)
              : "Empty"}
          </p>
        </div>
      )}
    </div>
  );
}
