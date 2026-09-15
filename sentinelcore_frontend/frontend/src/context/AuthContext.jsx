import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => Cookies.get('accessToken') || null);
  const [refreshToken, setRefreshToken] = useState(() => Cookies.get('refreshToken') || null);
  
  const [username, setUsername] = useState(() => {
    const token = Cookies.get('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded.sub || decoded.username || 'admin';
      } catch (e) {
        console.error("Invalid token on load");
      }
    }
    return null;
  });

  const [role, setRole] = useState(() => {
    const token = Cookies.get('accessToken');
    if (token) {
      try {
        return jwtDecode(token).role;
      } catch (e) {
        console.error("Invalid token on load");
      }
    }
    return null;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    const token = Cookies.get('accessToken');
    if (token) {
      try {
        return jwtDecode(token).role === 'ROLE_ADMIN';
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const loginUser = (access, refresh) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    
    Cookies.set('accessToken', access, { expires: 1 });
    Cookies.set('refreshToken', refresh, { expires: 7 });
    
    try {
      const decoded = jwtDecode(access);
      setRole(decoded.role);
      setIsAdmin(decoded.role === 'ROLE_ADMIN');
      setUsername(decoded.sub || decoded.username || 'admin');
    } catch (e) {
      console.error("Invalid token during login");
    }
  };

  const logoutUser = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setRole(null);
    setIsAdmin(false);
    setUsername(null);
    
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, username, role, isAdmin, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
