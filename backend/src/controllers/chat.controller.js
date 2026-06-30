import { response } from "express";
import Chat from "../models/Chat.js";
import { fetchTheChat, sendMessage } from "../services/chat.services.js";

export const allChat = async (req, res) => {
  try {
    const user = req.user.id;
    const findUserAllChat = await Chat.find({ sender: user });
    return res.status(200).json({
      success: true,
      data: findUserAllChat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendChat = async (req, res) => {
  try {
    const sender = req.user.id;
    const { receiver, message, isRead, timestamps } = req.body;
    const response = await sendMessage(
      sender,
      receiver,
      message,
      isRead,
      timestamps
    );
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reciveChat = async (req, res) => {
  try {
    const { receiver } = req.body;
    const sender = req.user.id;
    const responce = await fetchTheChat(sender, receiver);

    return res.status(200).json({
      success: true,
      data: responce,
    });
  } catch (error) {
    console.log("ERRORRRRRR   ", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
