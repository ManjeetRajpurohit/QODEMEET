import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Authsuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard");
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