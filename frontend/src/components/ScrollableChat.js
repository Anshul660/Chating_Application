import React, { useEffect, useRef } from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { formatTime, formatDateSeparator } from "../util/formateDate";
import "./ScrollableChat.css";

const emojiPairs = [["📩", "💌"]];

const getEmojiPair = (msg) => {
  const index = msg.content.length % emojiPairs.length;
  return emojiPairs[index];
};

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const scrollBottomRef = useRef(null);

  useEffect(() => {
    scrollBottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderWithDateSeparators = () => {
    const items = [];
    let lastDate = null;

    messages.forEach((m, i) => {
      const msgDate = new Date(m.createdAt).toDateString();
      if (msgDate !== lastDate) {
        lastDate = msgDate;
        items.push(
          <div key={`date-${i}`} className="date-separator">
            <span>{formatDateSeparator(m.createdAt)}</span>
          </div>
        );
      }

      const isSender = m.sender._id === user._id;
      const isFirst = i === 0;
      const [unseenEmoji, seenEmoji] = getEmojiPair(m);

      // ✅ FIXED: Correct logic for seen/unseen
      const hasBeenSeen = isSender
        ? m.seenBy?.some((uid) => uid.toString() !== user._id.toString()) // For sender: check if anyone else has seen it
        : m.seenBy?.includes(user._id); // For receiver: check if current user has seen it

      items.push(
        <div className="chat-line" key={m._id}>
          {(isSameSender(messages, m, i, user._id) ||
            isLastMessage(messages, i, user._id)) && (
            <div className="avatar-container" title={m.sender.name}>
              <img className="avatar" src={m.sender.pic} alt={m.sender.name} />
            </div>
          )}

          <div
            className="chat-bubble"
            style={{
              backgroundColor: isSender ? "#BEE3F8" : "#B9F5D0",
              marginLeft: isSameSenderMargin(messages, m, i, user._id),
              marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
            }}
          >
            {isFirst && !isSender && <div className="first-flair">🥺 👉👈</div>}

            <span>{m.content}</span>

            <div className="message-footer">
              <span className="message-time">{formatTime(m.createdAt)}</span>
              {/* ✅ SEEN/UNSEEN ICON - Time के right में */}
              {isSender && (
                <span className="seen-status">
                  {hasBeenSeen ? seenEmoji : unseenEmoji}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    });

    return items;
  };

  return (
    <ScrollableFeed>
      {renderWithDateSeparators()}
      <div ref={scrollBottomRef} />
    </ScrollableFeed>
  );
};

export default ScrollableChat;
