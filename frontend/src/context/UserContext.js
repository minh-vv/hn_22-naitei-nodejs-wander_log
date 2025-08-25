import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import userService from "../services/user.js";
import postService from "../services/post";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { user: authUser, login } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  useEffect(() => {
    if (authUser) {
      loadUserProfile();
    }
  }, [authUser]);

  const loadUserProfile = async () => {
    try {
      const profile = await userService.getMyProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
  };

  const updateAvatar = async (file) => {
    if (!file) return;

    try {
      setIsUpdatingAvatar(true);

      const urls = await postService.uploadMediaFiles([file]);
      const avatarUrl = urls?.[0]?.trim()?.replace(/^"|"$/g, "");

      if (avatarUrl) {
        const updatedProfile = await userService.updateProfile({
          avatar: avatarUrl,
        });

        setUserProfile(updatedProfile);

        if (authUser) {
          const updatedUser = {
            ...authUser,
            avatar: avatarUrl,
          };
          login(updatedUser, sessionStorage.getItem("userToken"));
        }

        return { success: true, avatarUrl };
      }
    } catch (error) {
      console.error("Failed to update avatar:", error);
      throw error;
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedProfile = await userService.updateProfile(profileData);
      setUserProfile(updatedProfile);

      if (authUser) {
        const updatedUser = {
          ...authUser,
          ...profileData,
        };
        login(updatedUser, sessionStorage.getItem("userToken"));
      }

      return updatedProfile;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const getCurrentUser = () => {
    if (!authUser) return null;

    return {
      ...authUser,
      ...userProfile,
    };
  };

  const value = {
    userProfile,
    currentUser: getCurrentUser(),
    isUpdatingAvatar,
    updateAvatar,
    updateProfile,
    loadUserProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
