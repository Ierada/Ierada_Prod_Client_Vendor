import React, { useState, useEffect, useMemo } from "react";
import { addFabric } from "../../../services/api.fabric";
import {
  getCategories,
  getSubCategories,
  getInnerSubCategories,
} from "../../../services/api.category";
import { useToast } from "../../../context/ToastProvider";
import { useNavigate } from "react-router";

const AddFabric = () => {
  const notify = useToast();
  const successNotify = (message) => notify(message, "success");
  const errorNotify = (message) => notify(message, "error");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "",
    name: "",
    image: null,
    slug: "",
    status: true,
    selectionType: "category", // New field to track selection type
    categoryIds: [],
    subCategoryIds: [],
    innerSubCategoryIds: [],
  });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [innerSubCategories, setInnerSubCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
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
        } else {
          errorNotify("Failed to fetch categories");
        }

        if (subCategoryResponse?.status === 1 && subCategoryResponse?.data) {
          setSubCategories(subCategoryResponse.data);
        } else {
          errorNotify("Failed to fetch subcategories");
        }

        if (
          innerSubCategoryResponse?.status === 1 &&
          innerSubCategoryResponse?.data
        ) {
          setInnerSubCategories(innerSubCategoryResponse.data);
        } else {
          errorNotify("Failed to fetch inner subcategories");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        errorNotify("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter subcategories based on selected categories
  const filteredSubCategories = useMemo(() => {
    return subCategories.filter((subCat) =>
      categories.some((cat) => cat.id === subCat.cat_id)
    );
  }, [categories, subCategories]);

  // Filter inner subcategories based on selected subcategories
  const filteredInnerSubCategories = useMemo(() => {
    return innerSubCategories.filter((innerSubCat) =>
      subCategories.some((subCat) => subCat.id === innerSubCat.sub_cat_id)
    );
  }, [subCategories, innerSubCategories]);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (type === "file") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    } else if (type === "checkbox") {
      const id = parseInt(value);
      setFormData((prevData) => {
        const currentIds = prevData[name] || [];
        const newIds = checked
          ? [...currentIds, id]
          : currentIds.filter((cid) => cid !== id);
        return { ...prevData, [name]: newIds };
      });
    } else if (name === "selectionType") {
      setFormData((prevData) => ({
        ...prevData,
        selectionType: value,
        categoryIds: [],
        subCategoryIds: [],
        innerSubCategoryIds: [],
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("type", formData.type);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("image", formData.image);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("status", formData.status);

      // Only append the selected type's IDs
      if (formData.selectionType === "category") {
        formDataToSend.append(
          "categoryIds",
          JSON.stringify(formData.categoryIds)
        );
      } else if (formData.selectionType === "subCategory") {
        formDataToSend.append(
          "subCategoryIds",
          JSON.stringify(formData.subCategoryIds)
        );
      } else if (formData.selectionType === "innerSubCategory") {
        formDataToSend.append(
          "innerSubCategoryIds",
          JSON.stringify(formData.innerSubCategoryIds)
        );
      }

      const response = await addFabric(formDataToSend);
      if (response.status === 1) {
        setFormData({
          type: "",
          name: "",
          image: null,
          slug: "",
          status: true,
          selectionType: "category",
          categoryIds: [],
          subCategoryIds: [],
          innerSubCategoryIds: [],
        });
        successNotify("Fabric(s) added successfully");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error adding fabric:", error);
      errorNotify(error.response?.data?.message || "Failed to add fabric");
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-lg md:text-2xl font-bold text-[#333843] mb-4">
        Add New Fabric
      </h1>
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-[#F47954] border-r-[#F47954] border-b-transparent border-l-transparent"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
                placeholder="Enter fabric type"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
                placeholder="Enter fabric name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selection Type
              </label>
              <select
                name="selectionType"
                value={formData.selectionType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
              >
                <option value="category">Categories</option>
                <option value="subCategory">SubCategories</option>
                <option value="innerSubCategory">Inner SubCategories</option>
              </select>
            </div>

            {formData.selectionType === "category" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories (Optional)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        name="categoryIds"
                        value={category.id}
                        checked={formData.categoryIds.includes(category.id)}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 text-[#F47954] focus:ring-[#F47954] border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">
                        {category.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.selectionType === "subCategory" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SubCategories (Optional)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {filteredSubCategories.map((subCategory) => (
                    <div
                      key={subCategory.id}
                      className="flex items-center mb-2"
                    >
                      <input
                        type="checkbox"
                        name="subCategoryIds"
                        value={subCategory.id}
                        checked={formData.subCategoryIds.includes(
                          subCategory.id
                        )}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 text-[#F47954] focus:ring-[#F47954] border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">
                        {subCategory.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.selectionType === "innerSubCategory" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inner SubCategories (Optional)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {filteredInnerSubCategories.map((innerSub) => (
                    <div key={innerSub.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        name="innerSubCategoryIds"
                        value={innerSub.id}
                        checked={formData.innerSubCategoryIds.includes(
                          innerSub.id
                        )}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 text-[#F47954] focus:ring-[#F47954] border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">
                        {innerSub.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
                placeholder="Enter fabric slug"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#F47954] text-white rounded-md hover:bg-[#e46944]"
              >
                Add Fabric
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddFabric;
