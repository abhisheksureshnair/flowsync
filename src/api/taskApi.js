import api from "./axios";

export const addNewTask = (data) => {
    return api.post('/task/addnewtask', data)
}