import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { addToWishlist, removeFromWishlist, getWishlist } from "../../../services/api.wishlist";
import { useAppContext } from "../../../context/AppContext";
import { useNavigate } from "react-router";
import config from "../../../config/config";


// --------------------COMMON SLIDER FOR CATEGORY, COLORS, AND COLLECTION---------

const CommonSlider = ({ commonData }) => {
  // const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const { user } = useAppContext();

  const sliderRef = useRef(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchWishlist = async () => {
  //     if (user) {
  //       try {
  //         const response = await getWishlist(user.id);
  //         if (response?.data) {
  //           const wishlistSet = new Set(response.data.map((item) => item.product_id));
  //           setWishlistedItems(wishlistSet);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching wishlist:", error);
  //       }
  //     }
  //   };
  //   fetchWishlist();
  // }, [user]);

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

  // const toggleWishlist = async (productId) => {
  //   if (!user) {
  //     console.log("User not logged in. Show login modal.");
  //     return;
  //   }

  //   try {
  //     if (wishlistedItems.has(productId)) {
  //       // Remove from wishlist
  //       const response = await removeFromWishlist(user.id, productId);
  //       if (response) {
  //         setWishlistedItems((prev) => {
  //           const newSet = new Set(prev);
  //           newSet.delete(productId);
  //           return newSet;
  //         });
  //       }
  //     } else {
  //       // Add to wishlist
  //       const response = await addToWishlist(user.id, productId);
  //       if (response) {
  //         setWishlistedItems((prev) => {
  //           const newSet = new Set(prev);
  //           newSet.add(productId);
  //           return newSet;
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error toggling wishlist:", error);
  //   }
  // };

  const handleProductClick = (slug) => {
    navigate(`${config.VITE_BASE_WEBSITE_URL}/product/${slug}`);
  };

  // const handleWishlistClick = (e, productId) => {
  //   e.stopPropagation();
  //   toggleWishlist(productId);
  // };

  return (
    <div className="relative">
      <div ref={sliderRef} className="flex overflow-x-hidden gap-4 scroll-smooth">
        {commonData &&
          commonData?.map((data) => (
            <div key={data.id} className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 my-1 cursor-pointer">
              <div className="group relative bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <a
                  href={`${config.VITE_BASE_WEBSITE_URL}/category/${data.slug}`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={data?.image || "/api/placeholder/400/320"}
                      alt={data.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-[black]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full  text-white text-center py-2">
                    <p className="text-sm sm:text-base font-medium">{data.title || data.color || data.collection_name}</p>  
                  </div>
                </a>
              </div>
            </div>
          ))}
      </div>
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
        <button
          onClick={handlePrevClick}
          className="p-2 rounded-full text-[#6B705C]  bg-white shadow-md hover:bg-gray-50 transition-colors pointer-events-auto"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNextClick}
          className="p-2 rounded-full text-[#6B705C]  bg-white shadow-md hover:bg-gray-50 transition-colors pointer-events-auto"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default CommonSlider;
