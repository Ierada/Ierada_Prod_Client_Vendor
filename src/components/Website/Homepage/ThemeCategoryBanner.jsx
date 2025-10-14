import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, ChevronLeft, ChevronRight } from "lucide-react";
import Slider from "react-slick";
import config from "../../../config/config";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";

const ThemeCategoryBanner = ({ data }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Define responsive settings for banners per slide
  const maxBannersPerSlide = {
    lg: 4, // Large screens
    md: 3, // Medium screens
    sm: 2, // Small screens
    xs: 1, // Extra small screens
  };

  const totalBanners = data.items.length;
  const isSlider = totalBanners > maxBannersPerSlide.lg;

  const handleNavigation = (banner) => {
    if (banner.Category?.slug) {
      navigate(
        `${config.VITE_BASE_WEBSITE_URL}/collection/category/${banner.Category.slug}`
      );
    } else if (banner.SubCategory?.slug) {
      navigate(
        `${config.VITE_BASE_WEBSITE_URL}/collection/subcategory/${banner.SubCategory.slug}`
      );
    } else if (banner.link) {
      window.location.href = banner.link;
    }
  };

  const getGridClasses = (bannerCount) => {
    switch (bannerCount) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      case 4:
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  // Custom arrow components for react-slick
  const PrevArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors focus:outline-none disabled:opacity-50"
      aria-label="Previous banner"
    >
      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </button>
  );

  const NextArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors focus:outline-none disabled:opacity-50"
      aria-label="Next banner"
    >
      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </button>
  );

  // Slick settings for dynamic, responsive slider
  const slickSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: maxBannersPerSlide.lg,
    slidesToScroll: maxBannersPerSlide.lg,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    afterChange: (index) => setCurrentIndex(index),
    appendDots: (dots) => (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <ul className="flex space-x-2">{dots}</ul>
      </div>
    ),
    customPaging: (i) => (
      <button
        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
          i === currentIndex ? "bg-white" : "bg-white/30"
        }`}
        aria-label={`Go to slide ${i + 1}`}
      />
    ),
    responsive: [
      {
        breakpoint: 1024, // lg
        settings: {
          slidesToShow: maxBannersPerSlide.md,
          slidesToScroll: maxBannersPerSlide.md,
        },
      },
      {
        breakpoint: 768, // md
        settings: {
          slidesToShow: maxBannersPerSlide.sm,
          slidesToScroll: maxBannersPerSlide.sm,
        },
      },
      {
        breakpoint: 640, // sm
        settings: {
          slidesToShow: maxBannersPerSlide.xs,
          slidesToScroll: maxBannersPerSlide.xs,
        },
      },
    ],
  };

  return (
    <section className="relative w-full overflow-hidden px-4 sm:px-6 md:px-8 lg:px-16">
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

      {isSlider ? (
        // Slider Layout with react-slick
        <Slider {...slickSettings}>
          {data.items.map((banner) => (
            <div
              key={banner.id}
              className="relative w-full h-full cursor-pointer"
              //   onClick={() => handleNavigation(banner)}
            >
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet={banner.mobile_image_url || banner.file_url}
                />
                <img
                  //   src={banner.file_url}
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1320&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt={banner.title || `Banner ${banner.id}`}
                  className="h-[350px] w-full object-cover"
                />
              </picture>
              <div className="p-3 text-left">
                <div className="flex flex-col gap-2">
                  <h2 className="text-sm lg:text-xl font-bold">
                    {banner.title}
                  </h2>
                  <button
                    className="flex items-center gap-2 text-xs md:text-sm underline"
                    onClick={() => handleNavigation(banner)}
                  >
                    Learn More
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        // Grid Layout
        <div
          className={`grid ${getGridClasses(
            totalBanners
          )} gap-4 w-full h-full py-2`}
        >
          {data.items.map((banner) => (
            <div
              key={banner.id}
              className="rounded-2xl overflow-hidden bg-white border border-orange-200 shadow-sm hover:shadow-md transition-shadow"
              //   onClick={() => handleNavigation(banner)}
            >
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet={banner.mobile_image_url || banner.file_url}
                />
                <img
                  // src={banner.file_url}
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1320&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt={banner.title || `Banner ${banner.id}`}
                  className="h-[350px] w-full object-cover"
                />
              </picture>
              <div className="p-3 text-left">
                <div className="flex flex-col gap-2">
                  <h2 className="text-sm lg:text-xl font-bold">
                    {banner.title}
                  </h2>
                  <button
                    className="flex items-center gap-2 text-xs md:text-sm underline"
                    onClick={() => handleNavigation(banner)}
                  >
                    Learn More
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ThemeCategoryBanner;
