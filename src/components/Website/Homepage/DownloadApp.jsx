import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FaFacebookF,
  FaYoutube,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

import download_app from "/assets/download_app/right_side_img.svg";
import android_store from "/assets/download_app/android_store.svg";
import apple_store from "/assets/download_app/apple_store.svg";

const DownloadApp = () => {
  return (
    <main className="px-4 md:px-8 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-5 lg:gap-8">
      <div className="text-left md:text-left md:w-[40%] space-y-4 text-[black] ">
        <h2 className="text-4xl text-center mb-4 font-italiana relative inline-block">
          <span>Unlock the Future of Fusion</span>
        </h2>
        <p className="text-xl font-semibold">Download Our App Today</p>
        <p className="mb-6  text-left">
          Download our exclusive app to buy the latest in modern fashion,
          ensuring a seamless and futuristic shopping experience.
        </p>
        <div className="flex  sm:flex-row gap-2 sm:gap-4 items-center  ">
          <Link to="">
            <img src={android_store} alt="" />
          </Link>
          <Link to="">
            <img src={apple_store} alt="" />
          </Link>
        </div>
      </div>

      <div className="w-full md:w-[60%] flex justify-end  ">
        <div className="relative">
          <img
            src={download_app}
            alt="Custom Design"
            className="w-[600px] lg:w-[720px] h-[550px] lg:h-[700px] object-contain"
          />
        </div>
      </div>
    </main>
  );
};

export default DownloadApp;
