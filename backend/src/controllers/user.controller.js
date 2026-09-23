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

    const users = await User.find(filter, "_id name username role profileImage team teamId");
    return res.status(200).json({
      success: true,
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
