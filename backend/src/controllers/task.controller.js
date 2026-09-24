import Task from "../models/Task.js";
import { taskServices } from "../services/task.services.js";

export const getAllTask = async (req, res) => {
  try {
    const userTeam = req.user?.team;
    const userTeamId = req.user?.teamId;

    const teamFilter = {};
    if (userTeamId || userTeam) {
      teamFilter.$or = [
        ...(userTeamId ? [{ teamId: userTeamId }] : []),
        ...(userTeam ? [{ team: userTeam }] : []),
      ];
    }

    const allTask = await Task.find(teamFilter).populate("assignedTo", "name username profileImage");
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
    const team = req.user?.team || "";
    const teamId = req.user?.teamId || null;

    const response = await taskServices(
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      project,
      createdBy,
      team,
      teamId
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
    const task = await Task.find({ createdBy: req.user.id }).populate("assignedTo", "name username profileImage");
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
    const task = await Task.find({ assignedTo: req.user.id }).populate("assignedTo", "name username profileImage");
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

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if the requesting user is assigned to this task
    const isAssigned =
      Array.isArray(task.assignedTo) &&
      task.assignedTo.some(
        (aId) => (aId?._id || aId).toString() === userId?.toString()
      );
    const isCreator = task.createdBy?.toString() === userId?.toString();
    const isAdmin = req.user?.role === "Admin";

    if (!isAssigned && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned user can change the task status",
      });
    }

    // Map status to schema enum: ["Todo", "In Progress", "Completed"]
    let mappedStatus = "Todo";
    const lower = String(status).trim().toLowerCase();
    if (lower === "completed" || lower === "complete" || lower === "done") {
      mappedStatus = "Completed";
    } else if (
      lower === "in process" ||
      lower === "in progress" ||
      lower === "inprogress" ||
      lower === "inprocess"
    ) {
      mappedStatus = "In Progress";
    } else if (
      lower === "to do" ||
      lower === "todo" ||
      lower === "pending"
    ) {
      mappedStatus = "Todo";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    task.status = mappedStatus;
    await task.save();

    const populatedTask = await Task.findById(task._id).populate(
      "assignedTo",
      "name username profileImage"
    );

    return res.status(200).json({
      success: true,
      message: `Task status updated to ${mappedStatus}`,
      data: populatedTask,
    });
  } catch (error) {
    console.error("Error in updateTaskStatus:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update task status",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const isAssigned =
      Array.isArray(task.assignedTo) &&
      task.assignedTo.some(
        (aId) => (aId?._id || aId).toString() === userId?.toString()
      );
    const isCreator = task.createdBy?.toString() === userId?.toString();
    const isAdmin = req.user?.role === "Admin";

    if (!isAssigned && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this task",
      });
    }

    if (updates.status) {
      const lower = String(updates.status).trim().toLowerCase();
      if (lower === "completed" || lower === "complete") {
        updates.status = "Completed";
      } else if (lower === "in process" || lower === "in progress") {
        updates.status = "In Progress";
      } else if (lower === "to do" || lower === "todo") {
        updates.status = "Todo";
      }
    }

    const updated = await Task.findByIdAndUpdate(id, updates, { new: true }).populate(
      "assignedTo",
      "name username profileImage"
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
