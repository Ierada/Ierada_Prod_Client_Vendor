import React, { useState, useEffect } from "react";
import { X, Tag, ChevronRight } from "lucide-react";
import { getCouponsByUserId, applyCoupon } from "../../../services/api.coupon";
import {
  notifyOnSuccess,
  notifyOnFail,
} from "../../../utils/notification/toast";
import { useAppContext } from "../../../context/AppContext";
import config from "../../../config/config";

export const CouponModal = ({
  isOpen,
  onClose,
  totalAmount,
  fetchCartItems,
}) => {
  const {
    user,
    setAppliedCoupon,
    appliedCoupon,
    OrderSummary,
    setOrderSummary,
  } = useAppContext();
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user.id) {
      fetchCoupons();
    }
  }, [isOpen, user.id]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await getCouponsByUserId(user.id);
      if (response?.data) {
        setCoupons(response.data);

        if (appliedCoupon) {
          const selected = {
            id: appliedCoupon.coupon_id,
            coupon_name: appliedCoupon.coupon_name,
          };
          setSelectedCoupon(selected);
        } else {
          setSelectedCoupon(null);
        }
      }
    } catch (error) {
      notifyOnFail("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCouponApply = async () => {
    if (!selectedCoupon) {
      notifyOnFail("Please select a coupon");
      return;
    }

    try {
      const response = await applyCoupon({
        coupon_name: selectedCoupon.coupon_name,
        user_id: user.id,
        total_amount: totalAmount,
      });

      if (response?.data) {
        // notifyOnSuccess("Coupon applied successfully");

        fetchCartItems(response.data.coupon_id);

        // Update applied coupon
        setAppliedCoupon(response.data);
        localStorage.setItem(
          `${config.BRAND_NAME}appliedcoupon`,
          JSON.stringify(response.data)
        );

        // Update order summary
        setOrderSummary((prev) => ({
          ...prev,
          couponDiscount:
            response.data.rate_type === "fixed"
              ? response.data.discount_amount
              : (response.data.discount_amount / 100) * totalAmount,
        }));
        localStorage.setItem(
          `${config.BRAND_NAME}orderSummary`,
          JSON.stringify({
            ...OrderSummary,
            couponDiscount:
              response.data.rate_type === "fixed"
                ? response.data.discount_amount
                : (response.data.discount_amount / 100) * totalAmount,
          })
        );
        onClose();
      }
    } catch (error) {
      notifyOnFail("Failed to apply coupon");
    }
  };

  const handleCouponRemove = async () => {
    setSelectedCoupon(null);

    // Update applied coupon
    setAppliedCoupon(null);
    localStorage.removeItem(`${config.BRAND_NAME}appliedcoupon`);

    // Update order summary
    setOrderSummary((prev) => ({
      ...prev,
      couponDiscount: 0,
    }));
    localStorage.setItem(
      `${config.BRAND_NAME}orderSummary`,
      JSON.stringify({
        ...OrderSummary,
        couponDiscount: 0,
      })
    );
    await fetchCartItems(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[black] bg-opacity-50">
      <div className="bg-white rounded-lg w-96 max-h-[600px] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Tag className="mr-2" /> Available Coupons
        </h2>

        {loading ? (
          <div className="text-center py-4">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No coupons available
          </div>
        ) : (
          <div className="space-y-4">
            {coupons?.map((coupon) => (
              <div
                key={coupon.id}
                onClick={() => setSelectedCoupon(coupon)}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all
                  ${
                    selectedCoupon?.id === coupon.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{coupon.coupon_name}</h3>
                    <p className="text-sm text-gray-500">
                      Up to{" "}
                      {coupon.rate_type === "percentage"
                        ? `${coupon.discount_value}% OFF`
                        : `₹${coupon.discount_value} OFF`}
                    </p>
                  </div>
                  {selectedCoupon?.id === coupon.id && (
                    <button
                      onClick={handleCouponRemove}
                      className="text-pink-500"
                    >
                      <X />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleCouponApply}
          disabled={!selectedCoupon || loading}
          className={`
            w-full mt-6 py-3 rounded-lg transition-colors
            ${
              selectedCoupon
                ? "bg-black text-white hover:bg-pink-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          Apply Coupon
        </button>
      </div>
    </div>
  );
};
