import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import config from "../../../config/config";
import {
  getThemeById,
  createTheme,
  updateTheme,
} from "../../../services/api.producttheme";
import { getProductCatData } from "../../../services/api.product";

const ProductThemeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: null,
    is_active: true,
    product_id: null,
    cat_id: null,
    sub_cat_id: null,
    inner_sub_cat_id: null,
    slug: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [associationType, setAssociationType] = useState("none");
  const [productOptions, setProductOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [innerSubCategoryOptions, setInnerSubCategoryOptions] = useState([]);

  useEffect(() => {
    const fetchAllOptions = async () => {
      try {
        const productResponse = await getProductCatData("product");
        if (productResponse.status === 1) {
          setProductOptions(productResponse.data);
        }

        const categoryResponse = await getProductCatData("category");
        if (categoryResponse.status === 1) {
          setCategoryOptions(categoryResponse.data);
        }

        const subCategoryResponse = await getProductCatData("subCategory");
        if (subCategoryResponse.status === 1) {
          setSubCategoryOptions(subCategoryResponse.data);
        }

        const innerSubCategoryResponse = await getProductCatData(
          "innerSubCategory"
        );
        if (innerSubCategoryResponse.status === 1) {
          setInnerSubCategoryOptions(innerSubCategoryResponse.data);
        }
      } catch (err) {
        setError((prev) => ({ ...prev, general: "Failed to load options" }));
      }
    };

    fetchAllOptions();

    if (id) {
      loadTheme();
    }
  }, [id]);

  const loadTheme = async () => {
    try {
      setLoading(true);
      const response = await getThemeById(id);
      if (response.status === 1) {
        setFormData(response.data);
        if (response.data.image) {
          setPreviewImage(response.data.image);
        }
        // Determine association type
        if (response.data.product_id) {
          setAssociationType("product");
        } else if (response.data.cat_id) {
          setAssociationType("category");
        } else if (response.data.sub_cat_id) {
          setAssociationType("subCategory");
        } else if (response.data.inner_sub_cat_id) {
          setAssociationType("innerSubCategory");
        } else {
          setAssociationType("none");
        }
      } else {
        setError({ general: "Failed to load theme" });
      }
    } catch (err) {
      setError({ general: "Failed to load theme" });
    } finally {
      setLoading(false);
    }
  };

  const handleAssociationTypeChange = (e) => {
    const newType = e.target.value;
    setAssociationType(newType);
    setFormData((prev) => ({
      ...prev,
      product_id: null,
      cat_id: null,
      sub_cat_id: null,
      inner_sub_cat_id: null,
    }));
  };

  const validate = () => {
    let errors = {};

    if (!formData.title) errors.title = "Title is required.";
    if (!formData.slug) errors.slug = "Slug is required.";

    if (associationType !== "none") {
      if (associationType === "product" && !formData.product_id)
        errors.product_id = "Product is required.";
      else if (associationType === "category" && !formData.cat_id)
        errors.cat_id = "Category is required.";
      else if (associationType === "subCategory" && !formData.sub_cat_id)
        errors.sub_cat_id = "Subcategory is required.";
      else if (
        associationType === "innerSubCategory" &&
        !formData.inner_sub_cat_id
      )
        errors.inner_sub_cat_id = "Inner Subcategory is required.";
    }

    if (!id && !formData.image) errors.image = "Image is required.";

    setError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError({});

    try {
      const submissionData = new FormData();
      submissionData.append("title", formData.title);
      submissionData.append("subtitle", formData.subtitle);
      submissionData.append("description", formData.description);
      submissionData.append("slug", formData.slug);
      submissionData.append("is_active", formData.is_active);

      if (associationType === "product" && formData.product_id) {
        submissionData.append("product_id", formData.product_id);
      } else if (associationType === "category" && formData.cat_id) {
        submissionData.append("cat_id", formData.cat_id);
      } else if (associationType === "subCategory" && formData.sub_cat_id) {
        submissionData.append("sub_cat_id", formData.sub_cat_id);
      } else if (
        associationType === "innerSubCategory" &&
        formData.inner_sub_cat_id
      ) {
        submissionData.append("inner_sub_cat_id", formData.inner_sub_cat_id);
      }

      if (formData.image instanceof File) {
        submissionData.append("image", formData.image);
      }

      const response = id
        ? await updateTheme(id, submissionData)
        : await createTheme(submissionData);

      if (response.status === 1) {
        navigate(`${config.VITE_BASE_ADMIN_URL}/managethemes`);
      } else {
        setError({ general: response.message || "Failed to save theme" });
      }
    } catch (err) {
      setError({ general: "Failed to save theme" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() =>
              navigate(`${config.VITE_BASE_ADMIN_URL}/managethemes`)
            }
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold">
            {id ? "Edit Theme" : "Create New Theme"}
          </h1>
        </div>

        {error.general && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md">
            {error.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md"
                required
              />
              {error.title && (
                <p className="text-red-500 text-xs mt-1">{error.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md"
                rows="4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md"
                required
              />
              {error.slug && (
                <p className="text-red-500 text-xs mt-1">{error.slug}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Association (optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="typeNone"
                    name="associationType"
                    value="none"
                    checked={associationType === "none"}
                    onChange={handleAssociationTypeChange}
                    className="mr-2"
                  />
                  <label htmlFor="typeNone" className="text-sm">
                    None
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="typeProduct"
                    name="associationType"
                    value="product"
                    checked={associationType === "product"}
                    onChange={handleAssociationTypeChange}
                    className="mr-2"
                  />
                  <label htmlFor="typeProduct" className="text-sm">
                    Product
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="typeCategory"
                    name="associationType"
                    value="category"
                    checked={associationType === "category"}
                    onChange={handleAssociationTypeChange}
                    className="mr-2"
                  />
                  <label htmlFor="typeCategory" className="text-sm">
                    Category
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="typeSubCategory"
                    name="associationType"
                    value="subCategory"
                    checked={associationType === "subCategory"}
                    onChange={handleAssociationTypeChange}
                    className="mr-2"
                  />
                  <label htmlFor="typeSubCategory" className="text-sm">
                    Subcategory
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="typeInnerSubCategory"
                    name="associationType"
                    value="innerSubCategory"
                    checked={associationType === "innerSubCategory"}
                    onChange={handleAssociationTypeChange}
                    className="mr-2"
                  />
                  <label htmlFor="typeInnerSubCategory" className="text-sm">
                    Inner Subcategory
                  </label>
                </div>
              </div>
              {associationType !== "none" && (
                <div>
                  {associationType === "product" && (
                    <div>
                      <select
                        value={formData.product_id || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            product_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-md"
                      >
                        <option value="">Select a Product</option>
                        {productOptions.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                      {error.product_id && (
                        <p className="text-red-500 text-xs mt-1">
                          {error.product_id}
                        </p>
                      )}
                    </div>
                  )}
                  {associationType === "category" && (
                    <div>
                      <select
                        value={formData.cat_id || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cat_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-md"
                      >
                        <option value="">Select a Category</option>
                        {categoryOptions.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                      {error.cat_id && (
                        <p className="text-red-500 text-xs mt-1">
                          {error.cat_id}
                        </p>
                      )}
                    </div>
                  )}
                  {associationType === "subCategory" && (
                    <div>
                      <select
                        value={formData.sub_cat_id || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sub_cat_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-md"
                      >
                        <option value="">Select a Subcategory</option>
                        {subCategoryOptions.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.title}
                          </option>
                        ))}
                      </select>
                      {error.sub_cat_id && (
                        <p className="text-red-500 text-xs mt-1">
                          {error.sub_cat_id}
                        </p>
                      )}
                    </div>
                  )}
                  {associationType === "innerSubCategory" && (
                    <div>
                      <select
                        value={formData.inner_sub_cat_id || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            inner_sub_cat_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-md"
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
                      {error.inner_sub_cat_id && (
                        <p className="text-red-500 text-xs mt-1">
                          {error.inner_sub_cat_id}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.files[0] });
                  setPreviewImage(URL.createObjectURL(e.target.files[0]));
                }}
                className="w-full px-4 py-2 border rounded-md"
              />
              {error.image && (
                <p className="text-red-500 text-xs mt-1">{error.image}</p>
              )}
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="mt-4 w-32 h-32 object-cover rounded"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.is_active}
                  onChange={() => setFormData({ ...formData, is_active: true })}
                  className="mr-2"
                />
                Active
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!formData.is_active}
                  onChange={() =>
                    setFormData({ ...formData, is_active: false })
                  }
                  className="mr-2"
                />
                Inactive
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() =>
                navigate(`${config.VITE_BASE_ADMIN_URL}/managethemes`)
              }
              className="px-6 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : id ? "Update Theme" : "Create Theme"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductThemeEditor;
