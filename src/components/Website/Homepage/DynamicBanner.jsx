import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Slider from "react-slick";
import config from "../../../config/config";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const DynamicBanner = ({ data }) => {
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
    <section className="relative w-full overflow-hidden">
      <div className="text-center pb-4">
        <h2 className="text-primary-100 text-xl sm:text-2xl md:text-3xl font-bold">
          {data?.title}
        </h2>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-black-100 mt-2">
          {data?.subtitle}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {data?.description}
        </p>
      </div>

      {isSlider ? (
        // Slider Layout with react-slick
        <div className="w-full" style={{ height: "400px" }}>
          <Slider {...slickSettings}>
            {data.items.map((banner) => (
              <div key={banner.id} className="px-2">
                <div
                  className="relative w-full h-full cursor-pointer"
                  style={{ height: "400px" }}
                  onClick={() => handleNavigation(banner)}
                >
                  {banner.file_type === "image" ? (
                    <picture>
                      <source
                        media="(max-width: 767px)"
                        srcSet={banner.mobile_image_url || banner.file_url}
                      />
                      <img
                        src={banner.file_url}
                        alt={banner.title || `Banner ${banner.id}`}
                        className="w-full h-full object-cover"
                      />
                    </picture>
                  ) : (
                    <video
                      src={banner.file_url}
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center sm:justify-end px-2 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center sm:text-right flex flex-col items-center sm:items-end text-white space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 max-w-[90%] sm:max-w-[280px] md:max-w-[300px] lg:max-w-[320px]">
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                        {banner.title}
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base lg:text-lg font-light">
                        {banner.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        // Grid Layout
        <div className="w-full" style={{ height: "400px" }}>
          <div
            className={`grid ${getGridClasses(
              totalBanners
            )} gap-4 w-full h-full`}
          >
            {data.items.map((banner) => (
              <div
                key={banner.id}
                className="relative w-full h-full cursor-pointer"
                onClick={() => handleNavigation(banner)}
              >
                {banner.file_type === "image" ? (
                  <picture>
                    <source
                      media="(max-width: 767px)"
                      srcSet={banner.mobile_image_url || banner.file_url}
                    />
                    <img
                      src={banner.file_url}
                      alt={banner.title || `Banner ${banner.id}`}
                      className="w-full h-full object-cover"
                    />
                  </picture>
                ) : (
                  <video
                    src={banner.file_url}
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center sm:justify-end px-2 sm:px-4 md:px-6 lg:px-8">
                  <div className="text-center sm:text-right flex flex-col items-center sm:items-end text-white space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 max-w-[90%] sm:max-w-[280px] md:max-w-[300px] lg:max-w-[320px]">
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                      {banner.title}
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg font-light">
                      {banner.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default DynamicBanner;
