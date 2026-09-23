import Tasks from "../models/Task.js";
import User from "../models/User.js";
import {
  findCompledThisWeek,
  findFinished,
  findNextCloseTask,
} from "../services/dashboard.services.js";

export const getDashBoard = async (req, res) => {
  try {
    let teamFilter = {};
    if (req.user?.teamId || req.user?.team) {
      const orConditions = [];
      if (req.user.teamId) orConditions.push({ teamId: req.user.teamId });
      if (req.user.team) orConditions.push({ team: req.user.team });
      if (orConditions.length > 0) teamFilter = { $or: orConditions };
    }

    const totalTasks = await Tasks.countDocuments(teamFilter);
    const activeProjectFilter = { assignedTo: req.user.id };
    if (teamFilter.$or) {
      activeProjectFilter.$or = teamFilter.$or;
    }
    const activeProject = await Tasks.countDocuments(activeProjectFilter);
    const totalMembers = await User.countDocuments(teamFilter);
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
