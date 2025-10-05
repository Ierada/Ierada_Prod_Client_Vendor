import React from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";

const ThemeSection = ({ data }) => {
  const navigate = useNavigate();
  const themes = data?.items || [];
  const bannerImage = data?.banner_image || "";

  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-16 space-y-4 md:space-y-6">
      <div className="text-left md:text-center pb-4">
        {left_decor && (
          <img
            src={left_decor}
            alt="Left Decoration"
            className="h-6 md:h-10 lg:h-12 w-auto"
          />
        )}
        <h2 className="text-primary-100 text-xl sm:text-2xl md:text-3xl font-bold">
          {data?.title || "Buy By Region"}
        </h2>
        {right_decor && (
          <img
            src={right_decor}
            alt="Right Decoration"
            className="h-6 md:h-10 lg:h-12 w-auto"
          />
        )}
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-black-100 mt-2">
          {data?.subtitle ||
            "Compare and purchase plans tailored to your location"}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {data?.description ||
            "Would you like to make this more formal (professional website style) or catchy (marketing/ad style)?"}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Left side: Theme grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full md:w-2/3">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="rounded-2xl overflow-hidden bg-white border border-orange-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                navigate(`${config.VITE_BASE_WEBSITE_URL}/theme/${theme.slug}`)
              }
            >
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src={theme.image || "/assets/placeholder-theme.jpg"}
                  alt={`Image of ${theme.title}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 text-left">
                <h4 className="text-base sm:text-lg font-bold text-black capitalize">
                  {theme.title}
                </h4>
                <button className="mt-2 text-primary-100 text-sm font-medium hover:underline flex items-center">
                  Learn more <span className="ml-1">&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right side: Banner */}
        {bannerImage && (
          <div className="w-full md:w-1/3">
            <div className="rounded-2xl overflow-hidden bg-orange-100 h-full flex items-center justify-center">
              <img
                src={bannerImage}
                alt="Section Banner"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ThemeSection;
