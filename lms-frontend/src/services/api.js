// create api with interceptors and redirect login

import axios from 'axios';
import { CONFIG } from '../config/constant';

export const API_URL = `${CONFIG.api.baseUrl}${CONFIG.api.v1Url}`;

const apiClient = axios.create({
  baseURL: API_URL,
  // headers: {
  //   'Content-Type': 'application/json'
  // },
  withCredentials: true
});

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function getCSRFToken() {
  return getCookie('csrftoken');
}

// Request Interceptor (optional)
apiClient.interceptors.request.use(
  (config) => {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if ([401, 403].includes(status)) {
        console.warn('Session expired or unauthorized! Redirecting to login...');

        const next_url = window.location.href;

        // Redirect to the login page
        window.location.href = `/${CONFIG.routes.base_href}${CONFIG.routes.login}?next=${next_url}`;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
