import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import config from "../../config/config";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";

const OfferSection = ({ data, onWishlistToggle, wishlistedItems }) => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const offerData = data.items[0];

  const handlePrevClick = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const handleNextClick = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="px-4 md:px-8 lg:px-16 space-y-4">
      <div className="w-full justify-evenly items-center flex py-8">
        <img src={left_decor} alt="" />
        <h2 className="text-4xl font-italiana text-nowrap">
          <span>{offerData?.offerData?.title}</span>
        </h2>
        <img src={right_decor} alt="" />
      </div>
      <div className="relative">
        <div
          ref={sliderRef}
          className="flex overflow-x-hidden gap-4 scroll-smooth"
        >
          {offerData?.productList.slice(0, 10).map((product) => (
            <div key={product.id} className="w-full sm:w-1/4 md:1/3 lg:1/4">
              <div className="group relative bg-[#f1f2ec] border border-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Image container with proper aspect ratio */}
                <div className="relative aspect-[3/4] overflow-hidden min-w-[300px]">
                  <img
                    onClick={() =>
                      navigate(
                        `${config.VITE_BASE_WEBSITE_URL}/product/offersale/${offerData?.offerData?.slug}`
                      )
                    }
                    src={offerData?.offerData?.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/placeholder-image.png"; // Add a placeholder image
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onWishlistToggle(product.id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full text-white hover:text-gray-600 hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        wishlistedItems.has(product.id)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                  </button>
                </div>
                <div className="p-4 text-[black]">
                  <p className="font-medium truncate">{product.name}</p>
                  <div className="flex gap-2 items-center">
                    <p className="line-through text-gray-500">{`₹${product.original_price}`}</p>
                    <p className="font-bold">{`₹${product.discounted_price}`}</p>
                    <p className="text-red-500">{`${product.discount_price}% OFF`}</p>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600 mt-2">
                    {product.variations?.map((variation) => (
                      <p key={variation.id}>{variation.size.toUpperCase()}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
          <button
            onClick={handlePrevClick}
            className="p-2 rounded-full text-[#6B705C] bg-white shadow-md hover:bg-gray-50 transition-colors pointer-events-auto"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNextClick}
            className="p-2 rounded-full text-[#6B705C] bg-white shadow-md hover:bg-gray-50 transition-colors pointer-events-auto"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default OfferSection;
