import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const userTeam = req.user?.team;
    const userTeamId = req.user?.teamId;

    const filter = {};
    if (userTeamId || userTeam) {
      filter.$or = [
        ...(userTeamId ? [{ teamId: userTeamId }] : []),
        ...(userTeam ? [{ team: userTeam }] : []),
      ];
    }

    const users = await User.find(filter, "_id name username role profileImage bio team teamId");
    return res.status(200).json({
      success: true,
      users: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user?.id || req.body?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to update profile picture",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Build the public URL for the uploaded profile picture
    const protocol = req.protocol;
    const host = req.get("host");
    const imageUrl = `${protocol}://${host}/uploads/profiles/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true, select: "_id name username email role bio team teamId profileImage" }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      profileImage: imageUrl,
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio || "",
        team: updatedUser.team || "",
        teamId: updatedUser.teamId || null,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Error in uploadProfilePicture:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload profile picture",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.body?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const { name, email, role, bio } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (bio !== undefined) updateData.bio = bio;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: "_id name username email role bio team teamId profileImage" }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio || "",
        team: updatedUser.team || "",
        teamId: updatedUser.teamId || null,
        profileImage: updatedUser.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};
