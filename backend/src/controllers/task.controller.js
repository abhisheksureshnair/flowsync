import Task from "../models/Task.js";
import { taskServices } from "../services/task.services.js";

export const getAllTask = async (req, res) => {
  try {
    const allTask = await Task.find();
    return res.status(200).json({
      success: true,
      data: allTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addNewTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      project,
    } = req.body;
    const createdBy = req.user.id;
    const response = await taskServices(
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      project,
      createdBy
    );

    return res.status(200).json({
      success: true,
      task: response.task,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUseraddedTask = async (req, res) => {
  try {
    const task = await Task.find({ createdBy: req.user.id });
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserTask = async (req, res) => {
  try {
    const task = await Task.find({ assignedTo: req.user.id });
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch {}
};
