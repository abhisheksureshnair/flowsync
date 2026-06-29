import api from "./axios";

export const allUser = () => {
    return api.get('/users')
}