import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./AuthSuccess.module.css";

function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      sessionStorage.setItem("userToken", token);

      navigate("/itineraries");
    } else {
      navigate("/signin?error=auth_failed");
    }
  }, [searchParams, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.loadingMessage}>Processing Google sign-in...</div>
    </div>
  );
}

export default AuthSuccess;
