import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../../../services/api.wishlist";
import { addLike, getUserLikes } from "../../../services/api.likes";
import { useAppContext } from "../../../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import config from "../../../config/config";
import ProductCard from "../ProductCard";
import SignInModal from "../SigninModal";

const ProductSlider = ({ products }) => {
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [likedItems, setLikedItems] = useState(new Set());
  const [wishlists, setWishlists] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, setTriggerHeaderCounts } = useAppContext();
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

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

  const fetchLikes = useCallback(async () => {
    if (user) {
      try {
        const likesResponse = await getUserLikes(user.id);
        if (likesResponse) {
          setLikedItems(new Set(likesResponse.map((item) => item.product_id)));
        }
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
    fetchLikes();
  }, [fetchWishlist, fetchLikes]);

  const onWishlistChange = useCallback(
    (productId, newState) => {
      setWishlistedItems((prev) => {
        const newSet = new Set(prev);
        if (newState) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });
      setTriggerHeaderCounts((prev) => prev + 1);
      fetchWishlist();
    },
    [fetchWishlist, setTriggerHeaderCounts]
  );

  const onLikeChange = useCallback(
    (productId) => {
      setLikedItems((prev) => new Set([...prev, productId]));
      fetchLikes();
    },
    [fetchLikes]
  );

  const handlePrevClick = () => {
    sliderRef.current?.scrollBy({
      left: -sliderRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const handleNextClick = () => {
    sliderRef.current?.scrollBy({
      left: sliderRef.current.clientWidth,
      behavior: "smooth",
    });
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
            <ProductCard
              product={product}
              isWishlisted={wishlistedItems.has(product.id)}
              wishlistId={
                wishlists.find((item) => item.product_id === product.id)?.id
              }
              isLiked={likedItems.has(product.id)}
              onWishlistChange={onWishlistChange}
              onLikeChange={onLikeChange}
              onRequireLogin={() => setShowLoginModal(true)}
            />
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
      <AnimatePresence>
        {showLoginModal && (
          <SignInModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSlider;
