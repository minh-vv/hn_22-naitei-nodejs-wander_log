import React, { createContext, useState, useContext, useEffect } from "react";

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
    }
  }, []);

  const login = (userData, userToken) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("userToken", userToken);
    setUser(userData);
    setToken(userToken);
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
