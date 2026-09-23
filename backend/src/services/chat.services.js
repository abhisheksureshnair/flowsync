import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const sendMessage = async (
  sender,
  receiver,
  message,
  isRead,
  timestamps,
  team = "",
  teamId = null
) => {
  if (message && receiver && sender != receiver) {
    // Validate receiver belongs to the same team
    if (team || teamId) {
      const receiverUser = await User.findById(receiver).select("team teamId");
      if (receiverUser) {
        const matchesTeamId = teamId && receiverUser.teamId && receiverUser.teamId.toString() === teamId.toString();
        const matchesTeamName = team && receiverUser.team && receiverUser.team === team;
        if (!matchesTeamId && !matchesTeamName) {
          const error = new Error("Users can only chat with members of their own team");
          error.statusCode = 403;
          throw error;
        }
      }
    }

    const newChat = new Chat({
      sender,
      receiver,
      message,
      isRead,
      timestamps,
      team: team || "",
      teamId: teamId || null,
    });
    await newChat.save();
    return {
      success: true,
      task: newChat,
    };
  } else {
    const error = new Error("An error occured");
    error.statusCode = 406;
    throw error;
  }
};

export const fetchTheChat = async (sender, receiver, team = "", teamId = null) => {
  if (sender && receiver) {
    const filter = {
      $or: [
        { sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    };

    if (teamId || team) {
      filter.$and = [
        {
          $or: [
            ...(teamId ? [{ teamId }] : []),
            ...(team ? [{ team }] : []),
            // Support legacy messages without team field
            { team: { $in: ["", null, undefined] } },
          ],
        },
      ];
    }

    const chats = await Chat.find(filter);
    return chats;
  } else {
    const error = new Error("An error occured");
    error.statusCode = 406;
    throw error;
  }
};
