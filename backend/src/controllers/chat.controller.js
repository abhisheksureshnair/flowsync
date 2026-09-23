import Chat from "../models/Chat.js";
import { fetchTheChat, sendMessage } from "../services/chat.services.js";

export const allChat = async (req, res) => {
  try {
    const user = req.user.id;
    const team = req.user?.team;
    const teamId = req.user?.teamId;

    const filter = { sender: user };
    if (teamId || team) {
      filter.$or = [
        ...(teamId ? [{ teamId }] : []),
        ...(team ? [{ team }] : []),
        { team: { $in: ["", null, undefined] } },
      ];
    }

    const findUserAllChat = await Chat.find(filter);
    return res.status(200).json({
      success: true,
      data: findUserAllChat,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendChat = async (req, res) => {
  try {
    const sender = req.user.id;
    const team = req.user?.team || "";
    const teamId = req.user?.teamId || null;
    const { receiver, message, isRead, timestamps } = req.body;
    const response = await sendMessage(
      sender,
      receiver,
      message,
      isRead,
      timestamps,
      team,
      teamId
    );
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reciveChat = async (req, res) => {
  try {
    const { receiver } = req.body;
    const sender = req.user.id;
    const team = req.user?.team || "";
    const teamId = req.user?.teamId || null;
    const responce = await fetchTheChat(sender, receiver, team, teamId);

    return res.status(200).json({
      success: true,
      data: responce,
    });
  } catch (error) {
    console.log("ERRORRRRRR   ", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
