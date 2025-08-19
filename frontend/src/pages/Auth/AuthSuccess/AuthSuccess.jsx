import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import styles from "./AuthSuccess.module.css";

function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      try {
        // Decode token để lấy thông tin user
        const decoded = jwtDecode(token);
        const userData = {
          id: decoded.id || decoded.sub,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role || 'USER',
          avatar: decoded.avatar
        };

        login(userData, token);

        if (userData.role === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/home"); 
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        navigate("/signin?error=auth_failed");
      }
    } else {
      navigate("/signin?error=auth_failed");
    }
  }, [searchParams, navigate, login]);

  return (
    <div className={styles.container}>
      <div className={styles.loadingMessage}>Processing Google sign-in...</div>
    </div>
  );
}

export default AuthSuccess;