const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("./controllers/chatControllers");
const { protect } = require("../middlewares/authmiddleware");

const router = express.Router();

// Access or create one-to-one chat
router.route("/").post(protect, accessChat);

// Fetch all chats for a user
router.route("/").get(protect, fetchChats);

// Group chat operations
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/groupremove").put(protect, removeFromGroup);

module.exports = router;
