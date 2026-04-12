import api from "./axios";

export const fetchDailyInfo = () =>
  api.get("/game/daily-info");

export const submitGuessApi = (guess) =>
  api.post("/game/guess", { guess });

export const checkAlreadyPlayed = () =>
  api.get("/game/already-played");