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
        <div className="w-full flex justify-center items-center py-2 gap-4 md:gap-8">
          {left_decor && (
            <img
              src={left_decor}
              alt="Left Decoration"
              className="h-2 md:h-4 lg:h-6 w-[50vh]"
            />
          )}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold flex gap-2 capitalize">
            <span className="bg-gradient-to-r from-[#FFB700] to-[#FF3B00] bg-clip-text text-transparent ">
              {data?.title?.split(" ")[0]}
            </span>
            <span>{data?.title?.split(" ")?.slice(1)?.join(" ")}</span>
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

      <div className="space-y-4 md:space-y-6">
        {chunks.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className={`max-w-6xl mx-auto grid justify-items-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${row.length} gap-6 sm:gap-10 md:gap-20`}
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
                <div className="w-20 md:w-28 lg:w-40 h-20 md:h-28 lg:h-40 rounded-full overflow-hidden shadow-md flex items-center justify-center">
                  <img
                    // src={category.image}
                    src="https://plus.unsplash.com/premium_photo-1683121263622-664434494177?q=80&w=1288&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt={category.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base font-medium text-gray-800 text-center max-w-[120px] sm:max-w-[140px] md:max-w-[160px]">
                  {category.title.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
