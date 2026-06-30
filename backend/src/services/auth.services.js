import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

export const loginService = async (username, password) => {
  const user = await User.findOne({ username: username });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);

  if (!isPasswordCorrect) {
    const error = new Error("Invalid password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

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
  if (existingUser) {
    const error = new Error("Username already exists");
    error.statusCode = 400;
    throw error;
  }

  // Check email
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    const error = new Error("Email already exists");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

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
