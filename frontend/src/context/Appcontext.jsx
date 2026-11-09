import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [token, setToken] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = async () => {
    try {
      const { data } = await api.get("/api/user/me");

      if (data.success) {
        setUser(data.user);
        setToken(true);
      } else {
        setUser(null);
        setToken(false);
      }
    } catch (error) {
      setUser(null);
      setToken(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/user/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setToken(false);
      setUser(null);
      navigate("/login");
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  const value = {
    navigate,
    backendUrl,
    token,
    setToken,
    user,
    setUser,
    loading,
    logout,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
