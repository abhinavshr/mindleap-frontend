import api from "./axios";

export const getMyLevel = () =>
  api.get("/level/me");