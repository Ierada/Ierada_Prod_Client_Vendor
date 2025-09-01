import React, { useEffect, useState } from "react";
import { editFabric } from "../../../services/api.fabric";
import {
  getCategories,
  getSubCategories,
  getInnerSubCategories,
} from "../../../services/api.category";
import { X } from "lucide-react";

const FabricModal = ({ isOpen, onClose, mode, fabric }) => {
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    image: null,
    slug: "",
    categoryId: "",
    subCategoryId: "",
    innerSubCategoryId: "",
  });
  const [imageFile, setImageFile] = useState({
    file: null,
    preview: null,
  });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [innerSubCategories, setInnerSubCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          categoryResponse,
          subCategoryResponse,
          innerSubCategoryResponse,
        ] = await Promise.all([
          getCategories(),
          getSubCategories(),
          getInnerSubCategories(),
        ]);

        if (categoryResponse?.status === 1 && categoryResponse?.data) {
          setCategories(categoryResponse.data);
        }
        if (subCategoryResponse?.status === 1 && subCategoryResponse?.data) {
          setSubCategories(subCategoryResponse.data);
        }
        if (
          innerSubCategoryResponse?.status === 1 &&
          innerSubCategoryResponse?.data
        ) {
          setInnerSubCategories(innerSubCategoryResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (fabric && mode !== "add") {
      setFormData({
        type: fabric.type || "",
        name: fabric.name || "",
        image: fabric.image || "",
        slug: fabric.slug || "",
        categoryId: fabric.categoryId || "",
        subCategoryId: fabric.subCategoryId || "",
        innerSubCategoryId: fabric.innerSubCategoryId || "",
      });
      setImageFile({
        file: null,
        preview: fabric.image || null,
      });
    }
  }, [fabric, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset lower levels when a higher level changes
      ...(name === "categoryId" && {
        subCategoryId: "",
        innerSubCategoryId: "",
      }),
      ...(name === "subCategoryId" && {
        innerSubCategoryId: "",
      }),
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (
          (key === "categoryId" && !formData[key]) ||
          (key === "subCategoryId" && !formData[key]) ||
          (key === "innerSubCategoryId" && !formData[key])
        ) {
          return; // Skip empty IDs
        }
        formDataToSend.append(key, formData[key]);
      });

      if (imageFile.file) {
        formDataToSend.append("image", imageFile.file);
      }

      await editFabric(fabric.id, formDataToSend);
      onClose();
    } catch (error) {
      console.error("Failed to update fabric:", error.message);
    }
  };

  // Filter subcategories based on selected category
  const filteredSubCategories = subCategories.filter(
    (subCat) => subCat.cat_id === formData.categoryId
  );

  // Filter inner subcategories based on selected subcategory
  const filteredInnerSubCategories = innerSubCategories.filter(
    (innerSubCat) => innerSubCat.sub_cat_id === formData.subCategoryId
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl text-black font-semibold mb-6">
          {mode === "view"
            ? "View Fabric"
            : mode === "edit"
            ? "Edit Fabric"
            : "Add Fabric"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            {mode === "view" ? (
              <p>{formData.type}</p>
            ) : (
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            {mode === "view" ? (
              <p>{formData.name}</p>
            ) : (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional)
            </label>
            {mode === "view" ? (
              <p>
                {categories.find((c) => c.id === formData.categoryId)?.title ||
                  "No Category"}
              </p>
            ) : (
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SubCategory (Optional)
            </label>
            {mode === "view" ? (
              <p>
                {subCategories.find((sc) => sc.id === formData.subCategoryId)
                  ?.title || "No SubCategory"}
              </p>
            ) : (
              <select
                name="subCategoryId"
                value={formData.subCategoryId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                disabled={!formData.categoryId}
              >
                <option value="">Select a subcategory</option>
                {filteredSubCategories.map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inner SubCategory (Optional)
            </label>
            {mode === "view" ? (
              <p>
                {innerSubCategories.find(
                  (isc) => isc.id === formData.innerSubCategoryId
                )?.title || "No Inner SubCategory"}
              </p>
            ) : (
              <select
                name="innerSubCategoryId"
                value={formData.innerSubCategoryId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                disabled={!formData.subCategoryId}
              >
                <option value="">Select an inner subcategory</option>
                {filteredInnerSubCategories.map((innerSub) => (
                  <option key={innerSub.id} value={innerSub.id}>
                    {innerSub.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
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
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            )}
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fabric Image
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
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Update Fabric
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FabricModal;
