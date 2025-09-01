import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  updateSubCategory,
  getCategories,
  getSubCategories,
} from "../../../services/api.category";

const SubCategoryModal = ({ isOpen, onClose, mode, subCategory }) => {
  const [subcategories, setSubCategories] = useState([]);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    cat_id: "null",
    title: "",
    subtitle: "",
    discount: "",
    meta_title: "",
    meta_description: "",
    slug: "",
    is_featured: false,
    is_instant_return: false,
    is_normal_return: false,
    openbox_delivery: false,
    image: "",
  });

  const [imageFile, setImageFile] = useState({
    file: null,
    preview: null,
  });

  const getAllCategories = async () => {
    const res = await getCategories();
    const formattedCategory = res.data?.map((data) => ({
      id: data.id,
      name: data.title,
    }));
    setCategories(formattedCategory);
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  // const getAllSubCategories = async () => {
  //   const res = await getSubCategories();
  //   const formattedCategory = res.data?.map((data) => ({
  //     id: data.id,
  //   }));
  //   setSubCategories(formattedCategory);
  // };

  // useEffect(() => {
  //   getAllSubCategories();
  // }, []);

  useEffect(() => {
    if (subCategory && mode !== "add") {
      setFormData({
        cat_id: subCategory.cat_id || "",
        title: subCategory.title || "",
        subtitle: subCategory.subtitle || "",
        discount: subCategory.discount || "",
        meta_title: subCategory.meta_title || "",
        meta_description: subCategory.meta_description || "",
        slug: subCategory.slug || "",
        is_featured: subCategory.is_featured || false,
        is_instant_return: subCategory.is_instant_return || false,
        is_normal_return: subCategory.is_normal_return || false,
        openbox_delivery: subCategory.openbox_delivery || false,
        image: subCategory.image || "",
        base_product_value: subCategory.base_product_value || "",
        instant_return_charge: subCategory.instant_return_charge || "",
        is_toodler: subCategory.is_toodler || false,
        is_returnable: subCategory.is_returnable || false,
      });

      setImageFile({
        file: null,
        preview: subCategory.image || null,
      });
    }
  }, [subCategory, mode]);

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

  const removeImage = () => {
    setImageFile({
      file: null,
      preview: null,
    });
  };

  const validateForm = () => {
    if (
      !formData.cat_id ||
      !formData.title ||
      !formData.slug ||
      (!imageFile.file && !imageFile.preview)
    ) {
      alert("Category, Title, Slug, and Image are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    if (imageFile.file) {
      formDataToSend.append("image", imageFile.file);
    }

    try {
      await updateSubCategory(subCategory?.id, formDataToSend);
      if (response.status === 1) {
        await getSubCategories();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting sub-category:", error);
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
                ? "View SubCategory"
                : mode === "edit"
                ? "Edit SubCategory"
                : "Add SubCategory"}
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
                    Category
                  </label>
                  {mode === "view" ? (
                    <p>
                      {categories.find(
                        (category) => category.id === formData.cat_id
                      )?.name || "N/A"}
                    </p>
                  ) : (
                    <select
                      name="cat_id"
                      d
                      value={formData.cat_id}
                      onChange={(e) => {
                        handleInputChange(e);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                    >
                      <option value="" disabled selected>
                        Select Category Id
                      </option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
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

                {/* <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Discount (%)
                  </label>
                  {mode === "view" ? (
                    <p>{formData.discount}</p>
                  ) : (
                    <input
                      type='number'
                      name='discount'
                      value={formData.discount}
                      onChange={handleInputChange}
                      className='w-full p-2 border rounded-md'
                      min='0'
                      max='100'
                    />
                  )}
                </div> */}

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
                    Featured
                  </label>
                  {mode === "view" ? (
                    <p>{formData.is_featured ? "Yes" : "No"}</p>
                  ) : (
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instant Return Available
                  </label>
                  {mode === "view" ? (
                    <p>{formData.is_instant_return ? "Yes" : "No"}</p>
                  ) : (
                    <input
                      type="checkbox"
                      name="is_instant_return"
                      checked={formData.is_instant_return}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Open Box Delivery
                  </label>
                  {mode === "view" ? (
                    <p>{formData.openbox_delivery ? "Yes" : "No"}</p>
                  ) : (
                    <input
                      type="checkbox"
                      name="openbox_delivery"
                      checked={formData.openbox_delivery}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is Returnable
                  </label>
                  {mode === "view" ? (
                    <p>{formData.is_returnable ? "Yes" : "No"}</p>
                  ) : (
                    <input
                      type="checkbox"
                      name="is_returnable"
                      checked={formData.is_returnable}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is Toodler
                  </label>
                  {mode === "view" ? (
                    <p>{formData.is_toodler ? "Yes" : "No"}</p>
                  ) : (
                    <input
                      type="checkbox"
                      name="is_toodler"
                      checked={formData.is_toodler}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4"
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instant Return Charge
              </label>
              {mode === "view" ? (
                <p>{formData.instant_return_charge}</p>
              ) : (
                <input
                  type="number"
                  name="instant_return_charge"
                  value={formData.instant_return_charge}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  max="100"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Product Value
              </label>
              {mode === "view" ? (
                <p>{formData.base_product_value}</p>
              ) : (
                <input
                  type="number"
                  name="base_product_value"
                  value={formData.base_product_value}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  max="100"
                />
              )}
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SubCategory Image
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
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-gray-800"
                >
                  Update SubCategory
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubCategoryModal;
