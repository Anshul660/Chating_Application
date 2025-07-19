import React from "react";
import "./UserBadgeItem.css";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <div className="user-badge-item" onClick={handleFunction}>
      <span className="user-badge-name">
        {user.name}
        {admin === user._id && <span className="admin-label"> (Admin)</span>}
      </span>
      <span className="close-icon">&times;</span>
    </div>
  );
};

export default UserBadgeItem;
