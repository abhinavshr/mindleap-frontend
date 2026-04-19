import api from "./axios";

export const startSpeedGame = () =>
  api.post("/speed/start");
