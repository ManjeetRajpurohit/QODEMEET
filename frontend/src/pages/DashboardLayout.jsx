import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useContext,useEffect } from "react";
import { AppContext } from "../context/Appcontext";

const DashboardLayout = () => {
  const {token,navigate}=useContext(AppContext)
   useEffect(()=>{
        if(!token){
          navigate("/login")
        }
    },[token]);
  const {user}=useContext(AppContext);
  return (
    <div className="min-h-screen bg-[#030712]">
      <Sidebar/>

      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <Outlet  />
      </main>
    </div>
  );
};

export default DashboardLayout;
