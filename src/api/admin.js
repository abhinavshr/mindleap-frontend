import adminApi from "./adminaxios";

export const fetchDashboardStats = () =>
  adminApi.get("/admin/dashboard/stats");

export const fetchUsers = (page = 1, limit = 10) =>
  adminApi.get("/admin/users", { params: { page, limit } });