import { useEffect } from "react";
import "./FirstTimeUserModal.scss";

interface FirstTimeUserModalProps {
  onClose: () => void;
}

function FirstTimeUserModal({ onClose }: FirstTimeUserModalProps) {
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
        <p>Thanks for checking out my dragon boat crew manager.</p>
        <p>
          To use this app, create a crew, then create some paddlers, then click
          into a crew to add your team's paddlers to the crew's roster.
        </p>
        <p>
          No account is needed. To share your team, tap the team ID to copy your
          ID, then send that ID to another user. That user then needs to click
          the edit icon and change their team ID to the one you sent.
        </p>
        <p>
          If you have any questions/requests, please email me at{" "}
          <a href="mailto:ryan@ryanshee.com">ryan@ryanshee.com</a>.
        </p>
        <button onClick={onClose}>Continue</button>
      </div>
    </div>
  );
}

export default FirstTimeUserModal;
