import Tasks from "../models/Task.js";
import User from "../models/User.js";
import {
  findCompledThisWeek,
  findFinished,
  findNextCloseTask,
} from "../services/dashboard.services.js";

export const getDashBoard = async (req, res) => {
  try {
    const totalTasks = await Tasks.countDocuments();
    const activeProject = await Tasks.countDocuments({
      assignedTo: req.user.id,
    });
    const totalMembers = await User.countDocuments();
    const [userFinished, upcomingNextTask, completedThisWeek] =
      await Promise.all([
        findFinished(req.user.id),
        findNextCloseTask(req.user.id),
        findCompledThisWeek(req.user.id),
      ]);

    console.log(
      "__________________________ totalTasks",
      totalTasks,
      "activeProject----",
      activeProject,
      "totalMembers ---- ",
      totalMembers,
      "userFinished ---- ",
      userFinished,
      "upcomingNextTask ---- ",
      upcomingNextTask,
      "upcomingNextTask ----- ",
      upcomingNextTask
    );
    return res.status(200).json({
      success: true,
      totalTasks: totalTasks,
      activeProject: activeProject,
      totalMembers: totalMembers,
      userfinsished: userFinished,
      upcomingNextTask: upcomingNextTask,
      completedThisWeek: completedThisWeek,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
