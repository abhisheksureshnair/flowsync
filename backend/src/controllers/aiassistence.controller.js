import AISettings from "../models/AISettings.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { aiChatWith, analyzeTasks } from "../services/aiassistence.services.js";
import { decrypt, encrypt } from "../utils/encryption.js";

export const addAIModel = async (req, res) => {
  try {
    const { apiKey, provider, baseUrl, model, temperature, maxTokens } =
      req.body;
    const encryptedKey = encrypt(apiKey);
    await AISettings.updateMany(
      {
        user: req.user.id,
      },
      { status: "Disconnected" }
    );

    await AISettings.findOneAndUpdate(
      { user: req.user.id },
      {
        apiKey: encryptedKey,
        provider,
        baseUrl,
        model,
        temperature,
        maxTokens,
        status: "Connected",
      },
      {
        new: true,
        upsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Added Model Success",
    });
  } catch (error) {
    console.log("____________", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const aiassistence = async (req, res) => {
  console.log("AI Controller Called");
  try {
    const usertask = await Task.find({
      assignedTo: req.user.id,
    });
    const settings = await AISettings.findOne({
      user: req.user.id,
      status: "Connected",
    });
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "No AI provider connected.",
      });
    }
    // Decrypt API key
    const apiKey = decrypt(settings.apiKey);

    const aiResponce = await analyzeTasks(usertask, {
      apiKey,
      baseUrl: settings.baseUrl,
      model: settings.model,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
    });
    // console.log("Ai ------   Responce   -------", aiResponce);
    return res.status(200).json({
      success: true,
      data: aiResponce,
    });
  } catch (error) {
    console.log("AI Error -------- ", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const fetchAIModels = async (req, res) => {
  try {
    const user = req.user.id;
    const fetchModels = await AISettings.find({
      user: user,
    }).select("model provider status");
    return res.status(200).json({
      success: true,
      data: fetchModels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const aiChat = async (req, res) => {
  try {
    const { message } = req.body;

    const usertask = await Task.find({
      assignedTo: req.user.id,
    });
    const user = await User.findById(req.user.id);
    const userName = user.name;
    const settings = await AISettings.findOne({
      user: req.user.id,
      status: "Connected",
    });
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "No AI provider connected.",
      });
    }
    // Decrypt API key
    const apiKey = decrypt(settings.apiKey);

    const chatResponce = await aiChatWith(usertask, message, userName, {
      apiKey,
      baseUrl: settings.baseUrl,
      model: settings.model,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
    });

    res.status(200).json({
      success: true,
      data: chatResponce,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
