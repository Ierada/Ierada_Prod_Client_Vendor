import React, { useState, useEffect } from "react";
import {
  addOffer,
  getOfferById,
  updateOffer,
} from "../../../services/api.offers";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../../config/config";
import {
  notifyOnSuccess,
  notifyOnFail,
} from "../../../utils/notification/toast";
import { getProductCatData } from "../../../services/api.product";
import { motion } from "framer-motion";
import { AiOutlineInfoCircle } from "react-icons/ai";

const OfferForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [offerType, setOfferType] = useState("product"); // Default to product
  const [productOptions, setProductOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [innerSubCategoryOptions, setInnerSubCategoryOptions] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    // discountType: "",
    // discountValue: "",
    startDate: "",
    endDate: "",
    isActive: true,
    product_id: null,
    category_id: null,
    sub_category_id: null,
    inner_subcategory_id: null,
    image: "",
    slug: "",
  });
  const [error, setError] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const getOfferData = async () => {
    setIsLoading(true);

    try {
      const response = await getOfferById(id);
      if (response.status === 1) {
        const offer = response.data;

        // Determine which type of offer it is
        if (offer.product_id) setOfferType("product");
        else if (offer.category_id) setOfferType("category");
        else if (offer.sub_category_id) setOfferType("subCategory");
        else if (offer.inner_subcategory_id) setOfferType("innerSubCategory");

        setFormData({
          title: offer.title || "",
          description: offer.description || "",
          // discountType: offer.discountType || "",
          // discountValue: offer.discountValue || "",
          startDate: offer.startDate
            ? new Date(offer.startDate).toISOString().split("T")[0]
            : "",
          endDate: offer.endDate
            ? new Date(offer.endDate).toISOString().split("T")[0]
            : "",
          isActive: offer.isActive ?? true,
          product_id: offer.product_id || "",
          category_id: offer.category_id || "",
          sub_category_id: offer.sub_category_id || "",
          inner_subcategory_id: offer.inner_subcategory_id || "",
          slug: offer.slug || "",
        });

        // Set image preview if available
        if (offer.image) {
          setPreviewImage(offer.image);
        }

        setIsLoading(false);
      } else {
        notifyOnFail(response.message);
      }
    } catch (error) {
      notifyOnFail("Error fetching offer data");
    }
  };

  // Fetch offer data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      getOfferData();
    }
  }, [id, isEditMode]);

  // Fetch all dropdown data
  useEffect(() => {
    const fetchAllOptions = async () => {
      try {
        // Fetch products
        const productResponse = await getProductCatData("product");
        if (productResponse.status === 1) {
          setProductOptions(productResponse.data);
        }

        // Fetch categories
        const categoryResponse = await getProductCatData("category");
        if (categoryResponse.status === 1) {
          setCategoryOptions(categoryResponse.data);
        }

        // Fetch subcategories
        const subCategoryResponse = await getProductCatData("subCategory");
        if (subCategoryResponse.status === 1) {
          setSubCategoryOptions(subCategoryResponse.data);
        }

        // Fetch inner subcategories
        const innerSubCategoryResponse = await getProductCatData(
          "innerSubCategory"
        );
        if (innerSubCategoryResponse.status === 1) {
          setInnerSubCategoryOptions(innerSubCategoryResponse.data);
        }
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
        notifyOnFail("Error loading form options");
      }
    };

    fetchAllOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleOfferTypeChange = (e) => {
    const newType = e.target.value;
    setOfferType(newType);

    // Reset all ID fields
    setFormData((prevData) => {
      const updatedData = { ...prevData };

      // Set all ID fields to empty strings initially
      updatedData.product_id = "";
      updatedData.category_id = "";
      updatedData.sub_category_id = "";
      updatedData.inner_subcategory_id = "";

      return updatedData;
    });
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  const validate = () => {
    let errors = {};

    if (!formData.title) errors.title = "Title is required.";
    if (!formData.description) errors.description = "Description is required.";
    // if (!formData.discountType)
    //   errors.discountType = "Discount type is required.";
    // if (!formData.discountValue || formData.discountValue <= 0)
    //   errors.discountValue = "Valid discount value is required.";
    if (!formData.startDate) errors.startDate = "Start date is required.";
    if (!formData.endDate) errors.endDate = "End date is required.";
    if (new Date(formData.startDate) > new Date(formData.endDate))
      errors.dateRange = "End date must be after the start date.";

    // Only validate the relevant ID based on offer type
    if (offerType === "product" && !formData.product_id)
      errors.product_id = "Product is required.";
    else if (offerType === "category" && !formData.category_id)
      errors.category_id = "Category is required.";
    else if (offerType === "subCategory" && !formData.sub_category_id)
      errors.sub_category_id = "Subcategory is required.";
    else if (offerType === "innerSubCategory" && !formData.inner_subcategory_id)
      errors.inner_subcategory_id = "Inner Subcategory is required.";

    // Only require image in add mode
    if (!isEditMode && !formData.image) errors.image = "Image is required.";

    setError(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    // formDataToSend.append("discountType", formData.discountType);
    // formDataToSend.append("discountValue", formData.discountValue);
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("endDate", formData.endDate);
    formDataToSend.append("isActive", formData.isActive);

    // Only append the relevant ID field based on offer type
    if (offerType === "product") {
      formDataToSend.append("product_id", formData.product_id);
    } else if (offerType === "category") {
      formDataToSend.append("category_id", formData.category_id);
    } else if (offerType === "subCategory") {
      formDataToSend.append("sub_category_id", formData.sub_category_id);
    } else if (offerType === "innerSubCategory") {
      formDataToSend.append(
        "inner_subcategory_id",
        formData.inner_subcategory_id
      );
    }

    // Generate slug if not in edit mode or if title changed
    const slug = formData.slug || generateSlug(formData.title);
    formDataToSend.append("slug", slug);

    // Only append image if it's a file object (not a string URL)
    if (formData.image && typeof formData.image !== "string") {
      formDataToSend.append("image", formData.image);
    }

    if (isEditMode) {
      updateOffer(id, formDataToSend)
        .then((response) => {
          if (response.status === 1) {
            notifyOnSuccess("Offer updated successfully");
            navigate(`${config.VITE_BASE_ADMIN_URL}/offers/list`);
          } else {
            notifyOnFail(response.message || "Error updating offer");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Update error:", error);
          notifyOnFail(error.message || "Error updating offer");
          setIsLoading(false);
        });
    } else {
      addOffer(formDataToSend)
        .then((response) => {
          if (response.status === 1) {
            notifyOnSuccess("Offer added successfully");
            navigate(`${config.VITE_BASE_ADMIN_URL}/offers/list`);
          } else {
            notifyOnFail(response.message || "Error adding offer");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Add error:", error);
          notifyOnFail(error.message || "Error adding offer");
          setIsLoading(false);
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F47954]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-gray-900 mb-8"
        >
          {isEditMode ? "Edit Offer" : "Create New Offer"}
        </motion.h1>
        <div className="flex flex-col md:flex-row gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col md:w-1/3"
          >
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">Thumbnail</h2>

              {/* Image Guidelines Section */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center mb-1">
                  <AiOutlineInfoCircle className="text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-800">
                    Image Guidelines:
                  </h4>
                </div>
                <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                  <li>Recommended aspect ratio: 3:4</li>
                  <li>Optimal resolution: 900×1200 pixels</li>
                  <li>Minimum width: 600 pixels</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Supported formats: JPG, PNG, WebP</li>
                  <li>
                    Use high-quality images for best display in offer slider
                  </li>
                </ul>
              </div>

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-black transition-colors"
                onClick={() => document.getElementById("image-upload").click()}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Offer preview"
                    className="w-full h-48 object-fill rounded-lg"
                  />
                ) : (
                  <div className="py-12">
                    <svg
                      className="mx-auto h-10 w-10 text-orange-600 border-2 border-orange-600 rounded-full"
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
                {error.image && (
                  <p className="text-red-500 text-xs mt-2">{error.image}</p>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-[#F47954] focus:ring-[#F47954] border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col w-full md:w-2/3"
          >
            <div className="bg-white p-6 rounded-lg shadow">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Offer Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F47954] focus:border-[#F47954]"
                  />
                  {error.title && (
                    <p className="text-red-500 text-xs mt-2">{error.title}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F47954] focus:border-[#F47954]"
                  />
                  {error.description && (
                    <p className="text-red-500 text-xs mt-2">
                      {error.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div>
                    <label
                      htmlFor="discountType"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Discount Type
                    </label>
                    <select
                      id="discountType"
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F47954] focus:border-[#F47954]"
                    >
                      <option value="">Select Discount Type</option>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                    </select>
                    {error.discountType && (
                      <p className="text-red-500 text-xs mt-2">
                        {error.discountType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="discountValue"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Discount Value
                    </label>
                    <input
                      type="number"
                      id="discountValue"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F47954] focus:border-[#F47954]"
                    />
                    {error.discountValue && (
                      <p className="text-red-500 text-xs mt-2">
                        {error.discountValue}
                      </p>
                    )}
                  </div> */}

                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F47954] focus:border-[#F47954]"
                    />
                    {error.startDate && (
                      <p className="text-red-500 text-xs mt-2">
                        {error.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F47954] focus:border-[#F47954]"
                    />
                    {error.endDate && (
                      <p className="text-red-500 text-xs mt-2">
                        {error.endDate}
                      </p>
                    )}
                  </div>
                  {error.dateRange && (
                    <p className="text-red-500 text-xs col-span-2">
                      {error.dateRange}
                    </p>
                  )}
                </div>

                <div className="border-t pt-4 border-gray-200">
                  <h3 className="text-md font-medium mb-3">
                    Offer Applies To:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="typeProduct"
                        name="offerType"
                        value="product"
                        checked={offerType === "product"}
                        onChange={handleOfferTypeChange}
                        className="mr-2 h-4 w-4 text-[#F47954] focus:ring-[#F47954] border-gray-300"
                      />
                      <label
                        htmlFor="typeProduct"
                        className="text-sm text-gray-700"
                      >
                        Product
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="typeCategory"
                        name="offerType"
                        value="category"
                        checked={offerType === "category"}
                        onChange={handleOfferTypeChange}
                        className="mr-2 h-4 w-4 text-[#F47954] focus:ring-[#F47954] border-gray-300"
                      />
                      <label
                        htmlFor="typeCategory"
                        className="text-sm text-gray-700"
                      >
                        Category
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="typeSubCategory"
                        name="offerType"
                        value="subCategory"
                        checked={offerType === "subCategory"}
                        onChange={handleOfferTypeChange}
                        className="mr-2 h-4 w-4 text-[#F47954] focus:ring-[#F47954] border-gray-300"
                      />
                      <label
                        htmlFor="typeSubCategory"
                        className="text-sm text-gray-700"
                      >
                        Subcategory
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="typeInnerSubCategory"
                        name="offerType"
                        value="innerSubCategory"
                        checked={offerType === "innerSubCategory"}
                        onChange={handleOfferTypeChange}
                        className="mr-2 h-4 w-4 text-[#F47954] focus:ring-[#F47954] border-gray-300"
                      />
                      <label
                        htmlFor="typeInnerSubCategory"
                        className="text-sm text-gray-700"
                      >
                        Inner Subcategory
                      </label>
                    </div>
                  </div>

                  <motion.div
                    key={offerType}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                  >
                    {offerType === "product" && (
                      <div>
                        <label
                          htmlFor="product_id"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Select Product
                        </label>
                        <select
                          id="product_id"
                          name="product_id"
                          value={formData.product_id}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F47954] focus:border-[#F47954]"
                        >
                          <option value="">Select a Product</option>
                          {productOptions.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                        {error.product_id && (
                          <p className="text-red-500 text-xs mt-2">
                            {error.product_id}
                          </p>
                        )}
                      </div>
                    )}

                    {offerType === "category" && (
                      <div>
                        <label
                          htmlFor="category_id"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Select Category
                        </label>
                        <select
                          id="category_id"
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F47954] focus:border-[#F47954]"
                        >
                          <option value="">Select a Category</option>
                          {categoryOptions.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.title}
                            </option>
                          ))}
                        </select>
                        {error.category_id && (
                          <p className="text-red-500 text-xs mt-2">
                            {error.category_id}
                          </p>
                        )}
                      </div>
                    )}

                    {offerType === "subCategory" && (
                      <div>
                        <label
                          htmlFor="sub_category_id"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Select Subcategory
                        </label>
                        <select
                          id="sub_category_id"
                          name="sub_category_id"
                          value={formData.sub_category_id}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F47954] focus:border-[#F47954]"
                        >
                          <option value="">Select a Subcategory</option>
                          {subCategoryOptions.map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.title}
                            </option>
                          ))}
                        </select>
                        {error.sub_category_id && (
                          <p className="text-red-500 text-xs mt-2">
                            {error.sub_category_id}
                          </p>
                        )}
                      </div>
                    )}

                    {offerType === "innerSubCategory" && (
                      <div>
                        <label
                          htmlFor="inner_subcategory_id"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Select Inner Subcategory
                        </label>
                        <select
                          id="inner_subcategory_id"
                          name="inner_subcategory_id"
                          value={formData.inner_subcategory_id}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F47954] focus:border-[#F47954]"
                        >
                          <option value="">Select an Inner Subcategory</option>
                          {innerSubCategoryOptions.map((innerSubcategory) => (
                            <option
                              key={innerSubcategory.id}
                              value={innerSubcategory.id}
                            >
                              {innerSubcategory.title}
                            </option>
                          ))}
                        </select>
                        {error.inner_subcategory_id && (
                          <p className="text-red-500 text-xs mt-2">
                            {error.inner_subcategory_id}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`${config.VITE_BASE_ADMIN_URL}/offers/list`)
                    }
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#F47954] text-white rounded-lg hover:bg-orange-500 transition-colors flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : isEditMode ? (
                      "Update"
                    ) : (
                      "Add"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OfferForm;
