import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppContext } from "../context/Appcontext";

const Authsuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useContext(AppContext);

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      setToken(token);

      // The JWT payload carries the user's role (set at Google account
      // creation). Decode it here so we can send brand-new users to
      // /select-role instead of dumping them straight into /dashboard,
      // which has no way of knowing a role hasn't been picked yet.
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));

        navigate(payload.role ? "/dashboard" : "/select-role");
      } catch (error) {
        navigate("/dashboard");
      }
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="text-white">
      Logging you in...
    </div>
  );
};

export default Authsuccess;
