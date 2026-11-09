import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import api from "../utils/api";

const Authsuccess = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(AppContext);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await api.get("/api/user/me");

        if (!response.data.success) {
          navigate("/login", { replace: true });
          return;
        }

        const user = response.data.user;
        setUser(user);
        setToken(true);

        navigate(user.role ? "/dashboard" : "/select-role", {
          replace: true,
        });
      } catch (error) {
        navigate("/login", { replace: true });
      }
    };

    verifySession();
  }, [navigate, setToken, setUser]);

  return <div className="text-white">Logging you in...</div>;
};

export default Authsuccess;
