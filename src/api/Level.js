import api from "./axios";

export const getMyLevel  = () => api.get("/level/me");
export const getMyBadges = () => api.get("/level/badges");