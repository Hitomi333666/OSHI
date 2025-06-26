// context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUserProfile } from "@/app/actions/auth";
type AuthContextType = {
  isLoggedIn: boolean;
  avatar: string;
  nickname: string;
  id: string;
  role: string;
  setLoggedIn: (
    value: boolean,
    avatar?: string,
    nickname?: string,
    id?: string,
    role?: string
  ) => void;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [nickname, setNickname] = useState("");
  const [id, setId] = useState("");
  const [role, setRole] = useState("user");
  const setLoggedIn = (
    value: boolean,
    avatarValue = "",
    nicknameValue = "",
    idValue = "",
    roleValue = "user"
  ) => {
    setIsLoggedIn(value);
    setAvatar(avatarValue);
    setNickname(nicknameValue);
    setId(idValue);
    setRole(roleValue);
  };
  useEffect(() => {
    const loadProfile = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        const result = await fetchUserProfile(token);
        if (result.success && result.user) {
          setIsLoggedIn(true);
          setAvatar(result.user.avatar || "");
          setNickname(result.user.nickname || "");
          setId(result.user.id || "");
          setRole(result.user.role || "user");
        }
      }
    };
    loadProfile();
  }, []);
  return (
    <AuthContext.Provider
      value={{ isLoggedIn, avatar, nickname, id, setLoggedIn, role }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
