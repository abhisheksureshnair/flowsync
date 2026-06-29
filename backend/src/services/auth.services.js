import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

export const loginService = async (username, password) => {
  const user = await User.findOne({ username: username });
  const token = generateToken(user);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);

  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: "Invalid password",
    });
  }

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

export const registrationService = async (
  name,
  username,
  email,
  password,
  role
) => {
  const existingUser = await User.findOne({ username });
  const hashedPassword = await bcrypt.hash(password, 10);

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Username already exists",
    });
  }

  // Check email
  const existingEmail = await User.findOne({ email });

  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }

  // Create user
  const newUser = new User({
    name,
    username,
    email,
    hashedPassword,
    role,
  });

  await newUser.save();

  return {
    user: newUser,
  };
};
