import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";
import { useAppContext } from "../../../context/AppContext";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../../../services/api.wishlist";
import { addLike, getUserLikes } from "../../../services/api.likes";
import SignInModal from "../../../components/Website/SigninModal";
import ProductCard from "../../../components/Website/ProductCard";

const TrendingSection = ({ data }) => {
  const navigate = useNavigate();
  const { trending_products, browsing_history } = data ? data.items : [];
  const { user, setTriggerHeaderCounts } = useAppContext();
  const [wishlists, setWishlists] = useState([]);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [likedItems, setLikedItems] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (user) {
      try {
        const response = await getWishlist(user.id);
        if (response?.data) {
          setWishlists(response.data);
          setWishlistedItems(
            new Set(response.data.map((item) => item.product_id))
          );
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

  const onWishlistChange = (productId, newState) => {
    setWishlistedItems((prev) => {
      const newSet = new Set(prev);
      if (newState) newSet.add(productId);
      else newSet.delete(productId);
      return newSet;
    });
    setTriggerHeaderCounts((prev) => prev + 1);
    fetchWishlist();
  };

  const onLikeChange = (productId) => {
    setLikedItems((prev) => new Set([...prev, productId]));
    fetchLikes();
  };

  return (
    <section className="px-4 md:px-8 lg:px-16 space-y-4">
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
      <div className="flex flex-wrap lg:flex-nowrap gap-8">
        <div className="w-full lg:w-1/3 bg-[#FFBCC7] p-6 rounded-md flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3 px-4 py-6 text-center sm:px-6 md:px-7">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[black] mb-2">
              {browsing_history?.length > 0
                ? "Continue Browsing"
                : "No Browsing Data Available"}
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
              {browsing_history?.length > 0
                ? "Shop again where you left..."
                : "You haven't viewed any products yet."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {browsing_history?.slice(0, 6)?.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                isWishlisted={wishlistedItems.has(item.id)}
                wishlistId={wishlists.find((w) => w.product_id === item.id)?.id}
                isLiked={likedItems.has(item.id)}
                onWishlistChange={onWishlistChange}
                onLikeChange={onLikeChange}
                onRequireLogin={() => setShowLoginModal(true)}
              />
            ))}
          </div>
          <button
            onClick={() =>
              navigate(`${config.VITE_BASE_WEBSITE_URL}/collection/all`)
            }
            className="mx-auto flex border border-[#6B705C] text-[#6B705C] px-4 py-2 font-medium hover:bg-[#6B705C] hover:text-white transition"
          >
            Shop Now →
          </button>
        </div>

        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {trending_products?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistedItems.has(product.id)}
                wishlistId={
                  wishlists.find((w) => w.product_id === product.id)?.id
                }
                isLiked={likedItems.has(product.id)}
                onWishlistChange={onWishlistChange}
                onLikeChange={onLikeChange}
                onRequireLogin={() => setShowLoginModal(true)}
              />
            ))}
          </div>
        </div>
      </div>
      <SignInModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
};

export default TrendingSection;
