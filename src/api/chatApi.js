import api from "./axios"

export const getChat = () => {
    return api.get("/chat/all")
}
export const sendChat = (data) => {
    return api.post("/chat/send", data)
}

export const fetchChat = (data) => {
    return api.post("/chat/fetchchat", data)
}