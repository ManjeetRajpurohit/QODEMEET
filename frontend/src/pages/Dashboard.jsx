import CandidateDashboard from "../components/CandidateDashboard";
import InterviewerDashboard from "../components/InterviewerDashboard";
import { useContext } from "react";
import { AppContext } from "../context/Appcontext";
const Dashboard = () => {
  const {user}=useContext(AppContext);

  return user?.role === "candidate" ? (
    <CandidateDashboard />
  ) : (
    <InterviewerDashboard />
  );
};

export default Dashboard;