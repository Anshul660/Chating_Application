require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET); 
const express = require("express");

const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);


const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  // Fix is here ↓
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}



// ERROR HANDLERS
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const io = socketIO(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

// 💖 Attach io to app for controller access
app.set("io", io);

// SOCKET.IO SETUP
io.on("connection", (socket) => {
  console.log("Socket connected");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (messageReceived) => {
    const chat = messageReceived.chat;
    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (user._id === messageReceived.sender._id) return;
      socket.in(user._id).emit("message recieved", messageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// DEPLOY
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on PORT ${PORT}`.yellow.bold)
);
