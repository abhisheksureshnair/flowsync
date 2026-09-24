import axios from "axios";
import { buildTaskAnalysisPrompt } from "../prompts/taskAnalysis.prompts.js";
import { buildChatPrompt } from "../prompts/aiChat.prompts.js";

export const analyzeTasks = async (tasks, settings) => {
  const { apiKey, baseUrl, model, temperature, maxTokens } = settings;
  // Validate Environment Variables
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is missing in .env");
  }

  if (!baseUrl) {
    throw new Error("NVIDIA_BASE_URL is missing in .env");
  }

  if (!model) {
    throw new Error("NVIDIA_MODEL is missing in .env");
  }

  const prompt = buildTaskAnalysisPrompt(tasks);

  console.log("Service Started");
  try {
    console.log("Sending request to NVIDIA...");
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: model,
        messages: [
          {
            role: "system",
            content: "You are Echo AI, an intelligent productivity assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        // temperature: 0.3,
        // max_tokens: 1500
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Received NVIDIA Response");
    const aiContent = response.data.choices[0].message.content;
    console.log("+++++++++++++++++++++", aiContent);
    return aiContent;
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          throw new Error("Invalid NVIDIA API Key.");

        case 403:
          throw new Error("Access denied to this NVIDIA model.");

        case 404:
          throw new Error("Model or endpoint not found.");

        case 408:
          throw new Error("AI request timed out.");

        case 429:
          throw new Error("AI service is busy. Please try again later.");

        case 500:
          throw new Error("NVIDIA AI internal error.");

        case 503:
          throw new Error("NVIDIA AI service unavailable.");

        default:
          throw new Error(
            error.response.data?.error?.message || "Unknown AI error."
          );
      }
    }

    if (error.request) {
      throw new Error("Unable to connect to NVIDIA AI.");
    }

    throw error;
  }
};

export const aiChatWith = async (tasks, message, userName, settings) => {
  const { apiKey, baseUrl, model, temperature, maxTokens } = settings;
  const prompt = buildChatPrompt(userName, tasks, message);
  try {
    console.log("Sending request to NVIDIA...");
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: model,
        messages: [
          {
            role: "system",
            content:
              "You are Echo AI, the AI assistant for FlowSync. Always follow the user's workspace rules and the instructions provided in the user message.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        //timeout: 60000,
      }
    );
    const aiResponce = response.data.choices[0].message.content;
    return aiResponce;
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          throw new Error("Invalid NVIDIA API Key.");

        case 403:
          throw new Error("Access denied to this NVIDIA model.");

        case 404:
          throw new Error("Model or endpoint not found.");

        case 408:
          throw new Error("AI request timed out.");

        case 429:
          throw new Error("AI service is busy. Please try again later.");

        case 500:
          throw new Error("NVIDIA AI internal error.");

        case 503:
          throw new Error("NVIDIA AI service unavailable.");

        default:
          throw new Error(
            error.response.data?.error?.message || "Unknown AI error."
          );
      }
    }

    if (error.request) {
      throw new Error("Unable to connect to NVIDIA AI.");
    }

    throw error;
  }
};
