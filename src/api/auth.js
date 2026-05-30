import api from "./axios";

export const registerUser = (data) =>
  api.post("/auth/register", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const logoutUser = () =>
  api.post("/auth/logout");

export const refreshToken = () =>
  api.post("/auth/refresh-token");

export const getMe = () =>
  api.get("/auth/me");

export const getPublicProfile = (username) =>
  api.get(`/auth/profile/${username}`);

export const requestPasswordReset = (email) =>
  api.post("/auth/forgot-password", { email });

export const verifyResetOtp = (email, otp) =>
  api.post("/auth/verify-reset-otp", { email, otp });