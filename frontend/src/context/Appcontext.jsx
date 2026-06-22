import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const getCurrentUser = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/me`,
        {
          headers: {
            token,
          },
        }
      );

      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("token") || "");
    };

    window.addEventListener("storage", syncToken);

    return () => {
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  useEffect(() => {
    if (token) {
      setLoading(true);
      getCurrentUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

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