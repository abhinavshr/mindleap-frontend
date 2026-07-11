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

export const createAdmin = (adminData) =>
  adminApi.post("/admin/create", adminData);

export const deleteAdmin = (id) =>
  adminApi.delete(`/admin/remove/${id}`);

export const fetchContacts = (page = 1, limit = 10) =>
  adminApi.get("/admin/contact-us/list", { params: { page, limit } });

export const fetchContactById = (id) =>
  adminApi.get(`/admin/contact-us/view/${id}`);

export const markContactAsRead = (id) =>
  adminApi.put(`/admin/contact-us/mark-as-read/${id}`);

export const markContactAsUnread = (id) =>
  adminApi.put(`/admin/contact-us/mark-as-unread/${id}`);

export const deleteContact = (id) =>
  adminApi.delete(`/admin/contact-us/delete/${id}`);