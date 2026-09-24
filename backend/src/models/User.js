import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    hashedPassword: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Admin", "Manager", "Member"],
      default: "Member",
    },

    team: {
      type: String,
      trim: true,
      default: "",
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },

    profileImage: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
