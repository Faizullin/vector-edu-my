import apiClient from './api';

export const getSettings = async () => {
  return apiClient.get(`/settings/`);
};

export const getContext = async () => {
  return apiClient.get(`/context/`);
};
