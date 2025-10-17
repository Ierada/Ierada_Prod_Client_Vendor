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
    <section className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      <div className="text-center">
        <div className="w-full flex justify-center items-center gap-4 md:gap-8">
          {left_decor && (
            <img
              src={left_decor}
              alt="Left Decoration"
              className="h-2 md:h-4 lg:h-auto w-full hidden md:block"
            />
          )}
          <h2 className="w-full text-lg sm:text-2xl md:text-3xl font-bold flex justify-center gap-2 capitalize">
            <span className="bg-gradient-to-r from-[#FFB700] to-[#FF3B00] bg-clip-text text-transparent ">
              {data?.title?.split(" ")[0]}
            </span>
            <span className="">
              {data?.title?.split(" ")?.slice(1)?.join(" ")}
            </span>
          </h2>
          {right_decor && (
            <img
              src={right_decor}
              alt="Right Decoration"
              className="h-2 md:h-4 lg:h-auto w-full hidden md:block"
            />
          )}
        </div>
        <h3 className="text-xs sm:text-lg md:text-xl md:font-semibold text-black-100 mt-2">
          {data?.subtitle}
        </h3>
        <p className="text-[10px] leading-4 sm:text-base text-gray-600 mt-1">
          {data?.description}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Left side: Theme grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full md:w-1/2">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-orange-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                navigate(`${config.VITE_BASE_WEBSITE_URL}/theme/${theme.slug}`)
              }
            >
              <img
                src={theme.image || "/assets/placeholder-theme.jpg"}
                // src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1320&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt={`Image of ${theme.title}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                <h4 className="text-base sm:text-lg font-bold text-black capitalize bg-button-gradient bg-clip-text text-transparent">
                  {theme.title}
                </h4>
                <button className="mt-2 bg-button-gradient text-white text-sm font-medium hover:underline flex items-center rounded-lg py-1 px-4">
                  Explore more <span className="ml-1">&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right side: Banner */}
        {bannerImage && (
          <div className="w-full md:w-1/2">
            <div
              className="rounded-2xl overflow-hidden w-full aspect-[4/3] md:aspect-auto md:h-full flex items-center justify-center"
              style={{
                backgroundImage: `url(${bannerImage})`,
                // backgroundImage: `ur[](https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1320&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ThemeSection;
