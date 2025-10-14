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
import ProductCard from "../ProductCard";
import { getUserLikes } from "../../../services/api.likes";

// Base Product Slider Component
const BaseProductSlider = ({
  products,
  renderProduct,
  title,
  subtitle,
  description,
  headerContainerClass = "",
  showArrows = true,
}) => {
  const sliderRef = useRef(null);
  const textRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState(3);
  const [itemWidth, setItemWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [decorWidth, setDecorWidth] = useState(100);

  // Dynamically set the number of visible items based on screen width
  useEffect(() => {
    const updateVisibleItems = () => {
      if (sliderRef.current) {
        const containerWidth = sliderRef.current.clientWidth;
        const firstItem = sliderRef.current.firstChild;
        if (firstItem) {
          const itemWidth = firstItem.clientWidth + 16; // Include margin/gap
          setItemWidth(itemWidth);
          setVisibleItems(Math.max(1, Math.round(containerWidth / itemWidth)));
        }
      }
    };

    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);
    return () => window.removeEventListener("resize", updateVisibleItems);
  }, [products]);

  // Dynamic decor width based on text length
  useEffect(() => {
    const updateWidth = () => {
      if (textRef.current && title) {
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

    if (title) {
      // Initial calculation after render
      setTimeout(updateWidth, 0);
    }

    const handleResize = () => {
      if (title) updateWidth();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [title]);

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
    <section className="space-y-4 px-4 sm:px-6 md:px-8 lg:px-16">
      {title && (
        <div
          className={`w-full flex items-center gap-4 justify-center ${headerContainerClass}`}
        >
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
              {title?.split(" ")[0]}
            </span>
            <span className="">{title?.split(" ")?.slice(1)?.join(" ")}</span>
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
      )}
      {subtitle && (
        <h3 className="text-xs sm:text-lg md:text-xl md:font-semibold text-black-100 mt-2">
          {subtitle}
        </h3>
      )}
      {description && (
        <p className="text-[10px] leading-4 sm:text-base text-gray-600 mt-1">
          {description}
        </p>
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

        {showArrows && products?.length > visibleItems && (
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

  const renderProduct = (product) => (
    <div
      key={product.id}
      className="flex-none w-[219px] sm:w-[219px] md:w-[219px] lg:w-[219px]"
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
  );

  return (
    <>
      <BaseProductSlider
        products={data.items}
        renderProduct={renderProduct}
        title={data?.title}
        subtitle={data?.subtitle}
        description={data?.description}
      />
      <SignInModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

// Offer Products Slider
export const OfferProductCollection = ({ data }) => {
  const navigate = useNavigate();
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

  const renderProduct = (product) => (
    <div
      key={product.id}
      className="flex-none w-[219px] sm:w-[219px] md:w-[219px] lg:w-[219px]"
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
  );

  return (
    <>
      <BaseProductSlider
        products={data.items}
        renderProduct={renderProduct}
        title={data?.title}
        subtitle={data?.subtitle}
        description={data?.description}
      />
      <SignInModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
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

  const renderProduct = (product) => (
    <div key={product.id} className="flex-none w-1/2 sm:w-[219px]">
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
  );

  return (
    <>
      <BaseProductSlider
        products={data.items}
        renderProduct={renderProduct}
        title={data?.title}
        subtitle={data?.subtitle}
        description={data?.description}
        headerContainerClass="max-w-screen-2xl"
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

  const renderProduct = (product) => (
    <div
      key={product.id}
      className="flex-none w-[219px] sm:w-[219px] md:w-[219px] lg:w-[219px]"
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
  );

  return (
    <>
      <BaseProductSlider
        products={data.items}
        renderProduct={renderProduct}
        title={data?.title}
        subtitle={data?.subtitle}
        description={data?.description}
      />
      <SignInModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};
