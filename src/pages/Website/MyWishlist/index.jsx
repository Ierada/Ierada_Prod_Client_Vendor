import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import config from "../../../config/config";
import { AccountInfo } from "../../../components/Website/AccountInfo";
import { IoMdCart } from "react-icons/io";
import {
  getWishlist,
  removeFromWishlist,
} from "../../../services/api.wishlist";
import { addToCart } from "../../../services/api.cart";
import { useAppContext } from "../../../context/AppContext";
import { useNavigate } from "react-router";
import EmptyImg from "/assets/skeleton/empty-wishlist.svg";
import { motion } from "framer-motion";

import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import common_top_banner from "/assets/banners/Commen-top-banner.png";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { Heart } from "lucide-react";

const bannerData = [
  {
    id: 1,
    image: common_top_banner,
  },
];
const VariationSelectionModal = ({
  isOpen,
  onClose,
  productData,
  onAddToCart,
}) => {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (selectedColor) {
      const sizes = selectedColor.sizes;
      setAvailableSizes(sizes);
      setSelectedSize(null);
      setErrorMessage("");
    } else {
      setAvailableSizes([]);
      setErrorMessage("");
    }
  }, [selectedColor]);

  const renderColorVariations = () => {
    const colorVariations = productData?.variationsData;

    if (!colorVariations || colorVariations.length === 0) return null;

    return (
      <div className="space-y-2">
        <p className="font-normal text-[#000000] capitalize">Color</p>
        <div className="flex gap-2">
          {colorVariations?.map((variation) => (
            <button
              key={variation.id}
              onClick={() => setSelectedColor(variation)}
              className={`w-8 h-8 border 
                ${
                  selectedColor?.id === variation.id
                    ? "border-black border-2"
                    : "border-gray-300"
                }`}
              style={{ backgroundColor: variation.color_code }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSizeVariations = () => {
    if (availableSizes.length === 0) return null;

    return (
      <div className="space-y-2">
        <p className="font-normal text-[#000000] capitalize">Size</p>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => setSelectedSize(size)}
              className={`px-3 py-1 border text-[10px] md:text-sm 
                ${
                  selectedSize?.id === size.id
                    ? "bg-black text-white"
                    : "border-gray-300 text-black"
                }`}
            >
              {size?.size_name?.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      setErrorMessage("Please select both color and size.");
      return;
    }

    onAddToCart({
      color: selectedColor,
      size: selectedSize,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-lg w-96"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <h2 className="text-xl font-bold mb-4">Select Variations</h2>

        {renderColorVariations()}
        {renderSizeVariations()}

        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!selectedColor || !selectedSize}
            className={`px-4 py-2 ${
              !selectedColor || !selectedSize
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white"
            }`}
          >
            Add to Cart
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Wishlist = () => {
  const { user, setTriggerHeaderCounts } = useAppContext();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistUpdated, setWishlistUpdated] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const navigate = useNavigate();

  const getWishlistData = async () => {
    const res = await getWishlist(user.id);
    if (res?.data) {
      setWishlist(res.data);
    } else {
      setWishlist([]);
    }
  };

  useEffect(() => {
    getWishlistData(user?.id);
  }, [wishlistUpdated]);

  const removeItemFromWishlist = async (itemId) => {
    const res = await removeFromWishlist(itemId);
    if (res) {
      setWishlistUpdated((prev) => !prev);
      setTriggerHeaderCounts((prev) => !prev);
    }
  };

  const handleAddToCart = async (productItem, selectedVariations) => {
    const userToken = Cookies.get(`${config.BRAND_NAME}userToken`);

    if (userToken) {
      const userData = jwtDecode(userToken);

      setAddingToCart(true);

      try {
        const cartData = {
          product_id: productItem.product_id,
          qty: 1,
          type: "sale",
          // variation_ids: [
          //   selectedVariations.size?.id,
          //   selectedVariations.color?.id,
          // ].filter(Boolean),
          variation_id: selectedVariations?.size?.id
            ? selectedVariations.size.id
            : selectedVariations?.color?.id
            ? selectedVariations.color.id
            : null,
        };

        const response = await addToCart(userData.id, cartData);
        if (response) {
          navigate(`${config.VITE_BASE_WEBSITE_URL}/cart`);
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
      } finally {
        setAddingToCart(false);
        setIsVariationModalOpen(false);
        setSelectedProduct(null);
      }
    } else {
      navigate(`${config.VITE_BASE_WEBSITE_URL}/login`);
    }
  };

  const openVariationModal = (item) => {
    const hasVariations =
      item.Product.Variations && item.Product.Variations.length > 0;

    if (hasVariations) {
      setSelectedProduct(item);
      setIsVariationModalOpen(true);
    } else {
      handleAddToCart(item, {});
    }
  };

  const calculateDiscount = (originalPrice, discountedPrice) => {
    const discountPercentage =
      ((originalPrice - discountedPrice) / originalPrice) * 100;
    return discountPercentage.toFixed(2);
  };

  return (
    <>
      <main className="mb-20">
        <CommonTopBanner bannerData={bannerData} />

        <section className="w-full">
          <div className="text-center my-10 text-[#000000]">
            <h1 className="text-2xl lg:text-4xl font-semibold mb-2 font-Playfair">
              My Account
            </h1>
            <p className=" text-sm lg:text-base font-Lato font-medium ">
              Home / My Wishlist
            </p>
          </div>

          <div className="md:gap-4 lg:gap-8  bg-white px-4  md:px-5 lg:px-20  flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <AccountInfo activeSection="wishlist" />
            </div>
            <div className="mt-10 w-full">
              <h2 className="text-xl font-normal mb-4 text-[black]">
                Showing {wishlist?.length} of {wishlist?.length} items
              </h2>
              <div
                className={
                  wishlist?.length > 0
                    ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
                    : `flex justify-center`
                }
              >
                {wishlist?.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <h1 className="text-2xl font-bold mb-4">
                      YOUR WISHLIST IS EMPTY
                    </h1>
                    <p className="text-gray-600 mb-8 text-center">
                      Add items that you like to your wishlist. <br />
                      Review them anytime and easily move them to the bag.
                    </p>
                    <img className="mb-4" src={EmptyImg} alt="Empty Wishlist" />
                    <button
                      className="bg-black text-white font-bold py-2 px-4 rounded"
                      onClick={() =>
                        navigate(
                          `${config.VITE_BASE_WEBSITE_URL}/collection/all`
                        )
                      }
                    >
                      CONTINUE SHOPPING
                    </button>
                  </div>
                )}

                {wishlist?.map((item) => (
                  <div key={item.id} className="border">
                    <div className="relative items-center">
                      <img
                        src={item?.Product?.images[0]}
                        alt={item?.Product?.name}
                        className="w-full aspect-[400/533] object-contain"
                        onClick={() =>
                          navigate(
                            `${config.VITE_BASE_WEBSITE_URL}/product/${item?.Product?.slug}`
                          )
                        }
                      />

                      <button
                        onClick={() => removeItemFromWishlist(item.id)}
                        className="absolute top-2 right-2 p-2"
                      >
                        <Heart className="w-5 h-5 fill-danger text-danger" />
                      </button>

                      <div className="p-2">
                        <h3 className="font-normal text-sm text-black truncate">
                          {item?.Product?.name}
                        </h3>
                        <p className="text-sm mt-2">
                          MRP:{" "}
                          <span className="line-through text-gray-500">
                            ₹{item?.Product?.original_price}
                          </span>
                          <span className="text-gray-500 ml-2">
                            ₹{item?.Product?.discounted_price}
                          </span>
                          <span className="ml-2 text-red-500 text-sm font-medium">
                            {calculateDiscount(
                              item?.Product?.original_price,
                              item?.Product?.discounted_price
                            )}{" "}
                            % OFF
                          </span>
                        </p>
                      </div>

                      {/* <div className="flex justify-between items-center text-sm text-gray-600 mx-2">
                        <div className="flex gap-2">
                          {(item?.Product?.Variations || []).map(
                            (variation) => (
                              <div
                                key={variation.id}
                                className="flex items-center gap-2"
                              >
                                <p>{variation?.Size?.name?.toUpperCase()}</p>
                              </div>
                            )
                          )}
                        </div>

                        {/* Right: Review Stars *
                        <div className="flex items-center gap-1 text-yellow-500 text-xl">
                          {[
                            ...Array(
                              Math.floor(
                                item?.Product?.reviewStats?.average_rating || 0
                              )
                            ),
                          ].map((_, index) => (
                            <FaStar key={`full-${index}`} />
                          ))}

                          {item?.Product?.reviewStats?.average_rating % 1 !==
                            0 && <FaStarHalfAlt />}

                          {[
                            ...Array(
                              5 -
                                Math.ceil(
                                  item?.Product?.reviewStats?.average_rating ||
                                    0
                                )
                            ),
                          ].map((_, index) => (
                            <FaRegStar key={`empty-${index}`} />
                          ))}

                          <p className="text-xs text-gray-600 ml-2">
                            ({item?.Product?.reviewStats?.total_reviews || 0})
                          </p>
                        </div>
                      </div> */}
                    </div>

                    <div className="flex gap-4 items-center m-2">
                      {item?.inStock ? (
                        <button
                          onClick={() => openVariationModal(item)}
                          className="bg-black text-white px-3 py-2 flex gap-2 items-center lg:text-base text-xs"
                        >
                          Move to Cart
                        </button>
                      ) : (
                        <p className="text-red-500 font-medium">Out of Stock</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Variation Selection Modal */}
        {selectedProduct && (
          <VariationSelectionModal
            isOpen={isVariationModalOpen}
            onClose={() => {
              setIsVariationModalOpen(false);
              setSelectedProduct(null);
            }}
            productData={selectedProduct.Product}
            onAddToCart={(selectedVariations) =>
              handleAddToCart(selectedProduct, selectedVariations)
            }
          />
        )}
      </main>
    </>
  );
};

export default Wishlist;
