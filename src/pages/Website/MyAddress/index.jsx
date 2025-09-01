import React, { useState, useEffect } from "react";
import { AccountInfo } from "../../../components/Website/AccountInfo";
import MyAddress from "../../../components/Website/Addresses";
import { useAppContext } from "../../../context/AppContext";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import common_top_banner from "/assets/banners/Commen-top-banner.png";
import { GoArrowRight } from "react-icons/go";


const bannerData = [
  {
    id: 1,
    image: common_top_banner,
  },
];
const MyAddressPage = () => {
  return (
    <>
      <main className="">
        <CommonTopBanner bannerData={bannerData} />

        <section className="w-full ">
          <div className="text-center my-10 text-[#000000]">
            <h1 className="text-2xl lg:text-4xl font-semibold mb-2 font-Playfair">
              My Account
            </h1>
            <p className=" text-sm lg:text-base font-Lato font-medium ">
              Home / My Address
            </p>
          </div>
          <div className=" bg-white px-4  md:px-5 lg:px-20  flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <AccountInfo activeSection="addresses" />
            </div> 
            <div className="mt-10 md:w-4/5">
              <MyAddress />
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default MyAddressPage;
