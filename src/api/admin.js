import adminApi from "./adminAxios";

export const fetchDashboardStats = () =>
  adminApi.get("/admin/dashboard/stats");