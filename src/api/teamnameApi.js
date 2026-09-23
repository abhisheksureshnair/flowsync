import api from "./axios";

export const fetchteamname = () => {
    return api.get("/teamname/fetchteamname");
};
export const addteamname = (data) => {
    return api.post("/teamname/addteamname", data)
}