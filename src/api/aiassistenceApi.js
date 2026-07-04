import api from "./axios"

export const addModel = (data) => {
    return api.post("/ai/addmodel", data)
}

export const fetchAIModels = () => {
    return api.get("/ai/fetchmodels")
}

export const getAiAssistence = () => {
    return api.get("/ai/assistence")
}

export const messageAI = (message) => {
    return api.post("/ai/aiChat", message)
}