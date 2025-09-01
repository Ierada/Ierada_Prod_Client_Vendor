import React, { useState } from "react";
import { addCategory } from "../../../services/api.category";
import {
  notifyOnSuccess,
  notifyOnFail,
} from "../../../utils/notification/toast";
import slugify from "slugify";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import { AiOutlineInfoCircle } from "react-icons/ai";

const AddCategory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    type: "",
    description: "",
    discount: "",
    slug: "",
    meta_title: "",
    meta_description: "",
    image: null,
    header_image: null,
    is_featured: false,
    has_age_group: false,
    homepage_active: false,
  });
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [previewHeaderImage, setHeaderPreviewImage] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Category Name is required";
    if (!formData.subtitle.trim()) newErrors.subtitle = "Subtitle is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!validateSlug(formData.slug)) newErrors.slug = "Invalid slug format";
    if (!formData.meta_title.trim())
      newErrors.meta_title = "Meta Title is required";
    if (!formData.meta_description.trim())
      newErrors.meta_description = "Meta Description is required";
    if (!formData.image) newErrors.image = "Category image is required";
    if (!formData.header_image)
      newErrors.header_image = "Category Header image is required";
    if (
      formData.discount &&
      (formData.discount < 0 || formData.discount > 100)
    ) {
      newErrors.discount = "Discount must be between 0 and 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, files, checked, type } = e.target;

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
    } else if (name === "header_image") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        header_image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderPreviewImage(reader.result);
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
    if (!validateForm()) return;
    try {
      const formPayload = new FormData();

      // Append all fields
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === "image" || key === "header_image") {
            // Only append if it's a file (not null)
            if (formData[key]) {
              formPayload.append(key, formData[key]);
            }
          } else {
            formPayload.append(key, formData[key]);
          }
        }
      });

      const response = await addCategory(formPayload);
      if (response?.status) {
        navigate(`${config.VITE_BASE_ADMIN_URL}/categories/list`);
      }
    } catch (error) {
      notifyOnFail("Failed to add category");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Create New Category
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col max-w-[360px]">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">Thumbnail</h2>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-black transition-colors"
                onClick={() => document.getElementById("image-upload").click()}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Category preview"
                    className="w-full aspect-[3/4] object-cover rounded-lg"
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
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}

              <h2 className="text-lg font-medium mb-4">Header Image</h2>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-black transition-colors"
                onClick={() => document.getElementById("header_img").click()}
              >
                {previewHeaderImage ? (
                  <img
                    src={previewHeaderImage}
                    alt="Category preview"
                    className="w-full aspect-[3/4] object-cover rounded-lg"
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
                  id="header_img"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                  name="header_image"
                />
              </div>
              {errors.header_image && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.header_image}
                </p>
              )}
              {/* Image Guidelines */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center mb-1">
                  <AiOutlineInfoCircle className="text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-800">
                    Image Guidelines:
                  </h4>
                </div>
                <div className="text-sm text-blue-700 mt-2 space-y-1">
                  <p className="font-medium">Category Image (Thumbnail):</p>
                  <ul className="list-disc list-inside">
                    <li>Recommended aspect ratio: 1:1 (square)</li>
                    <li>Recommended resolution: 600×600 pixels</li>
                    <li>Minimum resolution: 300×300 pixels</li>
                  </ul>
                  <p className="font-medium mt-2">Header Image:</p>
                  <ul className="list-disc list-inside">
                    <li>Recommended aspect ratio: 4:3 (landscape)</li>
                    <li>Recommended resolution: 800×600 pixels</li>
                    <li>Minimum resolution: 400×300 pixels</li>
                  </ul>
                  <p className="font-medium mt-2">General Guidelines:</p>
                  <ul className="list-disc list-inside">
                    <li>Maximum file size: 5MB</li>
                    <li>Supported formats: JPG, PNG, WebP</li>
                    <li>Use clear, high-quality images for best results</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-6">Add a new Category</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg "
                      placeholder="Type category name here..."
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm">{errors.title}</p>
                    )}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg  "
                      placeholder="Type subtitle here..."
                    />
                    {errors.subtitle && (
                      <p className="text-red-500 text-sm">{errors.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Type</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Boy">Boy</option>
                      <option value="Girl">Girl</option>
                    </select>
                  </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg  "
                    placeholder="Type category description here..."
                  />

                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>

                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg  "
                      placeholder="slug"
                    />
                    {errors.slug && (
                      <p className="text-red-500 text-sm">{errors.slug}</p>
                    )}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg "
                    placeholder="Type meta title here..."
                  />
                  {errors.meta_title && (
                    <p className="text-red-500 text-sm">{errors.meta_title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <input
                    type="text"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg  "
                    placeholder="Type meta description here..."
                  />
                  {errors.meta_description && (
                    <p className="text-red-500 text-sm">
                      {errors.meta_description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Featured Product
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="has_age_group"
                      checked={formData.has_age_group}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Has Age Group
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`${config.VITE_BASE_ADMIN_URL}/categories/list`)
                    }
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-coral-600 transition-colors"
                  >
                    Add
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

export default AddCategory;
