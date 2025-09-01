import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart, ArrowUpRight } from "lucide-react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../../../services/api.wishlist";
import { useAppContext } from "../../../context/AppContext";
import config from "../../../config/config";
import { motion, AnimatePresence } from "framer-motion";
import SignInModal from "../../../components/Website/SigninModal";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";

// Base Product Slider Component
const BaseProductSlider = ({
  products,
  renderProduct,
  title,
  showArrows = true,
}) => {
  const sliderRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState(3);
  const [itemWidth, setItemWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Dynamically set the number of visible items based on screen width
  useEffect(() => {
    const updateVisibleItems = () => {
      if (sliderRef.current) {
        const containerWidth = sliderRef.current.clientWidth;
        const firstItem = sliderRef.current.firstChild;
        if (firstItem) {
          const itemWidth = firstItem.clientWidth + 16; // Include margin/gap
          setItemWidth(itemWidth);
          //setVisibleItems(Math.floor(containerWidth / itemWidth));
          setVisibleItems(Math.max(1, Math.round(containerWidth / itemWidth)));
        }
      }
    };

    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);
    return () => window.removeEventListener("resize", updateVisibleItems);
  }, [products]);

  const handlePrevClick = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -itemWidth * visibleItems,
        behavior: "smooth",
      });
    }
  };

  const handleNextClick = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: itemWidth * visibleItems,
        behavior: "smooth",
      });
    }
  };

  // Mouse & Touch Dragging Events
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiply for faster scroll effect
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-16 space-y-4">
      {title && (
        <div className="w-full flex justify-center items-center py-6 gap-3 sm:gap-4 md:gap-6">
          {left_decor && (
            <img
              src={left_decor}
              alt="Left Decoration"
              className="h-3 sm:h-4 md:h-5 lg:h-6 w-auto"
            />
          )}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-italiana text-nowrap text-center">
            <span>{title}</span>
          </h2>
          {right_decor && (
            <img
              src={right_decor}
              alt="Right Decoration"
              className="h-3 sm:h-4 md:h-5 lg:h-6 w-auto"
            />
          )}
        </div>
      )}
      <div className="relative">
        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-4 scroll-smooth no-scrollbar cursor-pointer select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {products?.map(renderProduct)}
        </div>

        {showArrows && products.length > visibleItems && (
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
        )}
      </div>
    </section>
  );
};

// Wishlist Hook
const useWishlist = () => {
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const { user } = useAppContext();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const response = await getWishlist(user.id);
          if (response?.data) {
            const wishlistSet = new Set(
              response.data.map((item) => item.product_id)
            );
            setWishlistedItems(wishlistSet);
          }
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      }
    };
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      console.log("User not logged in. Show login modal.");
      return;
    }

    try {
      if (wishlistedItems.has(productId)) {
        const response = await removeFromWishlist(user.id, productId);
        if (response) {
          setWishlistedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      } else {
        const response = await addToWishlist(user.id, productId);
        if (response) {
          setWishlistedItems((prev) => {
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

  return { wishlistedItems, toggleWishlist };
};

// Popular Products Slider
export const PopularProductsSlider = ({ data }) => {
  const navigate = useNavigate();
  const { wishlistedItems, toggleWishlist } = useWishlist();

  const renderProduct = (product) => (
    <div
      key={product.id}
      className="flex-none w-[219px]  sm:w-[219px] md:w-[219px] lg:w-[219px] my-1"
    >
      <div className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out border border-gray-100">
        <a
          onClick={(e) => {
            e.preventDefault();
            navigate(`${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`);
          }}
          href="#"
        >
          <div className="relative max-w-[219px] aspect-[512/682] sm:w-[219px] sm:h-[291px] overflow-hidden">
            <img
              src={
                product?.images?.[0]?.url ||
                "https://via.placeholder.com/512x682?text=Product+Image"
              }
              alt={product.name}
              className="w-full h-full object-contain object-center transform transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform duration-200 z-10"
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
            <h3 className="text-sm font-medium line-clamp-2 h-10 leading-5">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="line-through text-gray-500 text-sm">
                ₹{product.original_price}
              </span>
              <span className="font-bold">
                ₹{product.original_price - product.discounted_price}
              </span>
              <span className="text-red-500 text-sm">
                {product.discount_percentage}% OFF
              </span>
            </div>
          </div>
        </a>
      </div>
    </div>
  );

  return (
    <BaseProductSlider
      products={data.items}
      renderProduct={renderProduct}
      title={data?.title}
    />
  );
};

// Offer Products Slider
export const OfferProductCollection = ({ data }) => {
  const navigate = useNavigate();

  const renderProduct = (product) => (
    <div
      key={product.id}
      className="flex-none w-[219px] sm:w-[219px] md:w-[219px] lg:w-[219px]"
    >
      <a
        onClick={(e) => {
          e.preventDefault();
          navigate(`${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`);
        }}
        href="#"
      >
        <div className="group relative bg-[#f1f2ec] border border-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="relative max-w-[219px] aspect-[512/682] sm:w-[219px] sm:h-[291px] overflow-hidden">
            <img
              src={
                product?.image ||
                "https://via.placeholder.com/512x682?text=Product+Image"
              }
              alt={product.name}
              className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              <p>
                {`${(
                  ((product.original_price - product.discounted_price) /
                    product.original_price) *
                  100
                )?.toFixed(0)}% Off`}
              </p>
            </div>
          </div>

          <div className="p-4 text-black">
            <div className="flex pb-2 items-center gap-1 text-[#FC9231] text-lg">
              {[
                ...Array(Math.floor(product?.reviewStats?.average_rating || 0)),
              ].map((_, index) => (
                <FaStar key={`full-${index}`} />
              ))}
              {product?.reviewStats?.average_rating % 1 !== 0 && (
                <FaStarHalfAlt />
              )}
              {[
                ...Array(
                  5 - Math.ceil(product?.reviewStats?.average_rating || 0)
                ),
              ].map((_, index) => (
                <FaRegStar key={`empty-${index}`} />
              ))}
              <p className="text-gray-500 ml-2">
                ({product?.reviewStats?.total_reviews || 0})
              </p>
            </div>
            <p className="text-sm font-medium line-clamp-2">{product.name}</p>
            <div className="flex justify-between mt-4">
              <div className="flex gap-2 items-center">
                <p className="text-xl">{`₹${
                  product.original_price - product.discounted_price
                }`}</p>
                <p className="line-through text-gray-500">{`₹${product.original_price}`}</p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(
                    `${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`
                  );
                }}
                className="border-black border-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </a>
    </div>
  );

  return (
    <BaseProductSlider
      products={data.items}
      renderProduct={renderProduct}
      title={data?.title}
    />
  );
};

// Offer Slider
export const OfferSlider = ({ data }) => {
  const navigate = useNavigate();
  const { wishlistedItems, toggleWishlist } = useWishlist();

  const renderProduct = (item) => {
    return (
      <div
        key={item.id}
        className="flex-none w-[219px] sm:w-[219px] md:w-[219px] lg:w-[219px] flex justify-center"
      >
        <div
          className="w-full p-4 bg-gray-100 rounded-lg shadow-lg"
          onClick={() =>
            navigate(
              `${config.VITE_BASE_WEBSITE_URL}/collection/offers/${item.slug}`
            )
          }
        >
          <img
            src={
              item.image ||
              "https://via.placeholder.com/512x682?text=Offer+Image"
            }
            alt={item.title}
            className="max-w-[219px] aspect-[512/682] sm:w-[219px] sm:h-[291px] object-contain rounded"
          />
          <h3 className="text-lg font-bold mt-2 text-center">{item.title}</h3>
          <p className="text-sm text-gray-700 text-center">
            {item.description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <BaseProductSlider
      products={data.items || []}
      renderProduct={renderProduct}
      title={data.title}
    />
  );
};

// Product Collection Slider
export const ProductCollectionSlider = ({ data }) => {
  const navigate = useNavigate();
  const { user, setTriggerHeaderCounts } = useAppContext();
  const [wishlists, setWishlists] = useState([]);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch wishlist for authenticated user
  const fetchWishlist = useCallback(async () => {
    if (user) {
      try {
        const response = await getWishlist(user.id);
        if (response?.data) {
          setWishlists(response.data);
          const wishlistSet = new Set(
            response.data.map((item) => item.product_id)
          );
          setWishlistedItems(wishlistSet);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Handle wishlist toggle
  const handleWishlistToggle = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (wishlistedItems.has(productId)) {
        const wishlist = wishlists.find(
          (item) => item.product_id === productId
        );
        await removeFromWishlist(wishlist.id);
        wishlistedItems.delete(productId);
      } else {
        await addToWishlist(user.id, productId);
        wishlistedItems.add(productId);
      }
      setWishlistedItems(new Set(wishlistedItems));
      setTriggerHeaderCounts((prev) => prev + 1);
      await fetchWishlist(); // Re-fetch wishlist to get updated IDs if needed
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const renderProduct = (product) => (
    <div key={product.id} className="flex-none w-1/2 sm:w-[219px]">
      <a
        onClick={(e) => {
          e.preventDefault();
          navigate(`${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`);
        }}
        href="#"
        className="block h-full"
      >
        <div className="group relative bg-[#f1f2ec] border border-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full rounded-lg">
          <div className="relative max-w-[219px] aspect-[512/682] sm:w-[219px] sm:h-[291px] overflow-hidden flex items-center justify-center bg-white rounded-t-lg">
            <img
              src={
                product?.image ||
                "https://via.placeholder.com/512x682?text=Product+Image"
              }
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />

            {/* Wishlist button - Updated for mobile visibility */}
            <button
              onClick={(e) => handleWishlistToggle(product.id, e)}
              className="absolute top-2 right-14 w-10 h-10 md:right-2 z-10 md:w-10 md:h-10 sm:w-8 sm:h-8 rounded-full bg-white/80 flex items-center justify-center shadow-md hover:bg-white transition-all duration-200"
              aria-label={
                wishlistedItems.has(product.id)
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              <Heart
                className={`md:w-4 md:h-4 w-4 h-4 ${
                  wishlistedItems.has(product.id)
                    ? "fill-rose-500 text-rose-500"
                    : "text-gray-600"
                }`}
              />
            </button>

            {product.original_price && product.discounted_price && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded min-w-[50px] text-center">
                <p>
                  {`${(
                    ((product.original_price - product.discounted_price) /
                      product.original_price) *
                    100
                  )?.toFixed(0)}% Off`}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 text-black bg-[#F8F8F8] flex flex-col flex-grow">
            <div className="flex pb-2 items-center gap-1 text-[#FC9231] text-lg min-h-[24px]">
              {[
                ...Array(Math.floor(product?.reviewStats?.average_rating || 0)),
              ].map((_, index) => (
                <FaStar key={`full-${index}`} />
              ))}
              {product?.reviewStats?.average_rating % 1 !== 0 && (
                <FaStarHalfAlt />
              )}
              {[
                ...Array(
                  5 - Math.ceil(product?.reviewStats?.average_rating || 0)
                ),
              ].map((_, index) => (
                <FaRegStar key={`empty-${index}`} />
              ))}
              <p className="text-gray-500 ml-2 text-sm">
                ({product?.reviewStats?.total_reviews || 0})
              </p>
            </div>

            <p className="text-md font-normal font-lato text-gray-900 line-clamp-2 min-h-[48px] mb-2 break-words">
              {product.name}
            </p>

            <div className="flex justify-between mt-auto items-center">
              <div className="flex gap-2 items-center">
                <p className="text-xl font-medium font-lato text-gray-900">{`₹${product.discounted_price}`}</p>
                <p className="line-through text-lg font-medium font-lato text-[#9CA3AF]">{`₹${product.original_price}`}</p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(
                    `${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`
                  );
                }}
                className="border-black-2 border-2 rounded-full w-7 h-7 flex items-center text-black-2 justify-center hover:bg-black hover:text-white transition-colors"
              >
                <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </a>
    </div>
  );

  return (
    <>
      <BaseProductSlider
        products={data.items}
        renderProduct={renderProduct}
        title={data?.title}
      />
      <SignInModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

// Featured Products Slider
export const FeaturedCollectionSlider = ({ data }) => {
  const navigate = useNavigate();

  const renderProduct = (product) => (
    <div
      key={product.id}
      className="flex-none w-[219px] sm:w-[219px] md:w-[219px] lg:w-[219px]"
    >
      <a
        onClick={(e) => {
          e.preventDefault();
          navigate(`${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`);
        }}
        href="#"
      >
        <div className="group relative bg-[#f1f2ec] border border-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="relative max-w-[219px] aspect-[512/682] sm:w-[219px] sm:h-[291px] overflow-hidden">
            <img
              src={
                product?.image ||
                "https://via.placeholder.com/512x682?text=Product+Image"
              }
              alt={product.name}
              className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              <p>
                {`${(
                  ((product.original_price - product.discounted_price) /
                    product.original_price) *
                  100
                )?.toFixed(0)}% Off`}
              </p>
            </div>
          </div>

          <div className="p-4 text-black">
            <div className="flex pb-2 items-center gap-1 text-[#FC9231] text-lg">
              {[
                ...Array(Math.floor(product?.reviewStats?.average_rating || 0)),
              ].map((_, index) => (
                <FaStar key={`full-${index}`} />
              ))}
              {product?.reviewStats?.average_rating % 1 !== 0 && (
                <FaStarHalfAlt />
              )}
              {[
                ...Array(
                  5 - Math.ceil(product?.reviewStats?.average_rating || 0)
                ),
              ].map((_, index) => (
                <FaRegStar key={`empty-${index}`} />
              ))}
              <p className="text-gray-500 ml-2">
                ({product?.reviewStats?.total_reviews || 0})
              </p>
            </div>
            <p className="text-sm font-medium line-clamp-2">{product.name}</p>
            <div className="flex justify-between mt-4">
              <div className="flex gap-2 items-center">
                <p className="text-xl">{`₹${
                  product.original_price - product.discounted_price
                }`}</p>
                <p className="line-through text-gray-500">{`₹${product.original_price}`}</p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(
                    `${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`
                  );
                }}
                className="border-black border-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </a>
    </div>
  );

  return (
    <BaseProductSlider
      products={data.items}
      renderProduct={renderProduct}
      title={data?.title}
    />
  );
};
