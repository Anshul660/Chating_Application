import React, { useState } from "react";
import axios from "axios";
import "./GroupChatModal.css";
import { ChatState } from "../../Context/ChatProvider";
import UserListItem from "../UserAvater/UserListltem";

const GroupChatModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { user, chats, setChats } = ChatState();

  const handleGroup = (userToAdd) => {
    if (selectedUsers.find((u) => u._id === userToAdd._id)) return;
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query.trim()) return;

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      console.error("Search error:", error);
      setLoading(false);
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      alert("Please fill all fields");
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChats([data, ...chats]);
      setIsOpen(false);
      setGroupChatName("");
      setSelectedUsers([]);
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      console.error(
        "Group creation error:",
        error.response?.data || error.message
      );
      alert("Failed to create group chat");
    }
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Group Chat</h2>
              <button className="close-button" onClick={() => setIsOpen(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <input
                type="text"
                placeholder="Chat Name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Add Users eg: John, Piyush"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />

              <div className="selected-users">
                {selectedUsers.map((u) => (
                  <div className="user-badge" key={u._id}>
                    {u.name}
                    <span
                      className="remove-icon"
                      onClick={() => handleDelete(u)}
                    >
                      &times;
                    </span>
                  </div>
                ))}
              </div>

              <div className="search-results">
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  searchResult
                    ?.slice(0, 4)
                    .map((user) => (
                      <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={() => handleGroup(user)}
                      />
                    ))
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={handleSubmit}>Create Chat</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;
