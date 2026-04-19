import api from "./axios";

export const startSpeedGame = () =>
  api.post("/speed/start");

export const submitSpeedGuess = (sessionId, guess, attempts) =>
  api.post("/speed/guess", { sessionId, guess, attempts });