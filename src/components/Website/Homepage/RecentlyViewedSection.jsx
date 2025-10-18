import React, { useState, useEffect, useCallback, useRef } from "react";
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
import config from "../../../config/config";
import { useNavigate } from "react-router";

const RecentlyViewed = ({ data }) => {
  const browsing_history = data ? data.items : [];
  const navigate = useNavigate();
  const textRef = useRef(null);
  const { user, setTriggerHeaderCounts } = useAppContext();
  const [wishlists, setWishlists] = useState([]);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [likedItems, setLikedItems] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentSlidesToShow, setCurrentSlidesToShow] = useState(5);
  const [decorWidth, setDecorWidth] = useState(100);

  const getSlidesToShow = (width) => {
    if (width < 480) return 2;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    if (width < 1280) return 4;
    return 5;
  };

  useEffect(() => {
    const handleResize = () => {
      setCurrentSlidesToShow(getSlidesToShow(window.innerWidth));
    };

    handleResize(); // Initial calculation
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  // Dynamic decor width based on text length
  useEffect(() => {
    const updateWidth = () => {
      if (textRef.current && data?.title) {
        const originalWs = textRef.current.style.whiteSpace;
        textRef.current.style.whiteSpace = "nowrap";
        requestAnimationFrame(() => {
          const textWidth = textRef.current.scrollWidth;
          textRef.current.style.whiteSpace = originalWs;
          const container = textRef.current.parentElement;
          if (container) {
            const containerWidth = container.clientWidth;
            const gap = window.innerWidth >= 768 ? 32 : 16;
            const sideWidth = Math.max(
              50,
              (containerWidth - textWidth - gap) / 2
            );
            setDecorWidth(sideWidth);
          }
        });
      }
    };

    if (data?.title) {
      // Initial calculation after render
      setTimeout(updateWidth, 0);
    }

    const handleResize = () => {
      if (data?.title) updateWidth();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data?.title]);

  const shouldLoop = browsing_history.length > currentSlidesToShow;

  const settings = {
    dots: false,
    infinite: shouldLoop,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: shouldLoop,
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
    <section className="max-w-6xl mx-auto space-y-4">
      <div className="text-center md:pb-8">
        <div className="w-full flex justify-center items-center gap-4 md:gap-8">
          {left_decor && (
            <img
              src={left_decor}
              alt="Left Decoration"
              className="h-2 md:h-4 lg:h-auto hidden md:block"
              style={{ width: `${decorWidth}px` }}
            />
          )}
          <h2
            ref={textRef}
            className="text-lg sm:text-2xl md:text-3xl font-bold flex justify-center gap-2 capitalize whitespace-nowrap"
          >
            <span className="bg-gradient-to-r from-[#FFB700] to-[#FF3B00] bg-clip-text text-transparent">
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
              className="h-2 md:h-4 lg:h-auto hidden md:block"
              style={{ width: `${decorWidth}px` }}
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
        <div className="text-center">
          <p className="text-gray-500">You haven't viewed any products yet.</p>
          <button
            onClick={() =>
              navigate(`${config.VITE_BASE_WEBSITE_URL}/collection/all`)
            }
            className="bg-button-gradient text-white px-4 py-2 rounded-md mt-4 inline-block text-blue-500 hover:underline"
          >
            Shop Now
          </button>
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
