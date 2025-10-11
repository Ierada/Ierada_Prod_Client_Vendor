import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";

const DealOfTheDay = ({ data }) => {
  const navigate = useNavigate();
  const item = data?.items?.[0];

  if (!item) return null;

  const [timeLeft, setTimeLeft] = useState("00:00:00");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(item.endDate) - new Date();
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
          .toString()
          .padStart(2, "0");
        const minutes = Math.floor((difference / (1000 * 60)) % 60)
          .toString()
          .padStart(2, "0");
        const seconds = Math.floor((difference / 1000) % 60)
          .toString()
          .padStart(2, "0");
        setTimeLeft(`${hours}:${minutes}:${seconds}`);
      } else {
        setTimeLeft("00:00:00");
      }
    };

    calculateTimeLeft();
    const timerInterval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timerInterval);
  }, [item.endDate]);

  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pb-8">
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
          <h3 className="text-xs sm:text-lg md:text-xl md:font-semibold text-black-100 mt-2">
            {data?.subtitle}
          </h3>
          <p className="text-[10px] leading-4 sm:text-base text-gray-600 mt-1">
            {data?.description}
          </p>
        </div>

        <div className="relative w-full h-[150px] sm:h-[250px] md:h-[350px] overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col justify-center items-center text-white px-4">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-wide">
              Ends in{" "}
              <span className="not-italic font-bold text-primary-100">
                {timeLeft}
              </span>
            </h1>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold mt-1 md:mt-2">
              Deal of the Day
            </h2>
            <button
              onClick={() =>
                navigate(`${config.VITE_BASE_WEBSITE_URL}/offer/${item.slug}`)
              }
              className="mt-4 md:mt-10 bg-button-gradient text-white px-8 sm:px-14 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:from-primary-100 hover:to-orange-600 transition-colors"
            >
              Explore More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealOfTheDay;
