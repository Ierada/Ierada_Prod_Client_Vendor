import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { addToWishlist, removeFromWishlist, getWishlist } from "../../../services/api.wishlist";
import { useAppContext } from "../../../context/AppContext";
import config from "../../../config/config";

const ProductSlider = ({ products }) => {
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const { user } = useAppContext();
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const response = await getWishlist(user.id);
          if (response?.data) {
            const wishlistSet = new Set(response.data.map(item => item.product_id));
            setWishlistedItems(wishlistSet);
          }
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      }
    };
    fetchWishlist();
  }, [user]);

  const handlePrevClick = () => {
    sliderRef.current?.scrollBy({ left: -sliderRef.current.clientWidth, behavior: "smooth" });
  };

  const handleNextClick = () => {
    sliderRef.current?.scrollBy({ left: sliderRef.current.clientWidth, behavior: "smooth" });
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      console.log("User not logged in. Show login modal.");
      return;
    }

    try {
      if (wishlistedItems.has(productId)) {
        const response = await removeFromWishlist(user.id, productId);
        if (response) {
          setWishlistedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      } else {
        const response = await addToWishlist(user.id, productId);
        if (response) {
          setWishlistedItems(prev => {
            const newSet = new Set(prev);
            newSet.add(productId);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const handleWishlistClick = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    isDragging.current = true;
    sliderRef.current.classList.add("cursor-grabbing");
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    sliderRef.current.classList.remove("cursor-grabbing");
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    sliderRef.current.classList.remove("cursor-grabbing");
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // scroll speed multiplier
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-scroll scroll-smooth no-scrollbar cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {products?.map((product) => (
          <div
            key={product.id}
            className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 my-1"
          >
            <div className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out border border-gray-100">
              <a href={`${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`}>
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={product?.images[0]?.url || "/api/placeholder/400/320"}
                    alt={product.name}
                    className="w-full h-full object-cover object-center transform transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => handleWishlistClick(e, product.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform duration-200 z-10"
                    aria-label={wishlistedItems.has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors duration-300 ${
                        wishlistedItems.has(product.id)
                          ? "text-red-500 fill-current"
                          : "text-gray-500"
                      }`}
                    />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-medium line-clamp-2 h-10 leading-5">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-gray-500 text-sm">₹{product.original_price}</span>
                    <span className="font-bold">₹{product.discounted_price}</span>
                    <span className="text-red-500 text-sm">{product.discount_percentage}% OFF</span>
                  </div>
                  {product.variations?.length > 0 && (
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-gray-500">Colors:</span>
                      <div className="flex gap-1">
                        {product.variations.map((variation) => (
                          <div
                            key={variation.unique_id}
                            className="w-4 h-4 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: variation.color_code }}
                            title={variation.color_name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
        <button
          onClick={handlePrevClick}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 pointer-events-auto ml-2"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={handleNextClick}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 pointer-events-auto mr-2"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default ProductSlider;
