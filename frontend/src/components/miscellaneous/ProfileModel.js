import { useState, useEffect } from "react";
import "./ProfileModel.css";
import { FaEye } from "react-icons/fa";

const ProfileModal = ({ user, isOpen: controlledOpen, onClose, children }) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const open = () => setInternalOpen(true);
  const close = () => {
    if (onClose) onClose();
    else setInternalOpen(false);
  };

  return (
    <>
      {/* Trigger (only if not controlled) */}
      {!isControlled && (
        <button
          className="open-profile-modal-btn open-group-modal-btn"
          onClick={open}
        >
          <FaEye style={{ fontSize: "20px", color: "#555" }} />
        </button>
      )}

      {isOpen && user && (
        <div className="profile-modal-overlay" onClick={close}>
          <div
            className="profile-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={close} className="modal-close-btn">
              ×
            </button>
            <img
              src={user.pic || "https://via.placeholder.com/150"}
              alt={user.name}
              className="profile-img"
            />
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;
