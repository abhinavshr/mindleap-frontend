import api from "./axios";

export const getLeaderboard = () =>
  api.get("/leaderboard");

export const getMyRank = () =>
  api.get("/leaderboard/me");