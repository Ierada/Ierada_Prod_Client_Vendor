import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import { editCoupon } from "../../../services/api.coupon";
import { MdToggleOn, MdToggleOff } from "react-icons/md";

const EditCouponModal = ({ isOpen, onClose, mode, coupon }) => {
  const [formData, setFormData] = useState({
    coupon_name: "",
    type: "all",
    items: [],
    selected_items: [],
    rate_type: "fixed",
    discount_value: "",
    min_purchase_amount: "",
    max_discount_amount: "",

    max_usage_per_user: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    status: "active",
  });

  // Initialize form data when the coupon changes
  useEffect(() => {
    if (coupon && mode !== "add") {
      setFormData({
        coupon_name: coupon.coupon_name || "",
        type: coupon.type || "all",
        rate_type: coupon.rate_type || "fixed",
        discount_value: coupon.discount_value || "",
        min_purchase_amount: coupon.min_purchase_amount || "",
        max_discount_amount: coupon.max_discount_amount || "",

        start_date: coupon.start_date || "",
        start_time: coupon.start_time || "",
        end_date: coupon.end_date || "",
        end_time: coupon.end_time || "",
      });
    }
  }, [coupon, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      // Clear selected_items if type is set to "all"
      if (name === "type") {
        updatedData.selected_items =
          value === "all" ? [] : prevData.selected_items;
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "edit") {
        await editCoupon(coupon.id, formData);
        onClose();
      }
    } catch (error) {
      console.error("Failed to update coupon:", error.message);
    }
  };

  if (!isOpen) return null;
  const handleToggle = () => {
    setFormData({ ...formData, status: !formData.status });
  };

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[80vh]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl text-[#333843] font-semibold mb-6">
          {mode === "view"
            ? "View Coupon"
            : mode === "edit"
            ? "Edit Coupon"
            : "Add Coupon"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coupon Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[black] mb-2">
                Coupon Name
              </label>
              {mode === "view" ? (
                <p>{formData.coupon_name}</p>
              ) : (
                <input
                  type="text"
                  name="coupon_name"
                  value={formData.coupon_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border  border-[#D2D2D2] rounded-lg text-[#777777]  placeholder:text-sm placeholder:text-[#777777]"
                  required
                />
              )}
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[black] mb-2">
                Type
              </label>
              {mode === "view" ? (
                <p>{formData.type}</p>
              ) : (
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-[#D2D2D2] rounded-lg text-[#777777]  placeholder:text-sm placeholder:text-[#777777]"
                >
                  <option value="all">All</option>
                  <option value="product">Product</option>
                  <option value="category">Category</option>
                  <option value="subcategory">Subcategory</option>
                </select>
              )}
            </div>

            {/* Rate type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[black] mb-2">
                Rate Type
              </label>
              {mode === "view" ? (
                <p>{formData.rate_type}</p>
              ) : (
                <select
                  name="rate_type"
                  value={formData.rate_type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-[#D2D2D2] rounded-lg text-[#777777]  placeholder:text-sm placeholder:text-[#777777]"
                >
                  <option value="fixed">Fixed</option>
                  <option value="percentage">Percentage</option>
                </select>
              )}
            </div>

            {/* Discount Value */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[black] mb-2">
                Discount Value
              </label>
              {mode === "view" ? (
                <p>{formData.discount_value}</p>
              ) : (
                <input
                  type="number"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-[#D2D2D2] rounded-lg text-[#777777]  placeholder:text-sm placeholder:text-[#777777]"
                  required
                />
              )}
            </div>

            {/* Min Purchase Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[black] mb-2">
                Min Purchase Amount
              </label>
              {mode === "view" ? (
                <p>{formData.min_purchase_amount}</p>
              ) : (
                <input
                  type="number"
                  name="min_purchase_amount"
                  value={formData.min_purchase_amount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-[#D2D2D2] rounded-lg text-[#777777]  placeholder:text-sm placeholder:text-[#777777]"
                />
              )}
            </div>

            {/* Max Discount Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[black]  mb-2">
                Max Discount Amount
              </label>
              {mode === "view" ? (
                <p>{formData.max_discount_amount}</p>
              ) : (
                <input
                  type="number"
                  name="max_discount_amount"
                  value={formData.max_discount_amount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-[#D2D2D2] rounded-lg text-[#777777]  placeholder:text-sm placeholder:text-[#777777]"
                />
              )}
            </div>

            {/* Start Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[black] mb-2">
                Start Date
              </label>
              {mode === "view" ? (
                <p>{formData.start_date}</p>
              ) : (
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-[#D2D2D2] rounded-lg text-[#777777]  placeholder:text-sm placeholder:text-[#777777]"
                  required
                />
              )}
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-[black] text-sm font-medium mb-2">
                Start Time
              </label>
              {mode === "view" ? (
                <p>{formData.start_time}</p>
              ) : (
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="w-full p-2.5  text-sm  border border-[#D2D2D2] rounded-lg  placeholder:text-sm text-[#777777]"
                />
              )}
            </div>

            {/* End Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[black] mb-2">
                End Date
              </label>
              {mode === "view" ? (
                <p>{formData.end_date}</p>
              ) : (
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-[#D2D2D2] rounded-lg text-[#777777]  placeholder:text-sm placeholder:text-[#777777]"
                  required
                />
              )}
            </div>

            {/* End Time */}
            <div>
              <label className="block text-[black] text-sm font-medium mb-2">
                End Time
              </label>
              {mode === "view" ? (
                <p>{formData.end_time}</p>
              ) : (
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border-[#D2D2D2] rounded-lg  text-sm  placeholder:text-sm text-[#777777]"
                />
              )}
            </div>

            {/* Coupon Status */}
            {/* <div
              className={`flex items-center justify-between md:mt-7 px-2 rounded-lg mb-2 ${
                mode === "view"
                  ? "md:-mt-1"
                  : "border border-[#D2D2D2] bg-white"
              }`}
            >
              <label className="text-sm text-[black] font-medium">
                Coupon Status
              </label>
              {mode === "view" ? (
                <p>{formData.status ? "Active" : "Inactive"}</p>
              ) : (
                <button
                  type="button"
                  onClick={handleToggle}
                  className="text-2xl"
                  aria-label="Toggle Status"
                >
                  {formData.status ? (
                    <MdToggleOn className="text-[#F47954]" size={50} />
                  ) : (
                    <MdToggleOff className="text-gray-500" size={50} />
                  )}
                </button>
              )}
            </div> */}
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            {mode !== "view" && (
              <button
                type="submit"
                className="px-4 py-2 bg-[#F47954] text-white rounded-md hover:bg-gray-800"
              >
                Update Coupon
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

EditCouponModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["view", "edit"]).isRequired,
  coupon: PropTypes.object,
};

export default EditCouponModal;
