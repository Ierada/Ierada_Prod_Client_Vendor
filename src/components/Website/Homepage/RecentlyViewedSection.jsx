import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";

const RecentlyViewed = ({ data }) => {
  const navigate = useNavigate();
  const browsing_history = data ? data.items : [];

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-16 space-y-4">
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

      {browsing_history?.length > 0 ? (
        <Slider {...settings}>
          {browsing_history.map((item, index) => (
            <div key={index} className="px-2">
              <div className="rounded-2xl overflow-hidden bg-white border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-full aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={`image of ${item.name}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 text-center">
                  <h4 className="text-base sm:text-lg font-bold text-black uppercase h-14 line-clamp-2">
                    {item.name}
                  </h4>
                  {/* <p className="text-xs sm:text-sm text-gray-500 uppercase mt-1">
                    {item.type || "Category"}
                  </p> */}
                  <button
                    onClick={() =>
                      navigate(
                        `${config.VITE_BASE_WEBSITE_URL}/product/${item.slug}`
                      )
                    }
                    className="mt-2 bg-button-gradient text-white px-4 py-1.5 rounded-full text-sm font-medium hover:from-primary-100 hover:to-orange-600 transition-colors w-full max-w-[150px] mx-auto block"
                  >
                    Explore More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">You haven't viewed any products yet.</p>
        </div>
      )}
    </section>
  );
};

export default RecentlyViewed;
