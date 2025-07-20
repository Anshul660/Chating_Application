import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./SingleChat.css";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModel";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

const ENDPOINT = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const lastTypingTimeRef = useRef(null);

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      await axios.put(`/api/message/seen/${selectedChat._id}`, {}, config);

      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to load messages:", error);
      alert("Failed to Load Messages");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    socket.emit("stop typing", selectedChat._id);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/message",
        { content: newMessage, chatId: selectedChat._id },
        config
      );
      setNewMessage("");
      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
      scrollToBottom();
    } catch (error) {
      alert("Failed to send the message");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    lastTypingTimeRef.current = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTimeRef.current;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {

    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, [user]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", async (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification?.some((n) => n._id === newMessageReceived._id)) {
          setNotification((prev) => [newMessageReceived, ...(prev || [])]);
          setFetchAgain((prev) => !prev);
        }
      } else {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        await axios.put(
          `/api/message/seen/${selectedChatCompare._id}`,
          {},
          config
        );

        setMessages((prev) => [...prev, newMessageReceived]);
        scrollToBottom();
      }
    });
  }, [notification, setNotification, fetchAgain, setFetchAgain]);

  
  useEffect(() => {
    socket.on("message seen", ({ chatId, seenByUser }) => {
      if (selectedChat && selectedChat._id === chatId) {
        // Update messages state to reflect seen status
        setMessages((prevMessages) =>
          prevMessages.map((msg) => ({
            ...msg,
            seenBy: msg.seenBy?.includes(seenByUser)
              ? msg.seenBy
              : [...(msg.seenBy || []), seenByUser],
          }))
        );
      }
    });

    return () => {
      socket.off("message seen");
    };
  }, [selectedChat]);

  // ✅ NEW: Auto mark as seen when chat opens
  useEffect(() => {
    if (selectedChat && user) {
      const markAsSeen = async () => {
        try {
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };
          await axios.put(`/api/message/seen/${selectedChat._id}`, {}, config);
        } catch (error) {
          console.error("Error marking messages as seen:", error);
        }
      };

      markAsSeen();
    }
  }, [selectedChat, user]);

  return (
    <div className="single-chat">
      {selectedChat ? (
        <>
          <div className="chat-header">
            <div className="chat-header-flex">
              <div className="left-section">
                <button
                  className="back-button"
                  onClick={() => setSelectedChat(null)}
                >
                  ←
                </button>
              </div>
              <div className="center-section">
                <span className="chat-name">
                  {!selectedChat.isGroupChat
                    ? getSender(user, selectedChat.users)
                    : selectedChat.chatName.toUpperCase()}
                </span>
              </div>
              <div className="right-section">
                {!selectedChat.isGroupChat ? (
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                ) : (
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="chat-body">
            <div className="messages" style={{ scrollbarWidth: "none" }}>
              {loading ? (
                <div className="loading-spinner">Loading...</div>
              ) : (
                <>
                  <ScrollableChat messages={messages} />
                  <div ref={messagesEndRef} />
                </>
              )}
              <div style={{ height: "30px", marginBottom: "10px" }}>
                {isTyping && (
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    height={30}
                    style={{ marginBottom: 0 }}
                  />
                )}
              </div>
            </div>

            <div className="message-input-container">
              <div className="emoji-wrapper">
                <button
                  className="emoji-button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  😊
                </button>

                {showEmojiPicker && (
                  <div className="emoji-picker-popup">
                    <div className="emoji-header">
                      <span>Pick Emoji</span>
                      <button
                        className="close-emoji"
                        onClick={() => setShowEmojiPicker(false)}
                      >
                        ✖️
                      </button>
                    </div>
                    <Picker
                      onSelect={(emoji) =>
                        setNewMessage((prev) => prev + emoji.native)
                      }
                    />
                  </div>
                )}
              </div>

              <input
                type="text"
                className="message-input"
                placeholder="Enter a message..."
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={handleKeyDown}
              />
              <button className="send-button" onClick={sendMessage}>
                <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="no-chat-selected">
          <h2>Click on a user to start chatting</h2>
        </div>
      )}
    </div>
  );
};

export default SingleChat;
