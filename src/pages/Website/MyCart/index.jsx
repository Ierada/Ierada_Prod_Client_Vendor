import React, { useState, useEffect } from "react";
import { Minus, Plus, ArrowLeft } from "lucide-react";
import { PaymentSummary } from "../../../components/Website/PaymentSummary";
import ProductSlider from "../../../components/Website/ProductSlider";
import {
  getCart,
  updateCartQuantity,
  deleteFromCart,
  updateInstantReturnChecked,
  updateCartItemChecked,
} from "../../../services/api.cart";
import { notifyOnFail } from "../../../utils/notification/toast";
import { useNavigate } from "react-router";
import config from "../../../config/config";
import EmptyImg from "/assets/skeleton/empty-cart.svg";
import cart_banner from "/assets/banners/banner-cart.png";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import { CiDeliveryTruck } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import { useAppContext } from "../../../context/AppContext";
import MyCartSkeleton from "../../../utils/loaders/MyCartSkeleton";
import { addToWishlist } from "../../../services/api.wishlist";

const ConfirmationModal = ({
  onClose,
  cartItem,
  handleAddToWishlist,
  removeItem,
}) => {
  const handleButtonResponse = (response) => {
    if (response === "moveToWishlist") {
      handleAddToWishlist(cartItem.productId);
    }
    removeItem(cartItem.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-down">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Confirm Removal
        </h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to remove this product from your cart?
        </p>
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
          <button
            onClick={() => handleButtonResponse("moveToWishlist")}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-medium"
          >
            Move to Wishlist
          </button>
          <button
            onClick={() => handleButtonResponse("confirm")}
            className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export const calculateReturnChargesAndGrandTotal = ({
  cartData,
  result,
  setTotalReturnCharge,
  setGrandTotal,
  couponDiscount,
}) => {
  const totalReturnCharge = cartData.reduce((total, item) => {
    const instantCharge = Number(item.instant_return_charge) || 0;
    const normalCharge = Number(item.normal_return_charge) || 0;
    return (
      total +
      (item.instant_return_checked
        ? instantCharge
        : item.normal_return_checked
        ? normalCharge
        : 0)
    );
  }, 0);

  const aggregated = cartData.reduce(
    (acc, item) => ({
      subtotal: acc.subtotal + (Number(item.paymentDetails?.subTotal) || 0),
      discount: acc.discount + (Number(item.paymentDetails?.discount) || 0),
    }),
    { subtotal: 0, discount: 0 }
  );

  const baseTotal = aggregated.subtotal;
  const finalGrandTotal = result
    ? baseTotal + totalReturnCharge - couponDiscount
    : baseTotal - couponDiscount;

  setTotalReturnCharge?.(Number(totalReturnCharge) || 0);
  setGrandTotal?.(Number(finalGrandTotal) || 0);
};

const renderVariationDetails = (variationData) => {
  if (!variationData) return null;

  return (
    <div className="space-y-1 mt-2 text-sm text-gray-700">
      {variationData.Size && (
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium">Size:</span>
          <span>{variationData.Size?.name}</span>
        </div>
      )}
      {variationData.Color && (
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium">Color:</span>
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{
              backgroundColor: variationData.Color?.code,
              borderColor:
                variationData.Color?.code === "#FFFFFF"
                  ? "#E0E0E0"
                  : "transparent",
            }}
          />
          <span>{variationData.Color?.name}</span>
        </div>
      )}
    </div>
  );
};

const CartPage = () => {
  const { user, setOrderSummary, setTriggerHeaderCounts, appliedCoupon } =
    useAppContext();
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);
  const [offerData, setOfferData] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState({
    totalMRP: 0,
    subTotal: 0,
    discount: 0,
    couponDiscount: 0,
  });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReturnCharge, setShowReturnCharge] = useState(false);
  const [totalReturnCharge, setTotalReturnCharge] = useState(0);
  const [selectedCartItem, setSelectedCartItem] = useState({});
  const [isRemoveProductModalOpen, setIsRemoveProductModalOpen] =
    useState(false);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      navigate(`${config.VITE_BASE_WEBSITE_URL}/`);
    }
  }, [user]);

  const fetchCartItems = async (coupon_id) => {
    try {
      setIsLoading(true);

      const params = coupon_id
        ? { coupon_id }
        : coupon_id === 0
        ? {}
        : appliedCoupon
        ? { coupon_id: appliedCoupon.coupon_id }
        : {};
      const response = await getCart(user?.id, [], params);

      if (response.status === 1) {
        const cartData = response.data;
        setCartData(cartData.cartData);
        setOfferData(cartData.offers);
        setPaymentDetails(cartData.paymentDetails);
        setRelatedProducts(cartData.relatedProducts);
        if (cartData.appliedCoupon) {
          localStorage.setItem(
            `${config.BRAND_NAME}appliedcoupon`,
            JSON.stringify(cartData.appliedCoupon)
          );
        } else {
          localStorage.removeItem(`${config.BRAND_NAME}appliedcoupon`);
        }
      } else {
        notifyOnFail("Failed to fetch cart items");
      }
    } catch (error) {
      notifyOnFail("Failed to fetch cart items");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const returnChargesAndGrandTotal = () => {
      const result = cartData.some(
        (item) => item.instant_return_checked || item.normal_return_checked
      );
      const newCartData = cartData.filter((item) => item.isChecked);
      setShowReturnCharge(result);
      if (result) {
        calculateReturnChargesAndGrandTotal({
          cartData: newCartData,
          result,
          setTotalReturnCharge,
          couponDiscount: paymentDetails.couponDiscount || 0,
        });
      }
    };

    returnChargesAndGrandTotal();
  }, [cartData]);

  const updateQuantity = async (itemId, newQuantity) => {
    const updatedCartItems = cartData.map((item) =>
      item.id === itemId ? { ...item, qty: newQuantity } : item
    );
    setCartData(updatedCartItems);

    try {
      const updateData = {
        cart_id: itemId,
        qty: newQuantity,
      };

      const success = await updateCartQuantity(user?.id, updateData);

      if (!success) {
        notifyOnFail("Failed to update quantity.");
        fetchCartItems();
      } else {
        fetchCartItems();
      }
    } catch (error) {
      notifyOnFail("An error occurred while updating quantity.");
      fetchCartItems();
      console.error(error);
    }
  };

  const removeItem = async (itemId) => {
    const updatedCartItems = cartData.filter((item) => item.id !== itemId);
    setCartData(updatedCartItems);
    setIsRemoveProductModalOpen(false);

    try {
      const deleteData = { cart_id: itemId };
      const response = await deleteFromCart(user?.id, deleteData);

      if (response.status === 1) {
        setTriggerHeaderCounts((prev) => !prev);
        fetchCartItems();
      } else {
        notifyOnFail("Failed to remove product from cart.");
        fetchCartItems();
      }
    } catch (error) {
      notifyOnFail("An error occurred while removing product.");
      fetchCartItems();
      console.error(error);
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      await addToWishlist(user.id, productId);
    } catch (error) {
      notifyOnFail("Failed to add to wishlist.");
      console.error(error);
    }
  };

  const handleCheckboxChange = async (e, itemId) => {
    setIsLoading(true);
    const res = await updateCartItemChecked(itemId, e.target.checked);
    if (res) {
      fetchCartItems();
    } else {
      notifyOnFail("Failed to update item selection.");
      fetchCartItems();
    }
    setIsLoading(false);
  };

  const handleReturnOptionChange = async (cart_item_id, type, value) => {
    setIsLoading(true);
    const res = await updateInstantReturnChecked(cart_item_id, type, value);
    if (res) {
      fetchCartItems();
    } else {
      notifyOnFail("Failed to update return option.");
      fetchCartItems();
    }
    setIsLoading(false);
    return res;
  };

  const calculateTotals = () => {
    const filteredCart = cartData?.filter((item) => item.isChecked);

    const totalMRP = paymentDetails?.totalMRP || 0;

    const subtotal = paymentDetails?.subTotal || 0;

    const totalDiscount = paymentDetails?.discount || 0;

    const couponDiscount = paymentDetails?.couponDiscount || 0;

    if (filteredCart.length === 0) {
      return {
        totalMRP: 0,
        subtotal: 0,
        Discount: 0,
        total: 0,
        couponDiscount: 0,
      };
    }

    const currentTotalReturnCharge = filteredCart.reduce((total, item) => {
      const instantCharge = Number(item.instant_return_charge) || 0;
      const normalCharge = Number(item.normal_return_charge) || 0;
      return (
        total +
        (item.instant_return_checked
          ? instantCharge
          : item.normal_return_checked
          ? normalCharge
          : 0)
      );
    }, 0);

    const totalBeforeCoupon = subtotal + currentTotalReturnCharge;
    const finalTotal = totalBeforeCoupon - couponDiscount;

    return {
      totalMRP: totalMRP,
      subtotal: subtotal,
      Discount: totalDiscount,
      total: finalTotal,
      couponDiscount,
    };
  };

  const handleCheckoutSummary = () => {
    const totals = calculateTotals();

    const selectedItems = cartData
      .filter((item) => item.isChecked)
      .map((item) => item.id);

    if (selectedItems.length === 0) {
      notifyOnFail("Please select at least one item to checkout.");
      return;
    }

    setOrderSummary({
      selectedItems,
      order_total: totals.total,
      discount_amount: totals.Discount,
      couponDiscount: totals.couponDiscount,
      coupon_id: appliedCoupon ? appliedCoupon.coupon_id : null,
    });

    navigate(`${config.VITE_BASE_WEBSITE_URL}/checkout`);
  };

  const bannerData = [{ id: 1, image: cart_banner }];
  const isAnyItemChecked = cartData?.some((item) => item.isChecked);

  return (
    <main className="bg-white min-h-screen">
      {/* <section>
        <CommonTopBanner />
      </section> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        <section className="mt-8 font-Lato text-gray-900">
          <div className="text-center my-8 sm:my-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-Playfair text-gray-900">
              My Cart
            </h1>
            <p className="text-sm sm:text-base font-Lato font-medium mt-2 text-gray-600">
              Home / My Cart
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(3)].map((_, index) => (
                  <MyCartSkeleton key={index} />
                ))}
              </div>
              <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-64 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded mt-8"></div>
              </div>
            </div>
          ) : cartData?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <img
                className="mb-6 w-48 sm:w-64"
                src={EmptyImg}
                alt="Empty Cart"
              />
              <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">
                YOUR CART IS EMPTY
              </h1>
              <p className="text-gray-600 mb-8 max-w-md">
                There's nothing in your cart. <br /> Add something you love to
                buy.
              </p>
              <button
                className="bg-black text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors text-lg"
                onClick={() =>
                  navigate(`${config.VITE_BASE_WEBSITE_URL}/collection/all`)
                }
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {cartData?.map((item) => {
                  const stockToCheck = item.variations?.size
                    ? item.variations.size.qty
                    : item.stock;
                  const isOutOfStock = stockToCheck === 0;
                  const isLowStock = stockToCheck > 0 && stockToCheck <= 5;

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row gap-6 p-5 transition-all duration-200 ${
                        isOutOfStock
                          ? "opacity-60 cursor-not-allowed grayscale"
                          : ""
                      }`}
                    >
                      <div className="w-full sm:w-36 h-40 flex-shrink-0 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain rounded-md border border-gray-200"
                        />
                        <input
                          type="checkbox"
                          className="absolute top-3 left-3 w-4 h-4 cursor-pointer
                            appearance-none border-2 border-gray-300 rounded-sm
                            checked:bg-black checked:border-transparent
                            focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
                          checked={item.isChecked}
                          onChange={(e) => handleCheckboxChange(e, item.id)}
                          disabled={isOutOfStock}
                          aria-label={`Select ${item.name}`}
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item?.name}
                          </h3>
                          <div className="text-xl font-bold text-gray-900 mt-2 sm:mt-0">
                            ₹ {(item.price * item.qty).toLocaleString()}
                          </div>
                        </div>

                        {renderVariationDetails(item?.variationData)}

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4">
                          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden mb-4 sm:mb-0">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.max(1, item.qty - 1)
                                )
                              }
                              className={`p-2 transition-colors duration-200
                                ${
                                  isOutOfStock || item.qty <= 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white hover:bg-gray-100 text-gray-700"
                                }`}
                              disabled={item.qty <= 1 || isOutOfStock}
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <Minus size={18} />
                            </button>
                            <span className="px-4 text-lg font-medium text-gray-800">
                              {item.qty}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.qty + 1)
                              }
                              className={`p-2 transition-colors duration-200
                                ${
                                  isOutOfStock || item.qty >= stockToCheck
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white hover:bg-gray-100 text-gray-700"
                                }`}
                              disabled={
                                item.qty >= stockToCheck || isOutOfStock
                              }
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <Plus size={18} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* <button
                              className="text-gray-500 hover:text-pink-600 transition-colors"
                              aria-label={`Move ${item.name} to wishlist`}
                            >
                              <FaRegHeart size={22} />
                            </button> */}
                            <button
                              onClick={() => {
                                setSelectedCartItem(item);
                                setIsRemoveProductModalOpen(true);
                              }}
                              className={`text-gray-500 hover:text-red-600 transition-colors ${
                                isOutOfStock
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }`}
                              disabled={isOutOfStock}
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <MdDeleteForever size={24} />
                            </button>
                          </div>
                        </div>

                        {isOutOfStock ? (
                          <div className="mt-3 text-base font-semibold text-red-600">
                            Out of Stock
                          </div>
                        ) : (
                          isLowStock && (
                            <div className="mt-3 text-base font-medium text-orange-500">
                              Hurry! Only {stockToCheck} left in stock.
                            </div>
                          )
                        )}

                        {(item.is_instant_return || item.is_normal_return) && (
                          <div className="flex flex-col mt-4 pt-4 border-t border-gray-200">
                            <p className="font-semibold text-gray-800 mb-2">
                              Return Options:
                            </p>
                            {item.is_instant_return && item.is_normal_return ? (
                              <div className="space-y-2">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`return_option_${item.id}`}
                                    value="instant"
                                    checked={item.instant_return_checked}
                                    onChange={() => {
                                      if (!item.isChecked) return;
                                      handleReturnOptionChange(
                                        item.id,
                                        "instant",
                                        true
                                      );
                                    }}
                                    disabled={!item.isChecked || isOutOfStock}
                                    className={`mr-2 h-4 w-4 text-black border-gray-300 rounded-full focus:ring-black
                                      ${
                                        !item.isChecked || isOutOfStock
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }`}
                                  />
                                  <span className="text-sm text-gray-800">
                                    Instant Return{" "}
                                    <span
                                      className="ml-1 text-gray-500 text-xs cursor-help"
                                      title={`Extra charge of ₹${item.instant_return_charge} will be applied on instant return.`}
                                    >
                                      (₹
                                      {Number(
                                        item.instant_return_charge
                                      ).toLocaleString()}
                                      ) ⓘ
                                    </span>
                                  </span>
                                </label>

                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`return_option_${item.id}`}
                                    value="normal"
                                    checked={item.normal_return_checked}
                                    onChange={() => {
                                      if (!item.isChecked) return;
                                      handleReturnOptionChange(
                                        item.id,
                                        "normal",
                                        true
                                      );
                                    }}
                                    disabled={!item.isChecked || isOutOfStock}
                                    className={`mr-2 h-4 w-4 text-black border-gray-300 rounded-full focus:ring-black
                                      ${
                                        !item.isChecked || isOutOfStock
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }`}
                                  />
                                  <span className="text-sm text-gray-800">
                                    Normal Return{" "}
                                    <span
                                      className="ml-1 text-gray-500 text-xs cursor-help"
                                      title={`Extra charge of ₹${item.normal_return_charge} will be applied on normal return.`}
                                    >
                                      (₹
                                      {Number(
                                        item.normal_return_charge
                                      ).toLocaleString()}
                                      ) ⓘ
                                    </span>
                                  </span>
                                </label>
                              </div>
                            ) : (
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    item.is_instant_return
                                      ? item.instant_return_checked
                                      : item.normal_return_checked
                                  }
                                  onChange={(e) => {
                                    if (!item.isChecked) return;
                                    const isChecked = e.target.checked;
                                    handleReturnOptionChange(
                                      item.id,
                                      item.is_instant_return
                                        ? "instant"
                                        : "normal",
                                      isChecked
                                    );
                                  }}
                                  disabled={!item.isChecked || isOutOfStock}
                                  className={`mr-2 h-4 w-4 text-black border-gray-300 rounded focus:ring-black
                                    ${
                                      !item.isChecked || isOutOfStock
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                />
                                <span className="text-sm text-gray-800">
                                  {item.is_instant_return
                                    ? "Instant Return"
                                    : "Normal Return"}{" "}
                                  <span
                                    className="ml-1 text-gray-500 text-xs cursor-help"
                                    title={`Extra charge of ₹${
                                      item.is_instant_return
                                        ? item.instant_return_charge
                                        : item.normal_return_charge
                                    } will be applied.`}
                                  >
                                    (₹
                                    {Number(
                                      item.is_instant_return
                                        ? item.instant_return_charge
                                        : item.normal_return_charge
                                    ).toLocaleString()}
                                    ) ⓘ
                                  </span>
                                </span>
                              </label>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-700">
                          <CiDeliveryTruck
                            size={20}
                            className="text-gray-500"
                          />
                          <span>
                            Estimated Delivery:{" "}
                            <span className="font-medium">
                              {item.deliveryDate}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <PaymentSummary
                calculateTotals={calculateTotals}
                handleCheckoutSummary={handleCheckoutSummary}
                isAnyItemChecked={isAnyItemChecked}
                offers={offerData}
                showReturnCharge={showReturnCharge}
                totalReturnCharge={totalReturnCharge}
                fetchCartItems={fetchCartItems}
              />
            </div>
          )}

          {cartData?.length > 0 && (
            <button
              onClick={() =>
                navigate(`${config.VITE_BASE_WEBSITE_URL}/collection/all`)
              }
              className="mt-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium text-lg"
            >
              <ArrowLeft size={20} />
              Continue shopping
            </button>
          )}
        </section>

        {relatedProducts?.length > 0 && (
          <section className="mt-16">
            <div className="space-y-8">
              <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 font-Italiana text-center">
                You may also like
              </h2>
              <ProductSlider products={relatedProducts} />
            </div>
          </section>
        )}

        {isRemoveProductModalOpen && (
          <ConfirmationModal
            onClose={() => setIsRemoveProductModalOpen(false)}
            cartItem={selectedCartItem}
            handleAddToWishlist={handleAddToWishlist}
            removeItem={removeItem}
          />
        )}
      </div>
    </main>
  );
};

export default CartPage;
