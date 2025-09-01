// import React from 'react';
import { NavLink } from 'react-router-dom';
import { homepageResponse } from '../../../pages/Website/Home/homePageResponse';
import { HiArrowLongRight } from "react-icons/hi2";
import ExploreButton from "../../../components/Website/ExploreButton";

const BridalCollection = () => {
  return (
    <main className="w-full mx-auto mt-6">
    <div
      className="relative w-full h-[550px] bg-cover bg-center flex items-center flex-row-reverse"
      style={{
        backgroundImage: `url(${homepageResponse.bridal_collection.image})`,
      }}
    >
      {/* Text and Button Section */}
      <div className="items-center flex flex-col text-white space-y-6 max-w-[320px] mr-20 ">
        <h2 className="text-3xl font-bold">{homepageResponse.bridal_collection.title}</h2>
        <p className="font-light text-lg">{homepageResponse.bridal_collection.subtitle}</p>
        <ExploreButton  onClick={() => navigate(`${config.VITE_BASE_WEBSITE_URL}/collection/${homepageData.accessories[0].slug}`)} />

      </div>
    </div>
  </main>
  
  );
};

export default BridalCollection;
