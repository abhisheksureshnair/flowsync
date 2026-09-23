import Task from "../models/Task.js";

export const taskServices = async (
  title,
  description,
  status,
  priority,
  dueDate,
  assignedTo,
  project,
  createdBy,
  team = "",
  teamId = null
) => {
  const assignedList = Array.isArray(assignedTo)
    ? assignedTo
    : assignedTo
    ? [assignedTo]
    : [];

  if (assignedList.length > 0 && dueDate) {
    const existingTask = await Task.findOne({
      assignedTo: { $in: assignedList },
      dueDate: new Date(dueDate),
      status: { $ne: "Completed" },
    });

    if (existingTask && status !== "Completed") {
      const error = new Error("One or more assigned users already have a task on this date.");
      error.statusCode = 406;
      throw error;
    }
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
    assignedTo: assignedList,
    project: project || "General",
    createdBy,
    team: team || "",
    teamId: teamId || null,
  });

  await newTask.save();
  return {
    success: true,
    task: newTask,
  };
};
