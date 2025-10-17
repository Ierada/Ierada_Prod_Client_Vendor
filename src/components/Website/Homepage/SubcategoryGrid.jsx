import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";

const SubcategoryGrid = ({ data }) => {
  const navigate = useNavigate();

  return (
    <section className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {data?.slice(0, 3).map((subcategory) => (
          <div key={subcategory.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-black">
                {subcategory.title}
              </h2>
              <a
                href={`${config.VITE_BASE_WEBSITE_URL}/collection/subcategory/${subcategory.slug}`}
                className="text-sm text-gray-500 hover:text-gray-800 font-medium"
              >
                View All
              </a>
            </div>

            <div className="border border-white">
              <div
                className="relative bg-gray-100 overflow-hidden h-40 flex items-center p-4"
                style={{
                  backgroundImage: `url(${subcategory.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative text-left text-white gap-2 flex flex-col">
                  {/* <p className="text-xl font-semibold">
                    Up to{" "}
                    <span className="text-red-500">
                      {subcategory.discount}% off
                    </span>
                  </p> */}
                  <p className="text-sm">{subcategory.subtitle}</p>
                  <div className="text-gray-700 flex gap-2">
                    <p className="border-b-2 border-gray-700">Shop Now</p>
                    <button
                      onClick={() =>
                        navigate(
                          `${config.VITE_BASE_WEBSITE_URL}/collection/subcategory/${subcategory.slug}`
                        )
                      }
                      className="border-gray-700 border-2 rounded-full"
                    >
                      <ArrowUpRight />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6">
                {subcategory.InnerSubCategories?.slice(0, 4).map(
                  (innerSubcategory) => (
                    <a
                      key={innerSubcategory.id}
                      href={`${config.VITE_BASE_WEBSITE_URL}/collection/inner-subcategory/${innerSubcategory.slug}`}
                    >
                      <div className="text-center space-y-2">
                        <img
                          src={innerSubcategory.image}
                          alt={innerSubcategory.title}
                          className="w-full h-24 object-contain mx-auto"
                        />
                        <h3 className="text-sm font-medium text-gray-800">
                          {innerSubcategory.title}
                        </h3>
                      </div>
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SubcategoryGrid;
