import React from "react";
import HomeHeader from "../components/HomeHeader.jsx";
import Hero from "../components/Hero.jsx";
import Features from "../components/Features.jsx";
import Pricing from "../components/Pricing.jsx";
import Customer from "../components/Customer.jsx";
import Faq from "../components/Faq.jsx";
import HomeFooter from "../components/HomeFooter.jsx";
const Home = () => {
  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <HomeHeader />
      <Hero />
      <Features />
      <Pricing/>
      <Customer/>
      <Faq/>
      <HomeFooter/>
    </div>
  );
};

export default Home;