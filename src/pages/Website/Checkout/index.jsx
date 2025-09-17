import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import MyAddress from "../../../components/Website/Addresses";
import {
  getActiveShipment,
  getAllShipments,
} from "../../../services/api.shipment";
import { getCart } from "../../../services/api.cart";
import { useAppContext } from "../../../context/AppContext";
import config from "../../../config/config";
import { useNavigate } from "react-router-dom";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import common_top_banner from "/assets/banners/Commen-top-banner.png";
import CheckOutAddress from "../../../components/Website/CheckOutAddress";
import OrderConfirmationModal from "../../../components/Website/OrderConfirmationModal";
import { calculateReturnChargesAndGrandTotal } from "../MyCart";
import {
  createOrder,
  initiatePayment,
  verifyPayment,
} from "../../../services/api.order";
import { getUserFromToken } from "../../../utils/auth";
import {
  getBalance,
} from "../../../services/api.walletAndCoins";

import { notifyOnFail } from "../../../utils/notification/toast";

const bannerData = [
  {
    id: 1,
    image: common_top_banner,
  },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    user,
    orderSummary,
    appliedCoupon,
    setAppliedCoupon,
    setAddress,
    setOrderSummary,
    address,
  } = useAppContext();

  const [currentStep, setCurrentStep] = useState(
    localStorage.getItem(`${config.BRAND_NAME}checkoutStep`) || "address"
  );
  const [selectedShipping, setSelectedShipping] = useState({ id: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [shipmentAddress, setShipmentAddress] = useState({ id: null });
  const [billingAddress, setBillingAddress] = useState({ id: null });
  const [showGst, setShowGst] = useState(
    orderSummary.gst_number && orderSummary.gst_number !== null ? true : false
  );
  const [gstNumber, setGstNumber] = useState(
    orderSummary.gst_number !== null ? orderSummary.gst_number : null
  );
  const [showReturnCharge, setShowReturnCharge] = useState(false);
  const [checkOut, setCheckOut] = useState({
    cartData: [],
    paymentDetails: {
      totalPrice: 0,
      // shippingCharges: 0,
      couponDiscount: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const paymentOptions = [
    {
      id: "upi",
      label: "Razorpay Secure (UPI, Cards, Netbanking)",
      is_default: true,
    },
    { id: "cash", label: "Cash on Delivery", is_default: false },
  ];
  // const [selectedPayment, setSelectedPayment] = useState(
  //   orderSummary.payment_type
  //     ? orderSummary.payment_type === "cod"
  //       ? "cash"
  //       : "upi"
  //     : paymentOptions.find((option) => option.is_default)?.id
  // );
  const [selectedPayment, setSelectedPayment] = useState("upi");

  const [walletAmount, setWalletAmount] = useState(0);
  const [coinsAmount, setCoinsAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(
    orderSummary.totalPrice
  );
  const [totalReturnCharge, setTotalReturnCharge] = useState(0);
  const [grandTotal, setGrandTotal] = useState(
    Number(orderSummary?.order_total) || 0
  );

  const [walletBalance, setWalletBalance] = useState(0);
  const [coinsBalance, setCoinsBalance] = useState(0);

  const [initialWalletBalance, setInitialWalletBalance] = useState(0);
  const [initialCoinsBalance, setInitialCoinsBalance] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");
  const [gstError, setGstError] = useState("");

  const fetchWalletAndCoinsBalance = async () => {
    try {
      const res = await getBalance(user?.id);

      if (res?.data) {
        setWalletBalance(res.data.wallet_balance);
        setInitialWalletBalance(res.data.wallet_balance);
        setCoinsBalance(res.data.coin_balance);
        setInitialCoinsBalance(res.data.coin_balance);
      }
    } catch (error) {
      console.error("Error fetching wallet and coins balance:", error);
    }
  };

  const fetchCheckOutData = async () => {
    try {
      setLoading(true);

      const params = appliedCoupon
        ? { coupon_id: appliedCoupon.coupon_id, is_checked: true }
        : { is_checked: true };
      const res = await getCart(user?.id, orderSummary.selectedItems, params);

      if (res?.data) {
        const { cartData, paymentDetails } = res.data;
        setCheckOut({ cartData, paymentDetails });
        const result = cartData.some(
          (item) => item.instant_return_checked || item.normal_return_checked
        );
        setShowReturnCharge(result);
        // In fetchCheckOutData function
        calculateReturnChargesAndGrandTotal({
          cartData,
          result,
          setTotalReturnCharge,
          setGrandTotal: (value) => setGrandTotal(Number(value) || 0),
          couponDiscount: paymentDetails.couponDiscount || 0,
        });
        // setGrandTotal(paymentDetails?.subTotal);
      }
    } catch (error) {
      console.error("Error fetching checkout data:", error);
      setError("Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const calculatedRemaining = Math.max(
      grandTotal - (walletAmount + coinsAmount * 0.25),
      0
    );
    setRemainingAmount(calculatedRemaining);
  }, [walletAmount, coinsAmount, grandTotal]);

  useEffect(() => {
    // Reset balances if order fails
    return () => {
      if (!isModalOpen) {
        setWalletBalance(initialWalletBalance);
        setCoinsBalance(initialCoinsBalance);
      }
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (user?.id) {
      fetchCheckOutData();
      fetchWalletAndCoinsBalance(); // Add this line
    } else {
      navigate(`${config.VITE_BASE_WEBSITE_URL}/`);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchCheckOutData();
    } else {
      navigate(`${config.VITE_BASE_WEBSITE_URL}/`);
    }
  }, [user?.id]);

  // useEffect(() => {
  //   fetchShipmentOptions();
  // }, []);

  useEffect(() => {
    const total = Number(grandTotal) || 0;
    let wallet = Number(walletAmount) || 0;
    let coins = Number(coinsAmount) || 0;

    // Reset coins to 0 if payment method is COD
    if (selectedPayment === "cash") {
      coins = 0;
    }

    const coinsValue = coins * 0.25; // 4 coins = ₹1

    // Ensure wallet and coins do not exceed available balances
    wallet = Math.min(wallet, walletBalance);
    coins = Math.min(coins, coinsBalance);

    // Ensure wallet + coins do not exceed grand total
    let appliedTotal = wallet + coinsValue;

    // Calculate maximum allowed wallet and coins
    const maxWallet = Math.min(walletBalance, total);
    const maxCoins = Math.min(coinsBalance, Math.floor((total - wallet) * 4));

    if (appliedTotal > total) {
      const excess = appliedTotal - total;

      // Adjust coins first since they have lower value
      if (coinsValue >= excess) {
        coins -= Math.ceil(excess / 0.25);
      } else {
        // If coins can't cover, adjust wallet
        wallet -= excess - coinsValue;
        coins = 0;
      }

      // Recalculate applied total after adjustments
      appliedTotal = wallet + coins * 0.25;
    }

    // Calculate remaining amount
    const remaining = Math.max(total - appliedTotal, 0);

    // Update states only if values have changed
    if (
      wallet !== walletAmount ||
      coins !== coinsAmount ||
      remaining !== remainingAmount
    ) {
      setWalletAmount(wallet);
      setCoinsAmount(coins);
      setRemainingAmount(remaining);
    }

    // Validate payment method based on remaining amount
    if (remaining === 0 && selectedPayment === "upi") {
      setSelectedPayment("cash"); // Switch to COD if fully covered
    }
    // else if (remaining > 0 && selectedPayment === "cash") {
    //   setSelectedPayment("upi"); // Switch to UPI if partial payment
    // }

    // Update order summary with current payment details
    setOrderSummary((prev) => ({
      ...prev,
      wallet_deduction: wallet,
      coins_deduction: coins,
      grandTotal: total,
      remainingAmount: remaining,
    }));
  }, [
    walletAmount,
    coinsAmount,
    grandTotal,
    walletBalance,
    coinsBalance,
    selectedPayment,
  ]);

  useEffect(() => {
    if (user?.id && shipmentAddress?.id && billingAddress?.id) {
      setOrderSummary({
        ...orderSummary,
        user_id: user.id,
        shipping_method_id: selectedShipping.id,
        shipping_cost: selectedShipping.price || 0,
        payment_type: selectedPayment === "cash" ? "cod" : "online",
        order_status: "placed",
        shipping_address_id: shipmentAddress.id,
        billing_address_id: billingAddress.id,
        gst_number: showGst ? gstNumber : null,
      });
    }
  }, [
    selectedPayment,
    shipmentAddress?.id,
    billingAddress?.id,
    gstNumber,
    user?.id,
  ]);

  const handleWalletAmountChange = (event) => {
    const inputValue = event.target.value;
    let value = Math.max(0, Number(inputValue));

    // Calculate maximum allowed wallet amount
    const maxAllowed = Math.min(initialWalletBalance, grandTotal);
    value = Math.min(value, maxAllowed); // Cap the value

    // Check if current wallet balance is 0
    if (walletBalance === 0) {
      setErrorMessage("Insufficient wallet balance");
      return;
    }

    // Check if input exceeds allowed and show error
    if (Number(inputValue) > maxAllowed) {
      setErrorMessage(`Maximum allowed: ₹${maxAllowed.toFixed(2)}`);
    } else {
      setErrorMessage("");
    }

    // Adjust coins if needed
    const remainingAfterWallet = grandTotal - value;
    const maxCoinsAllowed = Math.min(
      coinsBalance,
      Math.floor(remainingAfterWallet * 4)
    );

    if (coinsAmount > maxCoinsAllowed) {
      setCoinsAmount(maxCoinsAllowed);
    }

    setWalletAmount(value);
    setIsButtonDisabled(false);
  };
  const handleBlur = () => {
    const maxAllowed = Math.min(initialWalletBalance, grandTotal);
    if (walletAmount > maxAllowed) {
      setWalletAmount(maxAllowed);
      setErrorMessage(`Adjusted to maximum: ₹${maxAllowed.toFixed(2)}`);
    }
  };

  const handleCoinsAmountChange = (event) => {
    const inputValue = event.target.value;
    let value = Math.max(0, Number(inputValue));

    // Calculate maximum allowed coins
    const remainingAfterWallet = grandTotal - walletAmount;
    const maxFromRemaining = Math.floor(remainingAfterWallet * 4);
    const maxFromTotal = Math.floor(grandTotal * 0.1 * 4); // 10% of total
    const maxCoinsAllowed = Math.min(
      coinsBalance,
      maxFromRemaining,
      maxFromTotal
    );

    value = Math.min(value, maxCoinsAllowed);

    if (Number(inputValue) > maxCoinsAllowed) {
      setErrorMessage(`Maximum coins allowed: ${maxCoinsAllowed}`);
    } else {
      setErrorMessage("");
    }

    setCoinsAmount(value);
    setIsButtonDisabled(false);
  };

  const validateGST = (gstNumber) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstNumber && showGst) {
      setGstError("GST number is required when GSTIN is checked.");
      return false;
    }
    if (gstNumber && !gstRegex.test(gstNumber)) {
      setGstError("Please enter a valid GST number (e.g., 22AAAAA0000A1Z5).");
      return false;
    }
    setGstError("");
    return true;
  };

  const handlePlaceOrder = async () => {
    if (walletAmount > walletBalance)
      return notifyOnFail("Insufficient wallet balance");
    if (coinsAmount > coinsBalance)
      return notifyOnFail("Insufficient coins balance");
    if (!validateGST(gstNumber)) return;
    if (!shipmentAddress?.id)
      return notifyOnFail("Please select a shipping address.");
    if (!billingAddress?.id)
      return notifyOnFail("Please select a billing address.");

    setLoading(true);

    try {
      const user = getUserFromToken();
      let walletDeductionResponse, coinsDeductionResponse;

      // Coins redemption and deduction
      if (coinsAmount > 0) {
        // Redeem coins to wallet
        // coinsDeductionResponse = await redeemCoinsToWallet(
        //   user.id,
        //   coinsAmount
        // );
        // if (!coinsDeductionResponse?.status === 1) {
        //   throw new Error(
        //     coinsDeductionResponse?.message || "Coins redemption failed"
        //   );
        // }
        // // Deduct converted amount from wallet
        // const conversionDeduction = await deductMoneyFromWalletOrCoins({
        //   userId: user.id,
        //   amount: coinsAmount * 0.25,
        //   description: "Order Payment - Coins Conversion",
        //   amount_type: "wallet",
        // });
        // if (!conversionDeduction?.status === 1) {
        //   throw new Error(
        //     conversionDeduction?.message || "Coins conversion failed"
        //   );
        // }
      }

      const updatedOrderSummary = {
        ...orderSummary,
        wallet_deduction: walletAmount,
        coins_deduction: coinsAmount,
        grandTotal,
        payment_type: remainingAmount > 0 ? "online" : "cod",
        razorpay_amount: remainingAmount > 0 ? remainingAmount : 0,
        cod_amount: remainingAmount > 0 ? 0 : remainingAmount,
      };

      if (orderSummary.payment_type === "online") {
        const res = await handleRazorpayPayment(updatedOrderSummary);
        if (res) {
          // // Wallet deduction
          // if (walletAmount > 0) {
          //   walletDeductionResponse = await deductMoneyFromWalletOrCoins({
          //     userId: user.id,
          //     amount: walletAmount,
          //     description: "Order Payment - Wallet Deduction",
          //     amount_type: "wallet",
          //   });
          //   if (!walletDeductionResponse?.status === 1) {
          //     throw new Error(
          //       walletDeductionResponse?.message || "Wallet deduction failed"
          //     );
          //   }
          // }
        }
      } else {
        const res = await createOrder(updatedOrderSummary);
        if (res.status === 1) {
          setIsModalOpen(true);
          setWalletBalance((prev) => prev - walletAmount);
          setCoinsBalance((prev) => prev - coinsAmount);
          setAppliedCoupon(null);
          localStorage.removeItem(`${config.BRAND_NAME}appliedcoupon`);
        }
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      notifyOnFail(error.message || "Failed to place order. Please try again.");
      setWalletBalance(initialWalletBalance);
      setCoinsBalance(initialCoinsBalance);
    } finally {
      setLoading(false);
    }
  };
  const handleRazorpayPayment = async (orderData) => {
    try {
      // Validate remaining amount
      if (remainingAmount <= 0) {
        return notifyOnFail("Invalid payment amount");
      }

      // Prepare payment details
      const paymentDetails = {
        amount: remainingAmount, // Use remaining amount in rupees
        user_id: user.id,
      };

      // Initiate payment with Razorpay
      const paymentResponse = await initiatePayment(paymentDetails);

      // Check if payment initiation was successful
      if (!paymentResponse?.data?.id) {
        throw new Error("Payment initiation failed");
      }

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        // key: import.meta.env.VITE_RAZORPAY_TEST_KEY_ID,
        amount: paymentResponse.data.amount * 100, // Convert to paise
        currency: "INR",
        name: config.BRAND_NAME,
        description: "Order Payment",
        order_id: paymentResponse.data.id,
        handler: async (response) => {
          try {
            // Verify payment
            const verification = await verifyPayment(response);
            if (verification.status === 1) {
              // Create order with payment details
              const orderResponse = await createOrder({
                ...orderData,
                payment_id: response.razorpay_payment_id,
                payment_order_id: response.razorpay_order_id,
                payment_signature: response.razorpay_signature,
                grandTotal: grandTotal,
                wallet_deduction: walletAmount,
                coins_deduction: coinsAmount,
                razorpay_amount: remainingAmount,
                cod_amount: 0,
              });

              if (orderResponse.status === 1) {
                setIsModalOpen(true); // Show success modal
                // Update balances after successful payment
                setWalletBalance((prev) => prev - walletAmount);
                setCoinsBalance((prev) => prev - coinsAmount);
                return true;
              } else {
                throw new Error("Order creation failed");
              }
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Order creation failed:", error);
            notifyOnFail("Order processing failed after payment");
            // Restore balances on failure
            setWalletBalance(initialWalletBalance);
            setCoinsBalance(initialCoinsBalance);
          }
        },
        theme: { color: "#6B1F40" },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || "",
        },
      };

      // Open Razorpay payment modal
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment error:", error);
      notifyOnFail(error.message || "Payment failed. Please try again.");
      // Restore balances on failure
      setWalletBalance(initialWalletBalance);
      setCoinsBalance(initialCoinsBalance);
      return false;
    }
  };

  const OrderSummaryCard = ({
    walletAmount,
    coinsAmount,
    remainingAmount,
    selectedPayment,
    grandTotal,
  }) => {
    // ... (keep the existing JSX structure)
    if (!checkOut.cartData || checkOut.cartData.length === 0) return null;

    return (
      <div className="bg-white border p-6 w-full max-w-md">
        <h2 className="text-xl font-medium text-[black] mb-4">Order Details</h2>
        <div className="border-y py-6">
          <div className="space-y-4">
            {checkOut.cartData?.map((cartItem) => (
              <div key={cartItem.id} className="flex space-x-4">
                <div className="flex-1">
                  <h3 className="font-medium font-Lato text-base text-[black]">
                    {cartItem.name}
                  </h3>
                  {cartItem.variationData && (
                    <p className="text-sm font-Lato font-normal text-[#484848]">
                      Size: {cartItem.variationData?.size}
                    </p>
                  )}
                  <p className="text-sm font-Lato font-normal text-[#484848]">
                    Quantity: {cartItem.qty}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="mt-4 space-y-2 text-base text-[#484848] font-Lato font-medium">
            <div className="flex justify-between">
              <span>Sub Total</span>
              <span>
                ₹{(checkOut?.paymentDetails?.totalMRP).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>
                - ₹{checkOut?.paymentDetails?.discount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Selling Price</span>
              <span>
                ₹{(checkOut?.paymentDetails?.subTotal).toLocaleString()}
              </span>
            </div>
            {appliedCoupon ? (
              <div className="flex justify-between">
                <span>Coupon Discount</span>
                <span>
                  - ₹{checkOut?.paymentDetails?.couponDiscount.toLocaleString()}
                </span>
              </div>
            ) : null}
            {/* <div className="flex justify-between">
              <span>Shipping Charges</span>
              <span>
                ₹
                {checkOut?.paymentDetails?.shippingCharges > 0
                  ? checkOut?.paymentDetails?.shippingCharges.toLocaleString()
                  : "Free"}
              </span>
            </div> */}

            {showReturnCharge && (
              <div className="flex justify-between">
                <span>Return Charges</span>
                <span>₹{(totalReturnCharge || 0).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Grand Total */}
        <div className="mt-4 pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Grand Total</span>
            <span className="text-xl text-[#484848] font-Lato font-semibold">
              ₹{(grandTotal || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* New Payment Summary Section */}
        <div className="my-4">
          <h2 className="font-Lato text-xl">Payment Summary</h2>
          <p>Total Amount: ₹{(grandTotal || 0).toLocaleString()}</p>
          <p>
            Wallet Deduction: ₹{(Number(walletAmount) || 0).toLocaleString()}
          </p>
          <p>Coins Deduction: ₹{((Number(coinsAmount) || 0) / 4).toFixed(2)}</p>
          <p>
            Remaining Amount via{" "}
            {selectedPayment === "cash" ? "COD" : "Razorpay"}: ₹
            {(Number(remainingAmount) || 0).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  const calculateEstimatedDelivery = (requiredDays) => {
    const today = new Date();
    today.setDate(today.getDate() + requiredDays);
    return today.toISOString().split("T")[0];
  };

  const structureShipmentData = (shipment) => {
    return {
      id: shipment.id,
      label: shipment.method,
      price:
        shipment.cost_type === "Fixed"
          ? `$${shipment.cost}`
          : `${shipment.cost}%`,
      date: calculateEstimatedDelivery(shipment.required_day),
    };
  };

  const handleGstInput = (e) => {
    const value = e.target.value.toUpperCase();
    setGstNumber(value);
    validateGST(value);
  };

  const handleGstBlur = () => {
    validateGST(gstNumber);
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <main>
      {/* Header and Address Sections */}
      <section>
        <CommonTopBanner bannerData={bannerData} />
      </section>
      <section className="mb-9">
        <div className="text-center my-10 text-[#000000]">
          <h1 className="text-2xl lg:text-4xl font-semibold mb-2 font-Playfair">
            Checkout
          </h1>
          <p className=" text-sm lg:text-base font-Lato font-medium">
            Home / My Cart / CheckOut
          </p>
        </div>
        <div className="bg-white px-4 md:px-5 lg:px-20 flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/3 lg:w-2/3">
            <CheckOutAddress
              setShipmentAddress={setShipmentAddress}
              setBillingAddress={setBillingAddress}
            />

            <div className="mt-4">
              <label className="flex items-center gap-2 text-[black] text-base font-normal checked:">
                <input
                  type="checkbox"
                  checked={showGst}
                  onChange={() => {
                    setShowGst(!showGst);
                    setGstNumber(null);
                  }}
                  className="w-4 h-4 appearance-none border border-black  checked:bg-black checked:border-transparent"
                />
                Check if you have GSTIN
              </label>

              {showGst && (
                <div className="relative my-4">
                  <input
                    type="text"
                    name="gstNumber"
                    value={gstNumber || ""} 
                    onChange={handleGstInput} 
                    onBlur={handleGstBlur}
                    className={`peer block w-70 px-2.5 pt-4 pb-2 text-sm text-gray-900 border border-gray-300 bg-transparent focus:ring-0 focus:border-black ${
                      gstError ? "border-red-500" : ""
                    }`} 
                    placeholder="Enter GST Number"
                  />
                  <label className="absolute text-black text-sm scale-75 -translate-y-4 top-2 left-2.5 bg-white px-1 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:top-2">
                    Add your GST Number
                  </label>
                  {gstError && (
                    <p className="text-red-500 text-sm mt-1">{gstError}</p> 
                  )}
                </div>
              )}
            </div>

            {/* Payment Options UI */}
            <div className="my-8">
              <h2 className="text-lg font-Lato font-medium text-[black]">
                Payment
              </h2>
              <p className="text-sm font-Lato text-[#777777] my-4">
                All transactions are secure and encrypted
              </p>

              {paymentOptions?.map((option) => {
                const isCashDisabled =
                  option.id === "cash" && remainingAmount <= 0;
                const isUpiDisabled =
                  option.id === "upi" && remainingAmount <= 0;

                return (
                  <div
                    key={option.id}
                    className={`flex items-center gap-4 p-4 border ${
                      selectedPayment === option.id ? "bg-[#FAFDF1]" : ""
                    } ${
                      isCashDisabled || isUpiDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === option.id}
                      onChange={() => {
                        if (isCashDisabled || isUpiDisabled) return;
                        setSelectedPayment(option.id);
                      }}
                      disabled={isCashDisabled || isUpiDisabled}
                      className="text-black"
                    />
                    <span className="font-normal font-Lato text-sm text-[black]">
                      {option.label}
                    </span>
                  </div>
                );
              })}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Remaining Wallet:</span>
                  <span className="font-medium">
                    ₹{(initialWalletBalance - walletAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>Remaining Coins:</span>
                  <span className="font-medium">
                    {initialCoinsBalance - coinsAmount} (₹
                    {((initialCoinsBalance - coinsAmount) * 0.25).toFixed(2)})
                  </span>
                </div>
              </div>

              {/* <div className="flex justify-between text-sm">
  <span>Available Wallet:</span>
  <span className="font-medium">₹{initialWalletBalance?.toFixed(2)}</span>
  </div>
  <div className="flex justify-between mt-2 text-sm">
    <span>Available Coins:</span>
    <span className="font-medium">
    {initialCoinsBalance} (₹{(initialCoinsBalance * 0.25).toFixed(2)})
  </span>
  </div> */}

              {/* Conditional input for Wallet and Coins */}
              {selectedPayment === "upi" && (
                <div className="flex items-center gap-4 p-4 border">
                  <label htmlFor="wallet" className="font-medium text-black">
                    Enter Wallet Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={walletAmount === 0 ? "" : walletAmount}
                    onChange={handleWalletAmountChange}
                    onBlur={handleBlur}
                    placeholder="Enter Wallet Amount"
                    style={{
                      appearance: "textfield",
                      MozAppearance: "textfield",
                      WebkitAppearance: "none",
                      outline: "none", // Removes blue outline on focus
                      border: "1px solid #ccc", // Custom border
                      padding: "8px",
                      borderRadius: "4px", // Smooth corners
                      width: "100%", // Makes it responsive
                      maxWidth: "400px", // Limits width on larger screens
                      fontSize: "16px", // Better readability on mobile
                    }}
                  />
                </div>
              )}

              {selectedPayment === "upi" && (
                <div className="flex items-center gap-4 p-4 border">
                  <label htmlFor="coins" className="font-medium text-black">
                    Enter Coins (4 Coins = 1 Rupee)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={coinsAmount === 0 ? "" : coinsAmount}
                    onChange={handleCoinsAmountChange}
                    className="outline-none"
                    placeholder="Enter Coins Amount"
                    style={{
                      appearance: "textfield",
                      MozAppearance: "textfield",
                      WebkitAppearance: "none",
                      outline: "none", // Removes blue outline on focus
                      border: "1px solid #ccc", // Custom border
                      padding: "8px",
                      borderRadius: "4px", // Smooth corners
                      width: "100%", // Makes it responsive
                      maxWidth: "400px", // Limits width on larger screens
                      fontSize: "16px", // Better readability on mobile
                    }}
                  />
                </div>
              )}

              {selectedPayment === "cash" && (
                <div className="flex items-center gap-4 p-4 border">
                  <label htmlFor="wallet" className="font-medium text-black">
                    Enter Wallet Amount
                  </label>
                  <input
                    type="number"
                    id="wallet"
                    value={walletAmount === 0 ? "" : walletAmount}
                    onChange={handleWalletAmountChange}
                    onBlur={handleBlur}
                    className="outline-none"
                    placeholder="Enter Wallet Amount"
                    style={{
                      appearance: "textfield",
                      MozAppearance: "textfield",
                      WebkitAppearance: "none",
                      outline: "none", // Removes blue outline on focus
                      border: "1px solid #ccc", // Custom border
                      padding: "8px",
                      borderRadius: "4px", // Smooth corners
                      width: "100%", // Makes it responsive
                      maxWidth: "400px", // Limits width on larger screens
                      fontSize: "16px", // Better readability on mobile
                    }}
                  />
                </div>
              )}

              {errorMessage && (
                <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
              )}

              {/* Submit Button */}
              <div className="my-4">
                <button
                  disabled={isButtonDisabled} // Disable if there's any error or invalid amount
                  className={`bg-black w-full text-white px-4 py-2 ${
                    isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => handlePlaceOrder()}
                >
                  {loading ? "Placing Order..." : "Place Order →"}
                </button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <OrderSummaryCard
              walletAmount={walletAmount}
              coinsAmount={coinsAmount}
              remainingAmount={remainingAmount}
              selectedPayment={selectedPayment}
              grandTotal={grandTotal}
            />
          </div>
        </div>
      </section>

      {/* Modal Confirmation */}
      <OrderConfirmationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          navigate(`${config.VITE_BASE_WEBSITE_URL}/orders`);
        }}
        // amountSaved={discountedAmount}
      />
    </main>
  );
};

export default CheckoutPage;