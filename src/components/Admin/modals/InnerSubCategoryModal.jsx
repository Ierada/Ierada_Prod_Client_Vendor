import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  getSubCategories,
  updateInnerSubCategory,
} from "../../../services/api.category";
import {
  notifyOnSuccess,
  notifyOnFail,
} from "../../../utils/notification/toast";
import { AiOutlineInfoCircle } from "react-icons/ai";

const InnerSubCategoryModal = ({
  isOpen,
  onClose,
  mode,
  innerSubCategory,
  refreshData,
}) => {
  const [subCategories, setSubCategories] = useState([]);
  const [formData, setFormData] = useState({
    sub_cat_id: "",
    title: "",
    subtitle: "",
    discount: 0,
    tax: 0.0,
    tax_type: "",
    meta_title: "",
    meta_description: "",
    slug: "",
    is_featured: false,
    is_instant_return: false,
    is_normal_return: false,
    openbox_delivery: false,
    image: "",
    size_chart_image: "",
  });
  const [imageFile, setImageFile] = useState({
    file: null,
    preview: null,
  });
  const [sizeChartImageFile, setSizeChartImageFile] = useState({
    file: null,
    preview: null,
  });

  const getAllSubCategories = async () => {
    try {
      const res = await getSubCategories();
      const formattedCategory = res.data?.map((data) => ({
        id: data.id,
        name: data.title,
      }));
      setSubCategories(formattedCategory);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  useEffect(() => {
    getAllSubCategories();
  }, []);

  useEffect(() => {
    if (innerSubCategory && mode !== "add") {
      setFormData({
        sub_cat_id: innerSubCategory.sub_cat_id || "",
        title: innerSubCategory.title || "",
        subtitle: innerSubCategory.subtitle || "",
        discount: innerSubCategory.discount || 0,
        tax: innerSubCategory.tax || 0.0,
        tax_type: innerSubCategory.tax_type || "",
        meta_title: innerSubCategory.meta_title || "",
        meta_description: innerSubCategory.meta_description || "",
        slug: innerSubCategory.slug || "",
        is_featured: innerSubCategory.is_featured || false,
        is_instant_return: innerSubCategory.is_instant_return || false,
        is_normal_return: innerSubCategory.is_normal_return || false,
        openbox_delivery: innerSubCategory.openbox_delivery || false,
        image: innerSubCategory.image || "",
        size_chart_image: innerSubCategory.size_chart_image || "",
      });

      setImageFile({
        file: null,
        preview: innerSubCategory.image || null,
      });
      setSizeChartImageFile({
        file: null,
        preview: innerSubCategory.size_chart_image || null,
      });
    }
  }, [innerSubCategory, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
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

  const handleSizeChartImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      setSizeChartImageFile({
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
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const removeSizeChartImage = () => {
    setSizeChartImageFile({
      file: null,
      preview: null,
    });
    setFormData((prev) => ({
      ...prev,
      size_chart_image: "",
    }));
  };

  const validateForm = () => {
    if (!formData.sub_cat_id || !formData.title || !formData.slug) {
      notifyOnFail("SubCategory, Title, and Slug are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        formDataToSend.append(key, formData[key]);
      }
    });

    if (imageFile.file) {
      formDataToSend.append("image", imageFile.file);
    }
    if (sizeChartImageFile.file) {
      formDataToSend.append("size_chart_image", sizeChartImageFile.file);
    }

    try {
      const response = await updateInnerSubCategory(
        innerSubCategory?.id,
        formDataToSend
      );
      if (response?.status === 1) {
        notifyOnSuccess(
          mode === "edit"
            ? "Inner subcategory updated successfully"
            : "Inner subcategory added successfully"
        );
        if (refreshData) {
          refreshData();
        }
        onClose();
      } else {
        notifyOnFail("Failed to update inner subcategory");
      }
    } catch (error) {
      console.error("Error submitting Inner subCategory:", error);
      notifyOnFail("Error updating inner subcategory");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {mode === "view"
                ? "View Inner SubCategory"
                : mode === "edit"
                ? "Edit Inner SubCategory"
                : "Add Inner SubCategory"}
            </h2>
            <button onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    SubCategory Id
                  </label>
                  {mode === "view" ? (
                    <p>
                      {subCategories.find(
                        (subcategory) => subcategory.id === formData.sub_cat_id
                      )?.name || "N/A"}
                    </p>
                  ) : (
                    <select
                      name="sub_cat_id"
                      value={formData.sub_cat_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
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
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
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
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax
                  </label>
                  {mode === "view" ? (
                    <p>{formData.tax}</p>
                  ) : (
                    <input
                      type="number"
                      name="tax"
                      value={formData.tax}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      min="0"
                      step="0.01"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Type
                  </label>
                  {mode === "view" ? (
                    <p>{formData.tax_type || "N/A"}</p>
                  ) : (
                    <select
                      name="tax_type"
                      value={formData.tax_type}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">None</option>
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
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
                    />
                  )}
                </div>

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
                    />
                  )}
                </div>

                <div className="col-span-2">
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
                      className="w-full p-2 border rounded-md"
                      rows="3"
                    />
                  )}
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      {mode === "view" ? (
                        <>Featured: {formData.is_featured ? "Yes" : "No"}</>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 mr-2"
                          />
                          Featured
                        </>
                      )}
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      {mode === "view" ? (
                        <>
                          Instant Return:{" "}
                          {formData.is_instant_return ? "Yes" : "No"}
                        </>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            name="is_instant_return"
                            checked={formData.is_instant_return}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 mr-2"
                          />
                          Instant Return Available
                        </>
                      )}
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      {mode === "view" ? (
                        <>
                          Normal Return:{" "}
                          {formData.is_normal_return ? "Yes" : "No"}
                        </>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            name="is_normal_return"
                            checked={formData.is_normal_return}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 mr-2"
                          />
                          Normal Return Available
                        </>
                      )}
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      {mode === "view" ? (
                        <>
                          Open Box Delivery:{" "}
                          {formData.openbox_delivery ? "Yes" : "No"}
                        </>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            name="openbox_delivery"
                            checked={formData.openbox_delivery}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 mr-2"
                          />
                          Open Box Delivery
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inner SubCategory Image
              </label>
              {mode !== "view" && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-4"
                />
              )}
              {imageFile.preview && (
                <div className="relative inline-block">
                  <img
                    src={imageFile.preview}
                    alt="Preview"
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
              {mode !== "view" && (
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
              )}
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size Chart Image
              </label>
              {mode !== "view" && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSizeChartImageChange}
                  className="mb-4"
                />
              )}
              {sizeChartImageFile.preview && (
                <div className="relative inline-block">
                  <img
                    src={sizeChartImageFile.preview}
                    alt="Size Chart Preview"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                  {mode !== "view" && (
                    <button
                      type="button"
                      onClick={removeSizeChartImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              {mode !== "view" && (
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
              )}
            </div>

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
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  {mode === "edit" ? "Update" : "Add"} Inner SubCategory
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InnerSubCategoryModal;
