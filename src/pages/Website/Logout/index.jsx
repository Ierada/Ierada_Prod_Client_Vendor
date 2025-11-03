import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import common_top_banner from "/assets/banners/Commen-top-banner.png";
import { AccountInfo } from "../../../components/Website/AccountInfo";
import config from "../../../config/config";
import { useAppContext } from "../../../context/AppContext";

const bannerData = [
  {
    id: 1,
    image: common_top_banner,
  },
];

export default function Logout() {
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();

    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    setUser(null);

    navigate(`${config.VITE_BASE_WEBSITE_URL}/`);
  };

  return (
    <main>
      {/* <CommonTopBanner bannerData={bannerData} /> */}
      <section className="w-full">
        <div className="text-center my-10 text-[#000000]">
          <h1 className="text-2xl md:text-2xl lg:text-4xl font-semibold mb-2 font-Playfair">
            My Account
          </h1>
          <p className="text-xs md:text-sm lg:text-base font-Lato font-medium">
            Home / My Logout
          </p>
        </div>
        <div className="bg-white px-4 md:px-5 lg:px-20 flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <AccountInfo activeSection="logout" />
          </div>
          <div className="mt-10 md:w-4/5">
            <h2 className="text-base md:text-lg lg:text-xl font-semibold text-[black]">
              Logout
            </h2>
            <p className="text-[#484848] my-4">
              Are you sure you want to log out?
            </p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium hover:bg-olive-700 focus:outline-none"
            >
              Yes, Logout
              <span className="ml-2">&rarr;</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
