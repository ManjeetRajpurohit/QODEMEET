import CandidateDashboard from "../components/CandidateDashboard";
import InterviewerDashboard from "../components/InterviewerDashboard";
import { useContext, useEffect } from "react";
import { AppContext } from "../context/Appcontext";
const Dashboard = () => {
  const {user, loading, navigate}=useContext(AppContext);

  // Safety net: if a user with no role yet (e.g. mid-signup, or landed
  // here directly) ever reaches this route, don't silently fall through
  // to InterviewerDashboard - send them to pick a role first.
  useEffect(() => {
    if (!loading && user && !user.role) {
      navigate("/select-role");
    }
  }, [loading, user]);

  if (!loading && user && !user.role) {
    return null;
  }

  return user?.role === "candidate" ? (
    <CandidateDashboard />
  ) : (
    <InterviewerDashboard />
  );
};

export default Dashboard;
