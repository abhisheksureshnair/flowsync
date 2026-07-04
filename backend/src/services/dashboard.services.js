import Task from "../models/Task.js";

export const findFinished = async (user) => {
  if (user) {
    const findFinishedTask = await Task.countDocuments({
      assignedTo: user,
      status: "Completed",
    });
    const findInProcessTask = await Task.countDocuments({
      assignedTo: user,
      status: "In Progress",
    });
    const findNotCompleted = await Task.countDocuments({
      assignedTo: user,
      status: "Todo",
    });
    return {
      finishedTaskCount: findFinishedTask,
      inProcessTaskCount: findInProcessTask,
      notCompletedTaskCount: findNotCompleted,
    };
  }
};
export const findNextCloseTask = async (user) => {
  if (user) {
    const nextClosetask = await Task.findOne({
      assignedTo: user,
      dueDate: { $gte: new Date() },
      status: { $ne: "Completed" },
    }).sort({ dueDate: 1 });

    return nextClosetask;
  }
};
export const findCompledThisWeek = async (user) => {
  if (user) {
    const today = new Date();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    const completedThisWeek = await Task.countDocuments({
      assignedTo: user,
      updatedAt: {
        $gte: startOfWeek,
        $lt: endOfWeek,
      },
      status: "Completed",
    });

    return completedThisWeek;
  }
};
