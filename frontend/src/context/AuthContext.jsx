import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem("userToken"));

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("userToken");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      startTokenTimer(storedToken);
    }
  }, []);

  const startTokenTimer = (jwtToken) => {
    try {
      const decoded = jwtDecode(jwtToken);
      if (decoded.exp) {
        const expiryTime = decoded.exp * 1000 - Date.now();
        if (expiryTime > 0) {
          setTimeout(() => {
            alert("Your session has expired. Please sign in again.");
            logout();
            window.location.href = "/signin";
          }, expiryTime);
        } else {
          alert("Your session has expired. Please sign in again.");
          logout();
          window.location.href = "/signin";
        }
      }
    } catch (err) {
      console.error("Invalid token:", err);
      logout();
    }
  };

  const login = (userData, userToken) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("userToken", userToken);
    setUser(userData);
    setToken(userToken);
    startTokenTimer(userToken);
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userToken");
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isLoggedIn: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
