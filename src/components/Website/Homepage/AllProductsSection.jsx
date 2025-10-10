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
import ProductCard from "../../../components/Website/ProductCard";

const AllProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [wishlists, setWishlists] = useState([]);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [likedItems, setLikedItems] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, setTriggerHeaderCounts } = useAppContext();
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

  useEffect(() => {
    fetchProducts();
  }, []);

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

  // Infinite scroll logic with half-section trigger
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !hasMore || loading) return;

      const section = sectionRef.current;
      const sectionRect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

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
            className="h-2 md:h-4 lg:h-6 w-[50vh] hidden md:block"
          />
        )}
        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold flex gap-2 capitalize">
          <span className="bg-gradient-to-r from-[#FFB700] to-[#FF3B00] bg-clip-text text-transparent ">
            Customized
          </span>
          <span>Products For You</span>
        </h2>
        {right_decor && (
          <img
            src={right_decor}
            alt="Right Decoration"
            className="h-2 md:h-4 lg:h-6 w-[50vh] hidden md:block"
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-10">
        {products.map((product) => (
          <ProductCard
            key={product.id}
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
      <SignInModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
};

export default AllProductsSection;
