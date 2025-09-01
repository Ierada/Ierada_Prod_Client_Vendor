import React from "react";
import { ArrowUpRight } from "lucide-react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";

const TrendingSection = ({ data }) => {
  const navigate = useNavigate();
  const { trending_products, browsing_history } = data ? data.items : [];

  return (
    <section className="px-4 md:px-8 lg:px-16 space-y-4">
      <div className="w-full flex justify-center items-center py-6 gap-3 sm:gap-4 md:gap-6">
        {left_decor && (
          <img
            src={left_decor}
            alt="Left Decoration"
            className="h-3 sm:h-4 md:h-5 lg:h-6 w-auto"
          />
        )}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-italiana text-nowrap">
          <span>{data?.title}</span>
        </h2>
        {right_decor && (
          <img
            src={right_decor}
            alt="Right Decoration"
            className="h-3 sm:h-4 md:h-5 lg:h-6 w-auto"
          />
        )}
      </div>
      <div className="flex flex-wrap lg:flex-nowrap gap-8">
        <div className="w-full lg:w-1/3 bg-[#FFBCC7] p-6 rounded-md flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3 px-4 py-6 text-center sm:px-6 md:px-7">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[black] mb-2">
              {browsing_history?.length > 0
                ? "Continue Browsing"
                : "No Browsing Data Available"}
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
              {browsing_history?.length > 0
                ? "Shop again where you left..."
                : "You haven't viewed any products yet."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {browsing_history?.slice(0, 6)?.map((item, index) => (
              <a
                onClick={(e) => {
                  e.preventDefault();
                  navigate(
                    `${config.VITE_BASE_WEBSITE_URL}/product/${item.slug}`
                  );
                }}
                key={index}
                className="block"
              >
                <div className="overflow-hidden rounded-md aspect-[512/682] w-[100px] mx-auto">
                  <img
                    src={item?.image}
                    alt={`image of ${item?.name}`}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </a>
            ))}
          </div>
          <button
            onClick={() =>
              navigate(`${config.VITE_BASE_WEBSITE_URL}/collection/all`)
            }
            className="mx-auto flex border border-[#6B705C] text-[#6B705C] px-4 py-2 font-medium hover:bg-[#6B705C] hover:text-white transition"
          >
            Shop Now →
          </button>
        </div>

        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {trending_products?.map((product) => (
              <a
                onClick={(e) => {
                  e.preventDefault();
                  navigate(
                    `${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`
                  );
                }}
                key={product.id}
                className="block"
              >
                <div className="flex gap-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white">
                  <div className="overflow-hidden rounded-md aspect-[512/682] w-[100px] flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="items-start flex flex-col justify-center gap-3 p-4">
                    <div className="text-yellow-500 flex justify-center items-center mt-1">
                      {[...Array(5)].map((_, index) => {
                        if (
                          index < Math.floor(product.reviewStats.average_rating)
                        ) {
                          return <FaStar key={`full-${index}`} />;
                        } else if (
                          index < product.reviewStats.average_rating &&
                          product.reviewStats.average_rating % 1 !== 0
                        ) {
                          return <FaStarHalfAlt key={`half-${index}`} />;
                        }
                        return <FaRegStar key={`empty-${index}`} />;
                      })}
                      <span className="ml-1 text-gray-500">
                        {product.reviewStats.total_reviews}
                      </span>
                    </div>
                    <h3 className="max-w-[200px] text-lg text-[black] truncate">
                      {product.name}
                    </h3>
                    <div className="flex gap-2 items-center">
                      <p className="text-base sm:text-xl">{`₹${
                        product.original_price - product.discounted_price
                      }`}</p>
                      <p className="line-through text-gray-500">{`₹${product.original_price}`}</p>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
