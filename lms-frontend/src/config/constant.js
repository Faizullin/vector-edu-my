// imports from project
export const BASE_TITLE = ' | DashboardKit React Bootstrap 5 Admin Template';

// -----------------------|| Application default Configuration ||-----------------------//

const window_site_config = window.site_config;

export const CONFIG = {
  collapseMenu: false, // true for mini-menu

  api: {
    baseUrl: window_site_config?.api?.baseUrl || import.meta.env.VITE_APP_API_URL,
    v1Url: '/api/v1'
  },

  routes: {
    base_href: 'lms',
    login: window_site_config?.routes?.login || '/auth/login'
  }
};
