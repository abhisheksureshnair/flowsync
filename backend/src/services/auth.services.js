import User from "../models/User.js";
import Team from "../models/TeamName.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
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
      team: user.team || "",
      teamId: user.teamId || null,
      profileImage: user.profileImage || "",
      bio: user.bio || "",
    },
  };
};

export const registrationService = async (
  name,
  username,
  email,
  password,
  role,
  team
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

  // Resolve team & teamId
  let resolvedTeamName = "";
  let resolvedTeamId = null;

  if (team && typeof team === "string" && team.trim()) {
    const trimmed = team.trim();
    let teamDoc = null;
    if (mongoose.Types.ObjectId.isValid(trimmed)) {
      teamDoc = await Team.findById(trimmed);
    }
    if (!teamDoc) {
      teamDoc = await Team.findOne({ teamName: trimmed });
    }
    if (teamDoc) {
      resolvedTeamName = teamDoc.teamName;
      resolvedTeamId = teamDoc._id;
    } else {
      resolvedTeamName = trimmed;
    }
  }

  // Create user
  const newUser = new User({
    name,
    username,
    email,
    hashedPassword,
    role,
    team: resolvedTeamName,
    teamId: resolvedTeamId,
  });

  await newUser.save();

  return {
    user: {
      id: newUser._id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      team: newUser.team,
      teamId: newUser.teamId,
      profileImage: newUser.profileImage || "",
      bio: newUser.bio || "",
    },
  };
};
