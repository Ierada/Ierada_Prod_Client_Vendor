import React, { useState, useEffect } from "react";
import { useToast } from "../../../context/ToastProvider";
import {
  generateCoupon,
  getItemsForCoupon,
} from "../../../services/api.coupon";
import { useNavigate } from "react-router";
import config from "../../../config/config";

const AddCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    coupon_name: "",
    type: "all",
    rate_type: "fixed",
    items: [],
    selected_items: [],
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

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.coupon_name)
      newErrors.coupon_name = "Coupon name is required";
    if (!formData.rate_type) newErrors.rate_type = "Discount type is required";
    if (!formData.discount_value || formData.discount_value <= 0)
      newErrors.discount_value = "Discount value must be greater than 0";

    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";
    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.start_date) > new Date(formData.end_date)
    ) {
      newErrors.date = "Start date cannot be later than end date";
    }
    if (!formData.min_purchase_amount || formData.min_purchase_amount <= 0) {
      newErrors.min_purchase_amount =
        "Min purchase amount must be greater than 0";
    }
    if (!formData.max_discount_amount || formData.max_discount_amount <= 0)
      newErrors.max_discount_amount =
        "Max discount amount must be greater than 0";
    if (!formData.max_usage_per_user || formData.max_usage_per_user <= 0)
      newErrors.max_usage_per_user =
        "Max usage per user must be greater than 0";

    if (formData.type !== "all" && !formData.selected_items.length)
      newErrors.selected_items = "Please select at least one item";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      const res = await getItemsForCoupon(value);
      if (!res) return;
      setFormData((prevData) => ({
        ...prevData,
        type: value,
        items: res.data,
        selected_items: [],
      }));
    } else if (name === "items") {
      const selectedItem = formData.items.find(
        (item) => item.name === value || item.title === value
      );
      if (
        selectedItem &&
        !formData.selected_items.some((item) => item.id === selectedItem.id)
      ) {
        setFormData((prevData) => ({
          ...prevData,
          selected_items: [...prevData.selected_items, selectedItem],
        }));
      }
    } else if (name === "discount_value") {
      const numericValue = parseFloat(value);
      if (formData.rate_type === "percentage" && numericValue > 100) return;
      setFormData((prevData) => ({
        ...prevData,
        discount_value: value,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const removeItem = (index) => {
    const updatedItems = [...formData.selected_items];
    updatedItems.splice(index, 1);
    setFormData((prevData) => ({
      ...prevData,
      selected_items: updatedItems,
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   console.log("Submitting formData:", formData);

  //   const newError = validateForm();

  //   if (Object.keys(newError).length > 0) {
  //     setErrors(newError);
  //     return;
  //   }

  //   try {
  //     const response = await generateCoupon(formData);
  //     if (response.status === 1) {
  //       setFormData({
  //         coupon_name: "",
  //         type: "",
  //         selected_items: [],
  //         discount_value: "",
  //         max_discount_amount: "",
  //         max_usage_per_user: "",
  //         start_date: "",
  //         end_date: "",
  //         start_time: "",
  //         end_time: "",
  //       });
  //       // Show a success message if needed
  //     }
  //   } catch (err) {
  //     console.error("Error submitting form:", err);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    const response = await generateCoupon(formData);
    response && setCoupons((prevCoupons) => [...prevCoupons, response.data]);

    setFormData({
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
      end_date: "",
      start_time: "",
      end_time: "",
      status: "active",
    });

    setLoading(false);

    navigate(`${config.VITE_BASE_ADMIN_URL}/coupons/list`);
  };

  return (
    <div className="flex flex-col  p-6  min-h-screen">
      <div className=" max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">
          Create New Coupons
        </h1>
        <div className="flex flex-col md:flex-row gap-8">
          <form onSubmit={handleSubmit} className="w-full p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Row 1 */}
              <div className="col-span-2">
                <label className="block text-sm font-medium">Coupon Name</label>
                <input
                  type="text"
                  name="coupon_name"
                  placeholder="Please enter coupon name"
                  value={formData.coupon_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded placeholder:text-sm placeholder:text-gray-400 placeholder-opacity-75"
                />
                {errors.coupon_name && (
                  <span className="text-red-500 text-sm">
                    {errors.coupon_name}
                  </span>
                )}
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                <div>
                  <label className="block text-sm font-medium">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="all">All</option>
                    <option value="product">Product</option>
                    <option value="category">Category</option>
                    <option value="subcategory">Subcategory</option>
                    <option value="innersubcategory">InnerSubCategory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Items</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData?.selected_items?.map((item, index) => (
                      <span
                        key={item.id}
                        className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center"
                      >
                        {item.name || item.title}
                        <button
                          onClick={() => removeItem(index)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    name="items"
                    id=""
                    value={""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Items</option>
                    {formData.items?.map((item, index) => (
                      <option key={index} value={item.name || item.title}>
                        {item.name || item.title}
                      </option>
                    ))}
                  </select>
                  {errors.selected_items && (
                    <span className="text-red-500 text-sm">
                      {errors.selected_items}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Discount Type
                  </label>
                  <select
                    name="rate_type"
                    value={formData.rate_type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                  {errors.rate_type && (
                    <span className="text-red-500 text-sm">
                      {errors.rate_type}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    name="discount_value"
                    placeholder="Enter discount value"
                    value={formData.discount_value}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded placeholder:text-sm placeholder:text-gray-400 placeholder-opacity-75"
                  />
                  {errors.discount_value && (
                    <span className="text-red-500 text-sm">
                      {errors.discount_value}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 col-span-2">
                <div>
                  <label className="block text-sm font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  {errors.start_date && (
                    <span className="text-red-500 text-sm">
                      {errors.start_date}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  {errors.end_date && (
                    <span className="text-red-500 text-sm">
                      {errors.end_date}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 col-span-2">
                <div>
                  <label className="block text-sm font-medium">
                    Min Purchase Amount
                  </label>
                  <input
                    type="number"
                    name="min_purchase_amount"
                    placeholder="Enter min purchase amount"
                    value={formData.min_purchase_amount}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded placeholder:text-sm placeholder:text-gray-400 placeholder-opacity-75"
                  />
                  {errors.min_purchase_amount && (
                    <span className="text-red-500 text-sm">
                      {errors.min_purchase_amount}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Max Discount Amount
                  </label>
                  <input
                    type="number"
                    name="max_discount_amount"
                    placeholder="Enter max discount amount"
                    value={formData.max_discount_amount}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded placeholder:text-sm placeholder:text-gray-400 placeholder-opacity-75"
                  />
                  {errors.max_discount_amount && (
                    <span className="text-red-500 text-sm">
                      {errors.max_discount_amount}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Max Usage Per User
                  </label>
                  <input
                    type="number"
                    name="max_usage_per_user"
                    placeholder="Enter max usage per user"
                    value={formData.max_usage_per_user}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded placeholder:text-sm placeholder:text-gray-400 placeholder-opacity-75"
                  />
                  {errors.max_usage_per_user && (
                    <span className="text-red-500 text-sm">
                      {errors.max_usage_per_user}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className=" bg-[#F47954] text-white px-6 py-2 rounded-lg hover:bg-pink-800"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCoupon;
