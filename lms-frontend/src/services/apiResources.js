import apiClient from './api';

export const fetchResources = async (endpoint, params = {}) => {
  return await apiClient.get(endpoint, {
    params
  });
};

export const postResources = async (endpoint, body, config = {}) => {
  return await apiClient.post(endpoint, body, config);
};
