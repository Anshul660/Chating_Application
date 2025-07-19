const express = require("express");
const {
  sendMessage,
  allMessages,
  markMessagesAsSeen,
} = require("./controllers/MessageControllers"); 

const { protect } = require("../middlewares/authmiddleware");

const router = express.Router();

router.route("/").post(protect, sendMessage);

router.route("/:chatId").get(protect, allMessages);


router.route("/seen/:chatId").put(protect, markMessagesAsSeen);

module.exports = router;
