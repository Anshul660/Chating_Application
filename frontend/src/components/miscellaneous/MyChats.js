import { useEffect, useState } from "react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import "./MyChats.css";
import { getSender } from "../../config/ChatLogics";
import GroupChatModal from "./GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/chat", config);
      // console.log("API call success:", data);
      setChats(data);
    } catch (error) {}
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <div className={`my-chats-wrapper ${selectedChat ? "hide-mobile" : ""}`}>
      <div className="my-chats-header">
        <h2>My Chats</h2>
        <GroupChatModal>
          <button className="group-chat-btn">+ New Group Chat</button>
        </GroupChatModal>
      </div>

      <div className="chats-container">
        {chats && chats.length > 0 ? (
          <div className="chat-stack">
            {chats.map((chat) => (
              <div
                className={`chat-box ${
                  selectedChat === chat ? "chat-selected" : ""
                }`}
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
              >
                <p className="chat-name">
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </p>
                {chat.latestMessage && (
                  <p className="chat-message">
                    <strong>
                      {chat.latestMessage?.sender?.name
                        ? `${chat.latestMessage.sender.name}: `
                        : ""}
                    </strong>

                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-chats">No chats found.</p>
        )}
      </div>
    </div>
  );
};

export default MyChats;
