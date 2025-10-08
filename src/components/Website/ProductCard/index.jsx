import React from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../services/api.wishlist";
import { addLike } from "../../../services/api.likes";
import { useAppContext } from "../../../context/AppContext";
import config from "../../../config/config";

const ProductCard = ({
  product,
  isWishlisted,
  wishlistId,
  isLiked,
  onWishlistChange,
  onLikeChange,
  onRequireLogin,
}) => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      onRequireLogin();
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(wishlistId);
      } else {
        await addToWishlist(user.id, product.id);
      }
      onWishlistChange(product.id, !isWishlisted);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const handleLikeProduct = async (e) => {
    e.stopPropagation();
    if (!user) {
      onRequireLogin();
      return;
    }

    if (isLiked) {
      console.log("Product already liked!");
      return;
    }

    try {
      await addLike(user.id, product.id);
      onLikeChange(product.id, true);
    } catch (error) {
      console.error("Error liking product:", error);
    }
  };

  const RatingStars = ({ rating = 0 }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-amber-400 text-sm" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt key={i} className="text-amber-400 text-sm" />
        );
      } else {
        stars.push(<FaRegStar key={i} className="text-amber-400 text-sm" />);
      }
    }

    return <div className="flex">{stars}</div>;
  };

  const productPath = `/product/${product.slug}`;

  return (
    <motion.div className="group overflow-hidden transition-shadow duration-300">
      <Link to={productPath} className="block">
        <div className="relative">
          <div className="relative aspect-[512/682] w-full overflow-hidden rounded-lg">
            {(product.media && product.media.length > 0) || product.image ? (
              <img
                src={
                  product.media && product.media.length > 0
                    ? product.media[0].url
                    : product.image
                }
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={handleWishlistToggle}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow hover:bg-gray-100 transition-all"
            >
              <Heart
                className={`w-5 h-5 ${
                  isWishlisted
                    ? "fill-rose-500 text-rose-500"
                    : "text-[#D8232F]"
                }`}
              />
            </button>
          </div>

          <div className="bg-white absolute bottom-2 left-2 px-1.5 text-sm z-10 rounded">
            <div className="flex items-center gap-1">
              <AiFillLike className="w-4 h-4 text-[#FF3B00]" />
              <span className="bg-gradient-to-r from-[#FFB700] to-[#FF3B00] bg-clip-text text-transparent font-semibold font-medium">
                {product.total_likes || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="py-4 px-2 relative">
          <button
            className="absolute top-1 right-1 rounded bg-white p-1 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
            onClick={handleLikeProduct}
          >
            {isLiked ? (
              <AiFillLike className="w-4 h-4 text-[#FF3B00]" />
            ) : (
              <AiOutlineLike className="w-4 h-4 text-[#FF3B00] hover:text-[#FFB700]" />
            )}
          </button>
          <h3 className="font-poppins text-sm mb-1 truncate text-[#3F0D0C]">
            {product.name}
          </h3>

          {/* <div className="flex items-center mb-2">
            <RatingStars rating={product.reviewStats?.average_rating} />
            <span className="text-xs text-gray-500 ml-2">
              ({product.reviewStats?.total_reviews || 0})
            </span>
          </div> */}

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#3F0D0C]">
              Rs.{product.discounted_price}
            </span>
            <span className="text-[#3F0D0C] text-xs line-through">
              Rs.{product.original_price}
            </span>
            {product.discount > 0 && (
              <span className="uppercase bg-gradient-to-r from-[#FFB700] to-[#FF3B00] bg-clip-text text-transparent text-xs">
                ({product.discount}% OFF)
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
