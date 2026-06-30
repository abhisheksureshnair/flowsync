import Task from "../models/Task.js";

export const taskServices = async (
  title,
  description,
  status,
  priority,
  dueDate,
  assignedTo,
  project,
  createdBy
) => {
  const existingTask = await Task.findOne({
    assignedTo,
    dueDate: new Date(dueDate),
  });

  if (existingTask && status != "Completed") {
    const error = new Error("This user already has a task on this date.");
    error.statusCode = 406;
    throw error;
  }

  // Map status from frontend to backend enum values
  let mappedStatus = "Todo";
  if (
    status === "In Process" ||
    status === "In Progress" ||
    status === "To Do" ||
    status === "Todo"
  ) {
    mappedStatus =
      status === "Completed"
        ? "Completed"
        : status === "In Process" || status === "In Progress"
        ? "In Progress"
        : "Todo";
  }

  const newTask = new Task({
    title,
    description,
    status: mappedStatus,
    priority,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    assignedTo,
    project: project || "General",
    createdBy,
  });

  await newTask.save();
  return {
    success: true,
    task: newTask,
  };
};
