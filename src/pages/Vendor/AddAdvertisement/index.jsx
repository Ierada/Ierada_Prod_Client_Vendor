import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAd } from "../../../services/api.ads";
import { getProductsByVendorId } from "../../../services/api.product";
import {
  notifyOnSuccess,
  notifyOnFail,
} from "../../../utils/notification/toast";
import config from "../../../config/config";
import { useAppContext } from "../../../context/AppContext";

const CreateAdPage = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: "",
    start_date: "",
    end_date: "",
    amount: "",
  });

  const fetchProducts = async (vendorId) => {
    console.log("Fetching products for vendor ID:", vendorId);
    try {
      const response = await getProductsByVendorId(vendorId);

      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    if (user?.id) fetchProducts(user.id);
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      notifyOnFail("Vendor ID is missing. Please log in again.");
      return;
    }

    try {
      const adData = { ...formData, vendor_id: user.id };
      const response = await createAd(adData);

      if (response?.status) {
        notifyOnSuccess("Ad created successfully!");
        navigate(`${config.VITE_BASE_VENDOR_URL}/ads/history`);
      }
    } catch (error) {
      console.error("Ad creation failed:", error);
      notifyOnFail("An error occurred while creating the ad.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Create Ad</h1>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-6">Create New Ad</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Product
              </label>
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                required
              >
                <option value="" disabled>
                  Select Product
                </option>
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-8">
              <button
                type="button"
                onClick={() =>
                  navigate(`${config.VITE_BASE_VENDOR_URL}/ads/history`)
                }
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-coral-600 transition-colors"
              >
                + Request Advertisement
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAdPage;
