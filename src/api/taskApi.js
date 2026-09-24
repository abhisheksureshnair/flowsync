import api from "./axios";

export const allTask = () => {
  return api.get("/task/getAllTask");
};

export const addNewTask = (data) => {
  return api.post("/task/addnewtask", data);
};

export const getUserAddedTask = () => {
  return api.get("/task/getuseraddtask");
};

export const getUserTask = () => {
  return api.get("/task/getusertask");
};

export const updateTaskStatus = (taskId, status) => {
  return api.patch(`/task/${taskId}/status`, { status });
};

export const updateTask = (taskId, data) => {
  return api.patch(`/task/${taskId}`, data);
};