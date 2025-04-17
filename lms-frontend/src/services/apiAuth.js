import apiClient from './api';

export const login = async (credentials) => {
  return apiClient.post(`/login/`, credentials);
};

export const logout = async () => {
  return apiClient.post(`/logout/`);
};

export const getUser = async () => {
  return apiClient.get(`/user/`);
};
