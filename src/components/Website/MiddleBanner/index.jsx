// import React from 'react';
import { NavLink } from "react-router-dom";
import { HiArrowLongRight } from "react-icons/hi2";
import ExploreButton from "../ExploreButton";
import config from "../../../config/config";
import { useNavigate } from "react-router-dom";

const MiddleBanner = ({ bannerData }) => {
  const handleNavigation = (banner) => {
    if (banner.Category && banner.Category.slug) {
      navigate(
        `${config.VITE_BASE_WEBSITE_URL}/collection/category/${banner.Category.slug}`
      );
    } else if (banner.SubCategory && banner.SubCategory.slug) {
      navigate(
        `${config.VITE_BASE_WEBSITE_URL}/collection/subcategory/${banner.SubCategory.slug}`
      );
    } else if (banner.link) {
      window.location.href = banner.link;
    }
  };

  const navigate = useNavigate();

  return (
    <main className="w-full mx-auto mt-6">
      <div
        className="relative w-full h-[550px] bg-cover bg-center flex items-center flex-row-reverse"
        style={{
          backgroundImage: `url(${bannerData?.image})`,
        }}
      >
        <div className="items-center flex flex-col text-white space-y-6 max-w-[320px] mr-20 ">
          <h2 className="text-3xl font-bold">{bannerData?.title}</h2>
          <p className="font-light text-lg">{bannerData?.subtitle}</p>
          {/* <ExploreButton  onClick={() => navigate(`${config.VITE_BASE_WEBSITE_URL}/collection/bridal_collection/${homepageResponse.bridal_collection.slug}`)} /> */}
          <ExploreButton onClick={() => handleNavigation(bannerData)} />
        </div>
      </div>
    </main>
  );
};

export default MiddleBanner;
