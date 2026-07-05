import adminApi from "./adminaxios";

export const fetchDashboardStats = () =>
  adminApi.get("/admin/dashboard/stats");

export const fetchUsers = (page = 1, limit = 10) =>
  adminApi.get("/admin/users", { params: { page, limit } });

export const banUser = (id) =>
  adminApi.post(`/admin/users/ban/${id}`);

export const unbanUser = (id) =>
  adminApi.post(`/admin/users/unban/${id}`);

export const fetchAdminList = (page = 1, limit = 10) =>
  adminApi.get("/admin/list", { params: { page, limit } });