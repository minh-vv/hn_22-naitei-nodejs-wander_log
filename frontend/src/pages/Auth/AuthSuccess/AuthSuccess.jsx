import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./AuthSuccess.module.css";
import { useAuth } from "../../../context/AuthContext";

function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName");
    const userAvatar = searchParams.get("userAvatar");

    const user = { 
        id: userId,
        name: userName,
        avatar: userAvatar,
    };

    if (token && userId) { 
      login(user, token); 
      navigate("/home"); 
    } else {
      navigate("/signin?error=auth_failed");
    }
  }, [searchParams, navigate, login]);
  return (
    <div className={styles.container}>
      <div className={styles.loadingMessage}>Đang xử lý đăng nhập Google...</div>
    </div>
  );
}

export default AuthSuccess;
