import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  getCategories,
  addCategory,
  updateCategory,
} from "../../../services/api.category";
import { AiOutlineInfoCircle } from "react-icons/ai";

const CategoryModal = ({ isOpen, onClose, mode, category, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    type: "",
    hsn_code: "",
    description: "",
    discount: 0,
    slug: "",
    meta_title: "",
    meta_description: "",
    is_featured: false,
    has_age_group: false,
    homepage_active: false,
  });

  const [imageFile, setImageFile] = useState({
    file: null,
    preview: null,
  });
  const [HeaderimageFile, setHeaderImageFile] = useState({
    file: null,
    preview: null,
  });

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (category && mode !== "add") {
        setFormData({
          title: category.title || "",
          subtitle: category.subtitle || "",
          type: category.type || "",
          hsn_code: category.hsn_code || "",
          description: category.description || "",
          discount: category.discount || 0,
          slug: category.slug || "",
          meta_title: category.meta_title || "",
          meta_description: category.meta_description || "",
          is_featured: category.is_featured || false,
          has_age_group: category.has_age_group || false,
          homepage_active: category.homepage_active || false,
        });

        setImageFile({
          file: null,
          preview: category.image || null,
        });
        setHeaderImageFile({
          file: null,
          preview: category.header_image || null,
        });
      } else {
        // Reset form for add mode
        setFormData({
          title: "",
          subtitle: "",
          type: "",
          hsn_code: "",
          description: "",
          discount: "",
          slug: "",
          meta_title: "",
          meta_description: "",
          is_featured: false,
          has_age_group: false,
          homepage_active: false,
        });

        setImageFile({
          file: null,
          preview: null,
        });
        setHeaderImageFile({
          file: null,
          preview: null,
        });
      }
    }
  }, [category, mode, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      setImageFile({
        file: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const removeImage = () => {
    setImageFile({
      file: null,
      preview: null,
    });
  };

  const handleHeaderImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];

      setHeaderImageFile({
        file: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const removeHeaderImage = () => {
    setHeaderImageFile({
      file: null,
      preview: null,
    });
  };

  const validateForm = () => {
    // Title and slug are required by the backend
    if (!formData.title || !formData.slug) {
      alert("Title and slug are required.");
      return false;
    }

    // Image is only required on creation, not on edit
    if (mode === "add" && !imageFile.file) {
      alert("Image is required for new categories.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();

    // Add all form fields to FormData
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    // Add image file if it exists
    if (imageFile.file) {
      formDataToSend.append("image", imageFile.file);
    }
    if (HeaderimageFile.file) {
      formDataToSend.append("header_image", HeaderimageFile.file);
    }

    try {
      let response;

      if (mode === "add") {
        response = await addCategory(formDataToSend);
      } else if (mode === "edit") {
        response = await updateCategory(category?.id, formDataToSend);
      }

      if (response && response.status === 1) {
        if (typeof onSuccess === "function") {
          onSuccess();
        }
        onClose();
      }
    } catch (error) {
      console.error(
        `Error ${mode === "add" ? "adding" : "updating"} category:`,
        error
      );
      alert(
        `Failed to ${
          mode === "add" ? "add" : "update"
        } category. Please try again.`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {mode === "view"
                ? "View Category"
                : mode === "edit"
                ? "Edit Category"
                : "Add Category"}
            </h2>
            <button onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  {mode === "view" ? (
                    <p>{formData.title}</p>
                  ) : (
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                      disabled={mode === "view"}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  {mode === "view" ? (
                    <p>{formData.subtitle}</p>
                  ) : (
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      disabled={mode === "view"}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  {mode === "view" ? (
                    <p>{formData.type}</p>
                  ) : (
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      disabled={mode === "view"}
                    >
                      <option value="">Select Type</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Boy">Boy</option>
                      <option value="Girl">Girl</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HSN Code
                  </label>
                  {mode === "view" ? (
                    <p>{formData.hsn_code}</p>
                  ) : (
                    <input
                      type="text"
                      name="hsn_code"
                      value={formData.hsn_code}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      disabled={mode === "view"}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  {mode === "view" ? (
                    <p>{formData.slug}</p>
                  ) : (
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                      disabled={mode === "view"}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Description</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                {mode === "view" ? (
                  <p className="whitespace-pre-wrap">{formData.description}</p>
                ) : (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md h-32"
                    disabled={mode === "view"}
                  />
                )}
              </div>
            </div>

            {/* SEO Information */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">SEO Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  {mode === "view" ? (
                    <p>{formData.meta_title}</p>
                  ) : (
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      disabled={mode === "view"}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  {mode === "view" ? (
                    <p>{formData.meta_description}</p>
                  ) : (
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md h-24"
                      disabled={mode === "view"}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Image Section */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Category Image</h3>
              <div className="mb-6">
                {mode !== "view" && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-4"
                    disabled={mode === "view"}
                  />
                )}
                {imageFile.preview && (
                  <div className="relative inline-block">
                    <img
                      src={imageFile.preview}
                      alt="Category Preview"
                      className="w-32 h-32 object-cover rounded-md"
                    />
                    {mode !== "view" && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                <h3 className="text-lg font-medium mb-4">
                  Category Header Image
                </h3>

                {mode !== "view" && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderImageChange}
                    className="mb-4"
                    disabled={mode === "view"}
                  />
                )}
                {HeaderimageFile.preview && (
                  <div className="relative inline-block">
                    <img
                      src={HeaderimageFile.preview}
                      alt="Category Preview"
                      className="w-32 h-32 object-cover rounded-md"
                    />
                    {mode !== "view" && (
                      <button
                        type="button"
                        onClick={removeHeaderImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Image Guidelines - Added from AddCategory component */}
                {mode !== "view" && (
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
                )}
              </div>
            </div>

            {/* Additional Settings */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Additional Settings</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4"
                    disabled={mode === "view"}
                  />
                  <label
                    htmlFor="is_featured"
                    className="text-sm font-medium text-gray-700"
                  >
                    Featured Category
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="has_age_group"
                    name="has_age_group"
                    checked={formData.has_age_group}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4"
                    disabled={mode === "view"}
                  />
                  <label
                    htmlFor="has_age_group"
                    className="text-sm font-medium text-gray-700"
                  >
                    Has Age Group
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
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
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-gray-800"
                >
                  {mode === "add" ? "Add Category" : "Update Category"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
