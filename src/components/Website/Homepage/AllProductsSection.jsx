import React, { useState, useEffect, useCallback, useRef } from "react";
import { getCollectionData } from "../../../services/api.collection";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Heart } from "lucide-react";
import { useAppContext } from "../../../context/AppContext";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../../../services/api.wishlist";
import { motion, AnimatePresence } from "framer-motion";
import SignInModal from "../../../components/Website/SigninModal";
import { Loader2 } from "lucide-react";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";

const AllProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [wishlists, setWishlists] = useState([]);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const { user, setTriggerHeaderCounts } = useAppContext();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const sectionRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const queryParams = {
        page: page,
        limit: 20,
        sortBy: "featured",
      };
      const response = await getCollectionData("all", "all", queryParams);

      if (response?.data) {
        setProducts((prev) => [...prev, ...response.data.productData]);
        setHasMore(
          response.data.pagination.currentPage <
            response.data.pagination.totalPages
        );
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

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

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle wishlist toggle
  const handleWishlistToggle = async (productId) => {
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

  // Infinite scroll logic with half-section trigger
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !hasMore || loading) return;

      const section = sectionRef.current;
      const sectionRect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Trigger fetch when scrolled to half of the section
      // Adjusted slightly to ensure it triggers before reaching the very end
      if (sectionRect.bottom <= windowHeight + sectionRect.height / 2) {
        fetchProducts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchProducts, hasMore, loading]);

  return (
    <section className="py-6 px-3 sm:px-4 md:px-6 lg:px-8" ref={sectionRef}>
      <div className="w-full flex justify-center items-center py-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-6">
        {left_decor && (
          <img
            src={left_decor}
            alt="Left Decoration"
            className="h-3 sm:h-4 md:h-5 lg:h-6 object-contain"
          />
        )}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-italiana text-center whitespace-nowrap px-2">
          Customized Products For You
        </h2>
        {right_decor && (
          <img
            src={right_decor}
            alt="Right Decoration"
            className="h-3 sm:h-4 md:h-5 lg:h-6 object-contain"
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-10">
        {products.map((product) => (
          <div
            key={product.id}
            className="group border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative">
              {/* Product image */}
              <div
                className="relative w-full aspect-[512/682] overflow-hidden cursor-pointer"
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                {product.media && product.media.length > 0 ? (
                  <img
                    src={product.media[0].url}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}
              </div>

              {/* Wishlist button */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigating to product page
                    handleWishlistToggle(product.id);
                  }}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-gray-50 transition-all duration-200"
                  aria-label={
                    wishlistedItems.has(product.id)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <Heart
                    className={`w-5 h-5 ${
                      wishlistedItems.has(product.id)
                        ? "fill-rose-500 text-rose-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              </div>

              {/* Discount tag */}
              {product.discount > 0 && (
                <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-0.5 text-xs font-semibold rounded-full shadow-sm">
                  {product.discount}% OFF
                </div>
              )}
            </div>

            {/* Product info */}
            <div
              className="p-3 sm:p-4 cursor-pointer"
              onClick={() => navigate(`/product/${product.slug}`)}
            >
              <h3 className="font-medium text-sm sm:text-base mb-4 truncate text-gray-800 hover:text-gray-950">
                {product.name}
              </h3>
              {/* <div className="flex items-center gap-2 text-sm sm:text-base">
                <span className="font-bold text-gray-900">
                  ₹{product.discounted_price}
                </span>
                {product.discount > 0 && (
                  <span className="text-gray-500 text-xs sm:text-sm line-through">
                    ₹{product.original_price}
                  </span>
                )}
              </div> */}
              <div className="flex justify-between mt-auto items-center">
                <div className="flex gap-2 items-center">
                  <p className="font-medium text-md sm:text-base font-lato text-gray-900">{`₹${product.discounted_price}`}</p>
                  <p className="line-through font-medium text-md sm:text-base font-lato text-[#9CA3AF]">{`₹${product.original_price}`}</p>
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
        ))}
      </div>
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-500" />
          <p className="mt-2 text-gray-500">Loading more products...</p>
        </div>
      )}
      {!hasMore && products.length > 0 && (
        <p className="text-center py-8 text-gray-600 text-lg font-medium">
          You've seen all our amazing products!
        </p>
      )}
      <AnimatePresence>
        {showLoginModal && (
          <SignInModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default AllProductsSection;
