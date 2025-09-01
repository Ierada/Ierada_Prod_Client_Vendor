import React from "react";
import { useNavigate } from "react-router-dom";
import ExploreButton from "../ExploreButton";
import config from "../../../config/config";

const Banner = ({ data }) => {
  const navigate = useNavigate();
  const bannerData = data.items[0]; // Assuming one banner item

  const handleNavigation = (banner) => {
    if (banner.Category?.slug) {
      navigate(
        `${config.VITE_BASE_WEBSITE_URL}/collection/category/${banner.Category.slug}`
      );
    } else if (banner.SubCategory?.slug) {
      navigate(
        `${config.VITE_BASE_WEBSITE_URL}/collection/subcategory/${banner.SubCategory.slug}`
      );
    } else if (banner.link) {
      window.location.href = banner.link;
    }
  };

  return (
    <section className="relative w-full -mt-6 md:mt-0 lg:mt-0 overflow-hidden">
      <div
        onClick={() => handleNavigation(bannerData)}
        className="relative cursor-pointer w-full h-[300px] sm:h-[400px] md:h-[400px] lg:h-auto"
      >
        {/* Responsive Image */}
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet={bannerData?.mobile_image_url || bannerData?.file_url}
          />
          <img
            src={bannerData?.file_url}
            alt={bannerData?.title || "Banner image"}
            className="w-full h-full object-cover"
          />
        </picture>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center sm:justify-end px-4 sm:px-8">
          <div className="text-center sm:text-right flex flex-col items-center sm:items-end text-white space-y-4 sm:space-y-6 max-w-[90%] sm:max-w-[320px]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {bannerData?.title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg font-light">
              {bannerData?.subtitle}
            </p>
            {/* <ExploreButton onClick={() => handleNavigation(bannerData)} /> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
