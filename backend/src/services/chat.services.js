import Chat from "../models/Chat.js";

export const sendMessage = async (
  sender,
  receiver,
  message,
  isRead,
  timestamps
) => {
  if (message && receiver && sender != receiver) {
    const newChat = new Chat({
      sender,
      receiver,
      message,
      isRead,
      timestamps,
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

export const fetchTheChat = async (sender, receiver) => {
  if (sender && receiver) {
    const chats = await Chat.find({
      $or: [
        { sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    });

    return chats;
  } else {
    const error = new Error("An error occured");
    error.statusCode = 406;
    throw error;
  }
};
