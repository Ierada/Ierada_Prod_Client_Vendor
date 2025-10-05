import React from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";

const CategoryGrid = ({ data }) => {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-16 space-y-4 md:space-y-6">
      <div className="text-center pb-4">
        <div className="w-full flex justify-center items-center py-8 gap-4 md:gap-8">
          {left_decor && (
            <img
              src={left_decor}
              alt="Left Decoration"
              className="h-2 md:h-4 lg:h-6 w-[50vh]"
            />
          )}
          <h2 className="text-primary-100 text-xl sm:text-2xl md:text-3xl font-bold">
            {data?.title}
          </h2>
          {right_decor && (
            <img
              src={right_decor}
              alt="Right Decoration"
              className="h-2 md:h-4 lg:h-6 w-[50vh]"
            />
          )}
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-black-100 mt-2">
          {data?.subtitle}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {data?.description}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-10 md:gap-14">
        {data?.items?.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
            onClick={() =>
              navigate(
                `${config.VITE_BASE_WEBSITE_URL}/collection/category/${category.slug}`
              )
            }
          >
            <div className="w-24 sm:w-28 md:w-32 lg:w-48 h-24 sm:h-28 md:h-32 lg:h-48 rounded-full overflow-hidden shadow-md flex items-center justify-center">
              <img
                src={category.image}
                alt={category.title}
                className="w-50 h-50 object-contain"
              />
            </div>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base font-medium text-gray-800 text-center max-w-[120px] sm:max-w-[140px] md:max-w-[160px]">
              {category.title.toUpperCase()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
