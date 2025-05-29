interface AuthStorageCreds {
  isLoggedIn: boolean;
  user: {
    id: number;
    username: string;
    email: string;
  } | null;
}

export const getAuthStorageData = () => {
  const authStr = localStorage.getItem("auth");
  let data: AuthStorageCreds = {
    isLoggedIn: false,
    user: null,
  };
  if (!authStr) {
    localStorage.setItem("auth", JSON.stringify(data));
    return data;
  }
  try {
    data = JSON.parse(authStr);
  } catch (e) {}
  return data;
};

export const setAuthStorageLoggedIn = (isLoggedIn: boolean) => {
  const data = getAuthStorageData();
  data.isLoggedIn = isLoggedIn;
  localStorage.setItem("auth", JSON.stringify(data));
  return data;
};

export const isLoggedIn = () => {
  const data = getAuthStorageData();
  return data.isLoggedIn;
};

export const clearAuthStorage = () => {
  localStorage.removeItem("auth");
  return {
    isLoggedIn: false,
    user: null,
  };
};
