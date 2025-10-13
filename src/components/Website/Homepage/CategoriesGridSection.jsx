import React from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";

const CategoryGrid = ({ data }) => {
  const navigate = useNavigate();

  const items = data?.items || [];
  const n = items.length;
  let chunks = [];
  if (n > 0) {
    const r = Math.ceil(n / 5);
    const q = Math.floor(n / r);
    const rem = n % r;
    let idx = 0;
    for (let i = 0; i < r; i++) {
      const size = q + (i < rem ? 1 : 0);
      chunks.push(items.slice(idx, idx + size));
      idx += size;
    }
  }

  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-16 space-y-4 md:space-y-6">
      <div className="text-center pb-8">
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

      {/* <div className="space-y-4 md:space-y-6"> */}
      <div className="flex flex-wrap justify-center gap-6 sm:gap-14 md:gap-20">
        {data?.items?.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105 w-[100px] sm:w-[120px] md:w-[140px]"
            onClick={() =>
              navigate(
                `${config.VITE_BASE_WEBSITE_URL}/collection/category/${category.slug}`
              )
            }
          >
            <div className="w-14 md:w-20 lg:w-28 h-14 md:h-20 lg:h-28 rounded-full overflow-hidden shadow-md flex items-center justify-center">
              <img
                src={category.image}
                // src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1320&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt={category.title}
                className="w-50 h-50 object-contain"
              />
            </div>
            <p className="mt-2 sm:mt-3 text-[10px] leading-4 sm:text-sm font-medium text-gray-800 text-center">
              {category.title.toUpperCase()}
            </p>
          </div>
        ))}
        {/* {chunks.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className={`max-w-6xl mx-auto grid justify-items-center grid-cols-3 lg:grid-cols-${row.length} gap-6 sm:gap-10 md:gap-20`}
          >
            {row.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
                onClick={() =>
                  navigate(
                    `${config.VITE_BASE_WEBSITE_URL}/collection/category/${category.slug}`
                  )
                }
              >
            <div className="w-16 md:w-24 lg:w-32 h-16 md:h-24 lg:h-32 rounded-full overflow-hidden shadow-md flex items-center justify-center">
                  <img
                    // src={category.image}
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1320&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt={category.title}
                    className="w-full h-full object-contain"
                  />
                </div>
            <p className="mt-2 sm:mt-3 text-[10px] sm:text-sm md:text-base font-medium text-gray-800 text-center">
                  {category.title.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        ))} */}
      </div>
    </section>
  );
};

export default CategoryGrid;
