import { taskServices } from "../services/task.services.js";

export const addNewTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, project } =
      req.body;

    const response = await taskServices(
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      project
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
