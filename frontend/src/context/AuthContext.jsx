import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.id;
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    const userId = token ? getUserIdFromToken(token) : null;
    return {
      token,
      userType,
      userId,
      isAuthenticated: !!token,
    };
  });
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("userType");
      const userId = token ? getUserIdFromToken(token) : null;
      setAuthState({ token, userType, userId, isAuthenticated: !!token });
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const loginAction = async (email, senha, loginUserType) => {
    setAuthLoading(true);
    let loginEndpoint = "";
    switch (loginUserType) {
      case "hospede":
        loginEndpoint = "http://localhost:5000/api/login/hospede";
        break;
      case "locador":
        loginEndpoint = "http://localhost:5000/api/locador/login";
        break;
      case "gestor":
        loginEndpoint = "http://localhost:5000/api/gestor/login";
        break;
      default:
        setAuthLoading(false);
        throw new Error("Tipo de usuário inválido para login.");
    }

    try {
      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha no login.");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userType", loginUserType);
        const userId = getUserIdFromToken(data.token);
        if (userId) localStorage.setItem("userId", userId.toString());

        setAuthState({
          token: data.token,
          userType: loginUserType,
          userId: userId,
          isAuthenticated: true,
        });
        setAuthLoading(false);
        return { success: true, userType: loginUserType, userId: userId };
      } else {
        throw new Error("Token não retornado pelo servidor.");
      }
    } catch (error) {
      console.error("Erro no loginAction:", error);
      setAuthLoading(false);
      throw error;
    }
  };

  const logoutAction = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userId");
    setAuthState({
      token: null,
      userType: null,
      userId: null,
      isAuthenticated: false,
    });
  };

  const value = {
    ...authState,
    authLoading,
    loginAction,
    logoutAction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
