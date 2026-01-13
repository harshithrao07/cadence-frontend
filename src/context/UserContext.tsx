"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
import { ApiResponse } from "@/types/ApiResponse";

type UserContextType = {
  isAdmin: boolean | null;
  loading: boolean;
  checkIsAdmin: () => Promise<boolean | null>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIsAdmin();
  }, []);

  const checkIsAdmin = async (): Promise<boolean | null> => {
    setLoading(true);
    try {
      const res = await api.get<boolean>("/api/v1/user/isAdmin");
      // Backend returns boolean directly
      setIsAdmin(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to check admin status:", err);
    } finally {
      setLoading(false);
    }

    return null;
  };

  return (
    <UserContext.Provider
      value={{
        isAdmin,
        loading,
        checkIsAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};