import React from "react";
import "./UserBadgeItem";
import "./UserListltem.css";
const UserListItem = ({ user, handleFunction }) => {
  return (
    <div className="user-list-item" onClick={handleFunction}>
      <img src={user.pic} alt={user.name} className="user-avatar" />
      <div className="user-info">
        <h4 className="user-name">{user.name}</h4>
        <p className="user-email">{user.email}</p>
      </div>
    </div>
  );
};

export default UserListItem;
