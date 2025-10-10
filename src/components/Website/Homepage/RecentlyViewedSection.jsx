import React, { useState, useEffect, useCallback } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAppContext } from "../../../context/AppContext";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../../../services/api.wishlist";
import { addLike, getUserLikes } from "../../../services/api.likes";
import SignInModal from "../../../components/Website/SigninModal";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";
import ProductCard from "../../../components/Website/ProductCard";

const RecentlyViewed = ({ data }) => {
  const browsing_history = data ? data.items : [];
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
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-16 space-y-4">
      <div className="text-center pb-8">
        <div className="w-full flex justify-center items-center md:py-2 gap-4 md:gap-8">
          {left_decor && (
            <img
              src={left_decor}
              alt="Left Decoration"
              className="h-2 md:h-4 lg:h-6 w-[50vh] hidden md:block"
            />
          )}
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold flex gap-2 capitalize">
            <span className="bg-gradient-to-r from-[#FFB700] to-[#FF3B00] bg-clip-text text-transparent ">
              {data?.title?.split(" ")[0]}
            </span>
            <span>{data?.title?.split(" ")?.slice(1)?.join(" ")}</span>
          </h2>
          {right_decor && (
            <img
              src={right_decor}
              alt="Right Decoration"
              className="h-2 md:h-4 lg:h-6 w-[50vh] hidden md:block"
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

      {browsing_history?.length > 0 ? (
        <Slider {...settings}>
          {browsing_history.map((item) => (
            <div key={item.id} className="px-2">
              <ProductCard
                product={item}
                isWishlisted={wishlistedItems.has(item.id)}
                wishlistId={wishlists.find((w) => w.product_id === item.id)?.id}
                isLiked={likedItems.has(item.id)}
                onWishlistChange={onWishlistChange}
                onLikeChange={onLikeChange}
                onRequireLogin={() => setShowLoginModal(true)}
              />
            </div>
          ))}
        </Slider>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">You haven't viewed any products yet.</p>
        </div>
      )}
      <SignInModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
};

export default RecentlyViewed;
