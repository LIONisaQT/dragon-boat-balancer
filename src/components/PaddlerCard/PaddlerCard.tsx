import "./PaddlerCard.scss";
import { BoatPaddler, Paddler, PaddlerLocation } from "../../types";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

interface PaddlerProps {
  details: Paddler | null;
  location: PaddlerLocation;
  position: number | "drum" | "steer";
  onClick: (paddler: BoatPaddler) => void;
  onEdit: () => void;
  onDelete: (
    paddler: Paddler,
    location: PaddlerLocation,
    position: number | "drum" | "steer",
  ) => void;
}

export default function PaddlerCard({
  details,
  position,
  location,
  onClick,
  onEdit,
  onDelete,
}: PaddlerProps) {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(
    cardRef,
    () => setPopupOpen((prev) => !prev),
    () => setPopupOpen(false),
    [popupRef],
  );

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
    isDragging,
    over,
  } = useDraggable({
    id: `${
      details
        ? `paddler-${details.name}-${location}-${position}`
        : `empty-${location}-${position}`
    }`,
    data: { details, position, location },
    disabled: !details,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `${
      details
        ? `paddler-${details.name}-${location}-${position}`
        : `empty-${location}-${position}`
    }`,
    data: { details, position, location },
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  };

  useEffect(() => {
    if (isDragging) setPopupOpen(false);
  }, [isDragging]);

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
        <div
          className="info-card"
          ref={cardRef}
          onClick={() => onClick({ details, location, position })}
        >
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
            <p className="power">{details.power}</p>
            <p className="height">{details.height}</p>
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
      <div
        ref={popupRef}
        className={`popup-container ${isPopupOpen ? "" : "hidden"}`}
      >
        <button onClick={() => details && onEdit()} title="Edit">
          ✍️
        </button>
        <button
          onClick={() => details && onDelete(details, location, position)}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
