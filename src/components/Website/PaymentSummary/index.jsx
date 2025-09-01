import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { CouponModal } from "../CouponModal";
import { useAppContext } from "../../../context/AppContext";
import { useNavigate } from "react-router";
import icon from "/assets/icons/percentageicon.png";
import { MdDiscount } from "react-icons/md";

export const PaymentSummary = ({
  calculateTotals,
  handleCheckoutSummary,
  isAnyItemChecked,
  offers,
  showReturnCharge,
  totalReturnCharge,
  fetchCartItems,
}) => {
  const navigate = useNavigate();
  const { appliedCoupon, setAppliedCoupon } = useAppContext();
  const [couponModalOpen, setCouponModalOpen] = useState(false);

  return (
    <>
      <div className="lg:col-span-1 font-Lato">
        <div className=" border p-6 sticky top-20">
          <h3 className="text-xl font-medium text-[black] mb-4">
            Price Details
          </h3>
          <div className="space-y-3 border-y py-4">
            <div className="flex justify-between text-[#484848]">
              <span>Sub Total</span>
              <span className="font-medium">
                ₹{calculateTotals()?.totalMRP?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-[#484848]">
              <span>Discount</span>
              <span className="font-medium">
                - ₹{calculateTotals()?.Discount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-[#484848]">
              <span>Selling Price</span>
              <span className="font-medium">
                ₹{calculateTotals()?.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-[#484848]">
              <span>Coupon Discount</span>
              <span className="font-medium">
                - ₹{calculateTotals()?.couponDiscount?.toFixed(2)}
              </span>
            </div>
            {showReturnCharge && (
              <div className=" text-base text-[#484848] font-Lato font-medium flex justify-between">
                <span className="">Return Charges:</span>
                <span> ₹{totalReturnCharge.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className=" pt-4 text-[#484848]">
            <div className="flex justify-between">
              <span className="font-medium">Grand Total</span>
              <span className="font-semibold text-xl">
                ₹{calculateTotals().total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-[#484848]">
            <div className="relative flex items-center mr-2">
              <MdDiscount />
              <h3 className="ml-2">
                {" "}
                {appliedCoupon
                  ? `Coupon Applied: ${appliedCoupon.coupon_name}`
                  : "Apply Coupon"}
              </h3>
            </div>
            <button
              onClick={() => setCouponModalOpen(true)}
              className={`border text-black px-6 py-1 border-black font-medium text-base ml-auto ${
                appliedCoupon ? "bg-yellow-200" : ""
              }`}
            >
              {appliedCoupon ? "Edit" : "Apply"}
            </button>
          </div>

          <div className="border-dashed border border-black p-3 mt-6 text-[#484848] bg-gray-300">
            <h4 className="font-medium mb-1 text-[#484848] text-xs">
              OFFERS FOR YOU
            </h4>
            {offers?.map((off) => {
              return (
                <p className="flex items-center text-red-500 text-xs lg:text-sm font-normal">
                  <span className="mr-2">
                    <img src={icon} alt="Offer Icon" className="" />
                  </span>{" "}
                  {off}
                </p>
              );
            })}
          </div>

          <button
            onClick={() => handleCheckoutSummary()}
            className={`w-full py-4 mt-6 transition-colors ${
              isAnyItemChecked
                ? "bg-black text-white hover:bg-black"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            disabled={!isAnyItemChecked}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>

      <CouponModal
        isOpen={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        totalAmount={calculateTotals().subtotal}
        fetchCartItems={fetchCartItems}
      />
    </>
  );
};
