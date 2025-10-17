import React from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";

const SubCategoryCollection = ({ data }) => {
  const navigate = useNavigate();

  return (
    <section className="max-w-6xl mx-auto space-y-4">
      <div className="w-full flex justify-center items-center gap-4 md:gap-8">
        {left_decor && (
          <img
            src={left_decor}
            alt="Left Decoration"
            className="h-2 md:h-4 lg:h-6 w-[50vh] hidden md:block"
          />
        )}
        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold flex gap-2 capitalize">
          <span className="bg-gradient-to-r from-[#FFB700] to-[#FF3B00] bg-clip-text text-transparent ">
            {data?.title?.split(" ")[0]}
          </span>
          <span>{data?.title?.split(" ")?.slice(1)?.join(" ")}</span>
        </h2>
        {right_decor && (
          <img
            src={right_decor}
            alt="Right Decoration"
            className="h-2 md:h-4 lg:h-6 w-[50vh] hidden md:block"
          />
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.items.map((subcategory) => (
          <div
            key={subcategory.id}
            className="group cursor-pointer"
            onClick={() =>
              navigate(
                `${config.VITE_BASE_WEBSITE_URL}/collection/subcategory/${subcategory.slug}`
              )
            }
          >
            <div className="relative aspect-[3/4] overflow-hidden ">
              <img
                src={subcategory.image}
                alt={subcategory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end  justify-center ">
                <h3 className="text-white text-xl font-semibold mb-3">
                  {subcategory.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SubCategoryCollection;
