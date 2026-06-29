import Tasks from "../models/Task.js";

export const getDashBoard = async (req, res) => {
  const total = await Tasks.countDocuments();
  const totalTasks = await Tasks.countDocuments();

  return res.json({
    success: true,
    totalTasks,
  });
};
