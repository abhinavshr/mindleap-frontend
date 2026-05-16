import api from "./axios";

export const startSpeedGame = () =>
  api.post("/speed/start");

export const submitSpeedGuess = (sessionId, guess, attempts) =>
  api.post("/speed/guess", { sessionId, guess, attempts });

export const expireSpeedSession = (sessionId) =>
  api.post("/speed/expire", { sessionId });

export const getSpeedLeaderboard = () =>
  api.get("/speed/leaderboard");

export const getMySpeedStats = () =>
  api.get("/speed/stats");