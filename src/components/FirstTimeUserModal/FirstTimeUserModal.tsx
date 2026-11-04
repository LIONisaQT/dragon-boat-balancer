import { useEffect, useState } from "react";
import "./FirstTimeUserModal.scss";

interface FirstTimeUserModalProps {
  onClose: () => void;
}

function FirstTimeUserModal({ onClose }: FirstTimeUserModalProps) {
  const [openDetails, setOpenDetails] = useState("use");

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel first-time-user-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-time-user-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close welcome message"
        >
          ✕
        </button>
        <h2 id="first-time-user-modal-title">Welcome!</h2>
        <div className="modal-body">
          <p>Thanks for checking out my dragon boat crew manager.</p>
          <details open={openDetails === "use"}>
            <summary
              onClick={(event) => {
                event.preventDefault();
                setOpenDetails((prev) => (prev === "use" ? "" : "use"));
              }}
            >
              How to use
            </summary>
            <ol>
              <li>Create a crew.</li>
              <li>Create some paddlers.</li>
              <li>Click into a crew.</li>
              <li>Update the crew's roster with the paddlers you created.</li>
              <li>Build your lineup!</li>
            </ol>
          </details>
          <details open={openDetails === "share"}>
            <summary
              onClick={(event) => {
                event.preventDefault();
                setOpenDetails((prev) => (prev === "share" ? "" : "share"));
              }}
            >
              How to share
            </summary>
            <ol>
              <li>Person 1: Tap the team ID to copy the ID.</li>
              <li>Person 1: Send the team ID to Person 2.</li>
              <li>Person 2: Click the edit icon next to their team ID.</li>
              <li>Person 2: Change their team ID to the ID Person 1 sent.</li>
            </ol>
          </details>
          <p>
            If you have any questions/requests, please email me at{" "}
            <a href="mailto:ryan@ryanshee.com">ryan@ryanshee.com</a>.
          </p>
        </div>
        <button onClick={onClose}>Continue</button>
      </div>
    </div>
  );
}

export default FirstTimeUserModal;
