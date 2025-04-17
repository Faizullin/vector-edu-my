import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // axios
    //   .get('/api/auth/check/', { withCredentials: true })
    //   .then((response) => {
    //     if (response.data.isAuthenticated) {
    //       setUser(response.data.user);
    //     }
    //   })
    //   .catch(() => setUser(null))
    //   .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, next = '/lms') => {
    try {
      const response = await axios.post('/api/auth/login/', { email, password, next }, { withCredentials: true });
      if (response.data.success) {
        setUser(response.data.user);
        console.log(response.data.user);
        // navigate(response.data.next || '/lms');
      }
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  };

  const logout = async () => {
    await axios.post('/api/auth/logout/', {}, { withCredentials: true });
    setUser(null);
    navigate('/login');
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}


export const useAuth = () => {
  if(!useContext(AuthContext)) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return useContext(AuthContext);
}