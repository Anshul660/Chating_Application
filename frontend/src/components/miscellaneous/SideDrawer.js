import { useState, useRef, useEffect } from "react";
import "./SideDrawer.css";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModel";
import ChatLoading from "../ChatLoading";
import { useToast } from "../ui/toaster";
import axios from "axios";
import UserListItem from "../UserAvater/UserListltem";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const { showToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      showToast({
        title: "Please enter something to search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      showToast({
        title: "Error occurred",
        description: "Failed to load search results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setLoadingChat(false);
      setShowDrawer(false);
    } catch (error) {
      showToast({
        title: "Failed to load the chat",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoadingChat(false);
    }
  };

  const handleNotificationClick = (notif) => {
    setSelectedChat(notif.chat);
    setNotification(notification.filter((n) => n !== notif));
    setShowNotifications(false);
  };

  const removeNotification = (notif) => {
    setNotification(notification.filter((n) => n !== notif));
  };

  return (
    <>
      {/* Navbar */}
      <div className="navbar">
        <div className="search-container" onClick={() => setShowDrawer(true)}>
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search User"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <h2 className="chit-chat">Chit-Chat</h2>

        <div className="menu">
          <div className="dropdown-wrapper" ref={dropdownRef}>
            <button
              className="dropdown-button bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="fa-solid fa-bell"></i>
              {notification.length > 0 && <span className="notification-dot" />}
            </button>

            {showNotifications && (
              <div className="dropdown-menu">
                {notification.length === 0 ? (
                  <div className="dropdown-item">No new messages</div>
                ) : (
                  notification.map((notif, idx) => (
                    <div
                      key={idx}
                      className="dropdown-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        onClick={() => handleNotificationClick(notif)}
                        style={{ cursor: "pointer", flex: 1 }}
                      >
                        {notif.chat.isGroupChat
                          ? `New message in ${notif.chat.chatName}`
                          : `Message from ${notif.sender.name}`}
                      </span>
                      <span
                        onClick={() => removeNotification(notif)}
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                          color: "gray",
                        }}
                      >
                        ❌
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="dropdown-wrapper">
            <button
              className="dropdown-button"
              onClick={() => setShowMenu(!showMenu)}
            >
              {user?.pic ? (
                <img src={user.pic} alt={user.name} className="profile-pic" />
              ) : (
                <div className="user-initials">
                  {user?.name?.slice(0, 2).toUpperCase() || "NA"}
                </div>
              )}
              <i className="fas fa-caret-down"></i>
            </button>

            {showMenu && (
              <div className="dropdown-menu-profile">
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowMenu(false);
                  }}
                >
                  My Profile
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Left Drawer */}
      <div className={`left-drawer ${showDrawer ? "open" : ""}`}>
        <div className="left-drawer-header">
          <h3>Search User</h3>
          <button
            onClick={() => setShowDrawer(false)}
            className="drawer-close-btn"
          >
            &times;
          </button>
        </div>

        <div className="drawer-search-container">
          <input
            type="text"
            placeholder="Search by name or email"
            className="drawer-search-bar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={handleSearch}>Go</button>
        </div>

        {loading ? (
          <ChatLoading />
        ) : (
          searchResult.map((user) => (
            <UserListItem
              key={user._id}
              user={user}
              handleFunction={() => accessChat(user._id)}
            />
          ))
        )}
      </div>

      {/* My Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={user}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
};

export default SideDrawer;
