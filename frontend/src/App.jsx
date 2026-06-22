import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Billing from "./pages/Billing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Schedule from "./pages/Schedule.jsx";
import DashboardLayout from "./pages/DashboardLayout.jsx";
import Myinterviews from "./pages/Myinterviews.jsx";
import InterviewRoom from "./pages/InterviewRoom.jsx";
import Reports from "./pages/Reports.jsx";
import ReportDetails from "./pages/ReportDetail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Questions from "./pages/Questions.jsx";
import Question from "./pages/Question.jsx";
import AddQuestions from "./pages/AddQuestions.jsx";
import Authsuccess from "./pages/Authsuccess.jsx";
import AddReport from "./pages/AddReport.jsx";
import Bill from "./pages/Bill.jsx";
const App = () => {
  return (
    <div>
      <ToastContainer />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth-success" element={<Authsuccess />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/dashboard/profile" element={<Profile />} />

          <Route path="/dashboard/billing" element={<Billing />} />

          <Route path="/dashboard/schedule" element={<Schedule />} />

          <Route path="/dashboard/interviews" element={<Myinterviews />} />

          <Route path="/dashboard/reports" element={<Reports />} />

          <Route path="/dashboard/reports/:id" element={<ReportDetails />} />

          <Route path="/dashboard/questions" element={<Questions />} />
          <Route path="/dashboard/questions/:id" element={<Question />} />
          <Route path="/dashboard/addquestion" element={<AddQuestions />} />
          <Route path="/dashboard/add-report" element={<AddReport />} />
          <Route
            path="/dashboard/add-report/:interviewId"
            element={<AddReport />}
          />
        </Route>
        <Route path="/billing/:billingId" element={<Bill />} />
        <Route path="/interview/:roomId" element={<InterviewRoom />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </div>
  );
};

export default App;
