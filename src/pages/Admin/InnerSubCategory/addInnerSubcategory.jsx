import React, { useState, useEffect } from "react";
import {
  addInnerSubCategory,
  getSubCategories,
} from "../../../services/api.category";
import {
  notifyOnSuccess,
  notifyOnFail,
} from "../../../utils/notification/toast";
import slugify from "slugify";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import { AiOutlineInfoCircle } from "react-icons/ai";

const AddInnerSubCategory = () => {
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState([]);
  const [formData, setFormData] = useState({
    sub_cat_id: null,
    title: "",
    subtitle: "",
    discount: "",
    hsn_code: "",
    tax: 0.0,
    tax_type: "",
    slug: "",
    meta_title: "",
    meta_description: "",
    image: null,
    size_chart_image: null,
    is_featured: false,
    is_instant_return: false,
    is_normal_return: false,
    openbox_delivery: false,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [sizeChartPreviewImage, setSizeChartPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, files, checked, type } = e.target;

    if (name === "image" || name === "size_chart_image") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === "image") {
          setPreviewImage(reader.result);
        } else {
          setSizeChartPreviewImage(reader.result);
        }
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    } else if (name === "title") {
      const newSlug = generateSlug(value);
      const newMetaTitle = `${value} | IERADA`;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: newSlug,
        meta_title: newMetaTitle,
      }));
    } else if (name === "slug") {
      const newSlug = value.toLowerCase();
      if (validateSlug(newSlug) || newSlug === "") {
        setFormData((prev) => ({
          ...prev,
          slug: newSlug,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const generateSlug = (text) => {
    return slugify(text, {
      lower: true,
      strict: true,
      trim: true,
      locale: "en",
      remove: /[*+~.()'"!:@]/g,
    });
  };

  const validateSlug = (slug) => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          formPayload.append(key, formData[key]);
        }
      });

      const response = await addInnerSubCategory(formPayload);
      if (response?.status) {
        notifyOnSuccess("Inner subcategory added successfully");
        navigate(`${config.VITE_BASE_ADMIN_URL}/innersubcategories/list`);
      }
    } catch (error) {
      notifyOnFail("Failed to add InnerSubcategory");
    }
  };

  const getAllSubCategories = async () => {
    const res = await getSubCategories();
    const formattedSubCategory = res.data?.map((data) => ({
      id: data.id,
      name: data.title,
    }));
    setSubCategories(formattedSubCategory);
  };

  useEffect(() => {
    getAllSubCategories();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Create New InnerSubCategory
        </h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-6">
            Add a new Inner SubCategory
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                SubCategory Id
              </label>
              <select
                name="sub_cat_id"
                value={formData.sub_cat_id || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              >
                <option value="" disabled>
                  Select SubCategory Id
                </option>
                {subCategories?.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inner SubCategory Name
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Type category name here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Type subtitle here..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Type
                </label>
                <select
                  name="tax_type"
                  value={formData.tax_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="">Select Tax Type</option>
                  <option value="fixed">Fixed</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="tax"
                  value={formData.tax}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Enter tax amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HSN Code
                </label>
                <input
                  type="text"
                  name="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Enter HSN Code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-orange-500"
                  placeholder="slug"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-orange-500"
                placeholder="Type meta title here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                name="meta_description"
                value={formData.meta_description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-orange-500"
                placeholder="Type meta description here..."
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_featured"
                  className="text-sm font-medium text-gray-700"
                >
                  Featured Product
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_instant_return"
                  id="is_instant_return"
                  checked={formData.is_instant_return}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_instant_return"
                  className="text-sm font-medium text-gray-700"
                >
                  Instant Return
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_normal_return"
                  id="is_normal_return"
                  checked={formData.is_normal_return}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_normal_return"
                  className="text-sm font-medium text-gray-700"
                >
                  Normal Return
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="openbox_delivery"
                  id="openbox_delivery"
                  checked={formData.openbox_delivery}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="openbox_delivery"
                  className="text-sm font-medium text-gray-700"
                >
                  Open Box Delivery
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">Thumbnail</h2>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-black transition-colors"
                  onClick={() =>
                    document.getElementById("image-upload").click()
                  }
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Category preview"
                      className="w-full h-48 object-contain rounded-lg"
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
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center mb-1">
                    <AiOutlineInfoCircle className="text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-800">
                      Image Guidelines:
                    </h4>
                  </div>
                  <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                    <li>Recommended aspect ratio: 16:9 (landscape)</li>
                    <li>Recommended resolution: 1280×720 pixels</li>
                    <li>Minimum width: 640 pixels</li>
                    <li>Maximum file size: 5MB</li>
                    <li>Supported formats: JPG, PNG, WebP</li>
                    <li>
                      Use high-contrast images with clear product visibility
                    </li>
                    <li>Avoid text in images where possible</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">Size Chart</h2>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-black transition-colors"
                  onClick={() =>
                    document.getElementById("size-chart-upload").click()
                  }
                >
                  {sizeChartPreviewImage ? (
                    <img
                      src={sizeChartPreviewImage}
                      alt="Size chart preview"
                      className="w-full h-48 object-contain rounded-lg"
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
                        Drag and drop size chart image here, or click to select
                      </p>
                    </div>
                  )}
                  <input
                    id="size-chart-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                    name="size_chart_image"
                  />
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center mb-1">
                    <AiOutlineInfoCircle className="text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-800">
                      Size Chart Image Guidelines:
                    </h4>
                  </div>
                  <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                    <li>
                      Recommended aspect ratio: 1:1 or 4:5 (square/portrait)
                    </li>
                    <li>Recommended resolution: 800×800 pixels</li>
                    <li>Minimum width: 400 pixels</li>
                    <li>Maximum file size: 5MB</li>
                    <li>Supported formats: JPG, PNG, WebP</li>
                    <li>Ensure text is clear and legible</li>
                    <li>Use high-resolution images for size charts</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `${config.VITE_BASE_ADMIN_URL}/innersubcategories/list`
                  )
                }
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInnerSubCategory;
