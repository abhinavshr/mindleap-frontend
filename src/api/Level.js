import api from "./axios";

export const getMyLevel = () => api.get("/level/me");
export const getMyBadges = () => api.get("/level/badges");
export const getMyRewards = () => api.get("/level/rewards");
export const getAllLevels = () => api.get("/level/all");
export const getLeaderboard = () => api.get("/level/leaderboard");