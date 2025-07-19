const asyncHandler = require("express-async-handler");
const Message = require("../../models/messageModel");
const Chat = require("../../models/chatModel");

const allMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name pic email")
    .populate("chat");
  res.json(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) return res.sendStatus(400);

  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  let message = await Message.create(newMessage);

  message = await Message.findById(message._id)
    .populate("sender", "name pic email")
    .populate({
      path: "chat",
      populate: { path: "users", select: "name pic email" },
    });

  await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

  res.json(message);
});

const markMessagesAsSeen = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const result = await Message.updateMany(
    {
      chat: chatId,
      sender: { $ne: req.user._id },
      seenBy: { $ne: req.user._id },
    },
    { $addToSet: { seenBy: req.user._id } }
  );

  req.app.get("io")?.to(chatId).emit("message seen", {
    chatId,
    seenByUser: req.user._id,
  });

  res.status(200).json({
    message: "Messages marked as seen",
    updatedCount: result.modifiedCount,
  });
});

module.exports = {
  allMessages,
  sendMessage,
  markMessagesAsSeen,
};
