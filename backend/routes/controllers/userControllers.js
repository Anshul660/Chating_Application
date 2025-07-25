const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel");
const generateToken = require("../../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  // 1) pull every field out of req.body
  const { name, email, password, pic } = req.body;

  // 2) check them all
  if (!name || !email || !password || !pic) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // 3) see if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // 4) create the new user
  const user = await User.create({ name, email, password, pic });

  if (user &&(await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create user kyun");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

//api/users?search=p
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find({
    ...keyword,
    _id: { $ne: req.user._id },
  });

  res.send(users);
}); 


module.exports = { registerUser, authUser , allUsers};
