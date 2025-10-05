import React from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";

const SubCategoryCollection = ({ data }) => {
  const navigate = useNavigate();

  return (
    <section className="px-4 md:px-8 lg:px-16 space-y-4">
      <div className="w-full flex justify-center items-center py-8 gap-4 md:gap-8">
        {left_decor && (
          <img
            src={left_decor}
            alt="Left Decoration"
            className="h-2 md:h-4 lg:h-6 w-[50vh]"
          />
        )}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-italiana text-nowrap">
          <span>{data.title}</span>
        </h2>
        {right_decor && (
          <img
            src={right_decor}
            alt="Right Decoration"
            className="h-2 md:h-4 lg:h-6 w-[50vh]"
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
