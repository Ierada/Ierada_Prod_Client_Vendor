import React, { useState, useEffect } from "react";
import { addCategory } from "../../../services/api.category";
import {
  notifyOnSuccess,
  notifyOnFail,
} from "../../../utils/notification/toast";
import slugify from "slugify";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import { addAdData } from "../../../services/api.ads";

const CreateAd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: {
      id: "",
      name: "",
      subtitle: "",
    },
    image: "",
    amount: "",
    status: "",
    stock_limit: "",
    baseSalePrice: "",
    discountRate: "",
    discountType: "",
    start_date: "",
    end_date: "",
    sku: "",
    hsn_code: "",
    barcode: "",
    quantity: "",
    vat_percentage: "",
  });

  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "title" && { slug: slugify(value, { lower: true }) }),
      }));
    }
  };

  const [calculatedPrices, setCalculatedPrices] = useState({
    basePrice: 0,
  });
  useEffect(() => {
    const basePrice = parseFloat(formData.baseSalePrice) || 0;
    const discountType = formData.discountType;
    const discountRate = parseFloat(formData.discountRate) || 0;

    if (!basePrice || !discountType || !discountRate) {
      setCalculatedPrices({
        priceBeforeDiscount: 0,
        priceAfterDiscount: 0,
      });
      return;
    }

    let priceBeforeDiscount = basePrice;
    let priceAfterDiscount = basePrice;

    if (discountType === "fixed") {
      priceAfterDiscount = Math.max(basePrice - discountRate, 0);
    } else if (discountType === "percentage") {
      priceAfterDiscount = Math.max(
        basePrice - (basePrice * discountRate) / 100,
        0
      );
    }

    setCalculatedPrices({
      priceBeforeDiscount: priceBeforeDiscount,
      priceAfterDiscount: priceAfterDiscount,
    });
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          formPayload.append(key, formData[key]);
        }
      });

      const response = await addCategory(formPayload);
      if (response?.status) {
        notifyOnSuccess("Category added successfully!");
        navigate("/admin/categories");
      }
    } catch (error) {
      notifyOnFail("Failed to add category");
    }

    Object.keys(calculatedPrices)?.forEach((key) => {
      submitData.append(key, calculatedPrices[key]);
    });

    const response = await addAdData(submitData);
    if (response.status === 1) {
      // fetchAdData();
      setFormData({
        name: "",
        category: {
          id: "",
          name: "",
          subtitle: "",
        },
        amount: "",
        baseSalePrice: "",
        discountRate: "",
        discountType: "",
        start_date: "",
        end_date: "",
        stock_limit: "",
        image: "",
      });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Create Ad</h1>
          {/* <button
            onClick={() => navigate(`${config.VITE_BASE_ADMIN_URL}/ads/list`)}
            className="px-4 py-2 text-xl  text-orange-600 rounded-md hover:bg-coral-600 transition-colors flex items-center gap-2"
          >
            Ads History
          </button> */}
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col max-w-[260px]">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">Product Photo</h2>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-black transition-colors"
                onClick={() => document.getElementById("image-upload").click()}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Category preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="py-12  ">
                    <svg
                      className="mx-auto h-8 w-8 text-orange-600 border-2  border-orange-600 rounded-full"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      Drag and drop image here, or click to select
                    </p>
                    <p className="font-semibold text-sm text-orange-600 mt-2">
                      Add Image
                    </p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                  name="image"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-6">Create New Ad</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Advertisement Name / Product Name
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none  "
                    placeholder="Type Advertisement name here..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Category
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none "
                    placeholder="Type category name here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none "
                    placeholder="Type Advertisement description here..."
                  />
                </div>

                <div className="bg-white rounded-lg ">
                  <h2 className="text-black-200 text-lg py-2">Pricing</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Base Price
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Discount Type
                        </label>
                        <select
                          name="discountType"
                          value={formData.discountType}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                        >
                          <option value="" disabled>
                            Select Discount-Type
                          </option>
                          <option value="fixed">Fixed</option>
                          <option value="percentage">Percentage</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Discount Rate
                        </label>
                        <input
                          type="number"
                          name="discountRate"
                          value={formData.discountRate}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md space-y-2">
                      <h3 className="font-medium text-gray-900">
                        Calculated Prices
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p>
                            Price Before Discount: ₹
                            {calculatedPrices.priceBeforeDiscount || 0}
                          </p>
                          <p>
                            Price After Discount: ₹
                            {calculatedPrices.priceAfterDiscount || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT Amount (%)
                  </label>
                  <input
                    type="number"
                    name=""
                    value={formData.vat_percentage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none "
                    placeholder="Type category name here..."
                  />
                </div>

                <div className="bg-white  rounded-lg ">
                  <h2 className="text-black-200 text-lg py-2">Inventory</h2>
                  <div className="space-y-6">
                    <div className="grid items-center justify-between gap-4 grid-cols-2 lg:grid-cols-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          SKU
                        </label>
                        <input
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          placeholder="product SKU here"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          HSN Code
                        </label>
                        <input
                          type="text"
                          name="hsnCode"
                          value={formData.hsn_code}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          placeholder="Select HSN Code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Barcode
                        </label>
                        <input
                          type="text"
                          name="barcode"
                          value={formData.barcode}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          placeholder="Product barcode"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <input
                          type="text"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          placeholder="Product quantity"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid  gap-4 grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Add Amount
                    </label>
                    <input
                      type="number"
                      name="addAmount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Add Start Date
                    </label>

                    <input
                      type="date"
                      name="startDate"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Add End Date
                    </label>

                    <input
                      type="date"
                      name="endDate"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-8">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`${config.VITE_BASE_ADMIN_URL}/ads/list`)
                    }
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2  bg-orange-500 text-white rounded-md hover:bg-coral-600 transition-colors"
                  >
                    + Request Advertisement
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAd;
