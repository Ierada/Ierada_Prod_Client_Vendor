import React, { useState, useEffect } from "react";
import {
  addSubCategory,
  getCategories,
  getSubCategoryById,
  updateSubCategory,
} from "../../../services/api.category";
import {
  notifyOnSuccess,
  notifyOnFail,
} from "../../../utils/notification/toast";
import slugify from "slugify";
import { useNavigate, useSearchParams } from "react-router-dom";
import config from "../../../config/config";
import { AiOutlineInfoCircle } from "react-icons/ai";

const AddSubCategory = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    cat_id: null,
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
    is_featured: false,
    is_instant_return: false,
    openbox_delivery: false,
    base_product_value: 0,
    instant_return_charge: 0,
    is_toodler: false,
    is_returnable: true,
  });
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const updateMode = id ? true : false;

  const [previewImage, setPreviewImage] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cat_id) newErrors.cat_id = "Category ID is required";
    if (!formData.title.trim())
      newErrors.title = "SubCategory Name is required";
    if (!formData.subtitle.trim())
      newErrors.subtitle = "Subtitle Name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!validateSlug(formData.slug)) newErrors.slug = "Invalid slug format";
    if (!formData.meta_title.trim())
      newErrors.meta_title = "Meta Title is required";
    if (!formData.meta_description.trim())
      newErrors.meta_description = "Meta Description is required";
    if (!formData.image && !updateMode)
      newErrors.image = "SubCategory image is required";
    if (
      !formData.base_product_value &&
      (formData.is_instant_return || formData.openbox_delivery)
    ) {
      newErrors.base_product_value = "Base Product Value is required";
    }
    if (!formData.instant_return_charge && formData.is_instant_return) {
      newErrors.instant_return_charge = "Instant Return Charge is required";
    }
    if (formData.tax_type && !formData.tax) {
      newErrors.tax = "Tax value is required when tax type is selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
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
    } else if (name === "is_toodler") {
      setFormData((prev) => ({
        ...prev,
        is_toodler: checked,
        is_instant_return: checked ? false : prev.is_instant_return,
        instant_return_charge: checked ? 0 : prev.instant_return_charge, // Clear instant_return_charge if Toodler is checked
      }));
    } else if (name === "is_instant_return") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        instant_return_charge: checked ? prev.instant_return_charge : 0,
        base_product_value:
          checked || prev.openbox_delivery ? prev.base_product_value : 0,
      }));
    } else if (name === "openbox_delivery") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        base_product_value:
          checked || prev.is_instant_return ? prev.base_product_value : 0,
      }));
    } else if (name === "tax_type" && value === "") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        tax: 0.0, // Reset tax value when tax_type is empty
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = Number(e.target.value);
    setSelectedCategory(categories.find((cat) => cat.id === categoryId));
    setFormData((prev) => ({ ...prev, cat_id: categoryId }));
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
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          formPayload.append(key, formData[key]);
        }
      });

      const response = updateMode
        ? await updateSubCategory(id, formPayload)
        : await addSubCategory(formPayload);

      if (response.status === 1) {
        navigate(`${config.VITE_BASE_ADMIN_URL}/subcategories/list`);
      }
    } catch (error) {
      notifyOnFail(
        updateMode
          ? "Failed to update SubCategory"
          : "Failed to add SubCategory"
      );
    }
  };

  const getAllCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      notifyOnFail("Failed to fetch categories");
    }
  };

  useEffect(() => {
    const fetchSubCategoryData = async () => {
      try {
        const response = await getSubCategoryById(id);
        if (response && response.data) {
          const data = response.data;

          // Set preview image if it exists
          if (data.image) {
            setPreviewImage(data.image);
          }

          setFormData({
            cat_id: data.cat_id,
            title: data.title || "",
            subtitle: data.subtitle || "",
            discount: data.discount || "",
            hsn_code: data.hsn_code || "",
            tax: data.tax || 0.0,
            tax_type: data.tax_type || "",
            slug: data.slug || "",
            meta_title: data.meta_title || "",
            meta_description: data.meta_description || "",
            image: null, // Don't set the file object, just the preview
            is_featured: data.is_featured || false,
            is_instant_return: data.is_instant_return || false,
            openbox_delivery: data.openbox_delivery || false,
            base_product_value: data.base_product_value || 0,
            instant_return_charge: data.instant_return_charge || 0,
            is_toodler: data.is_toodler || false,
            is_returnable: data.is_returnable !== false, // Default to true if not specified
          });

          setSelectedCategory(categories.find((cat) => cat.id === data.cat_id));
        }
      } catch (error) {
        notifyOnFail("Failed to fetch subcategory data");
      }
    };

    getAllCategories();

    if (updateMode && id) {
      fetchSubCategoryData();
    }
  }, [id, updateMode]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {updateMode ? "Edit SubCategory" : "Create New SubCategory"}
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
                    alt="SubCategory preview"
                    className="w-full h-48 object-cover rounded-lg"
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

              {/* Image Guidelines */}
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
          </div>

          <div className="flex flex-col w-full">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-6">
                {updateMode ? "Edit SubCategory" : "Add a new SubCategory"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="cat_id"
                    value={formData.cat_id || ""}
                    onChange={handleCategoryChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                  {errors.cat_id && (
                    <p className="text-red-500 text-sm">{errors.cat_id}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SubCategory Name
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                      HSN Code
                    </label>
                    <input
                      type="text"
                      name="hsn_code"
                      value={formData.hsn_code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter HSN Code"
                    />
                    {errors.hsn_code && (
                      <p className="text-red-500 text-sm">{errors.hsn_code}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Type
                    </label>
                    <select
                      name="tax_type"
                      value={formData.tax_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">None</option>
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </select>
                    {errors.tax_type && (
                      <p className="text-red-500 text-sm">{errors.tax_type}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Value
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="tax"
                      value={formData.tax}
                      onChange={handleInputChange}
                      disabled={!formData.tax_type}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter tax value"
                    />
                    {errors.tax && (
                      <p className="text-red-500 text-sm">{errors.tax}</p>
                    )}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Type meta description here..."
                    rows="3"
                  ></textarea>
                  {errors.meta_description && (
                    <p className="text-red-500 text-sm">
                      {errors.meta_description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_featured"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="mr-2"
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
                      id="is_returnable"
                      name="is_returnable"
                      checked={formData.is_returnable}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label
                      htmlFor="is_returnable"
                      className="text-sm font-medium text-gray-700"
                    >
                      Is Returnable
                    </label>
                  </div>

                  {selectedCategory?.has_age_group && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_toodler"
                        name="is_toodler"
                        checked={formData.is_toodler}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label
                        htmlFor="is_toodler"
                        className="text-sm font-medium text-gray-700"
                      >
                        Is Toddler
                      </label>
                    </div>
                  )}

                  {!formData.is_toodler && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_instant_return"
                        name="is_instant_return"
                        checked={formData.is_instant_return}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label
                        htmlFor="is_instant_return"
                        className="text-sm font-medium text-gray-700"
                      >
                        Instant Return Available
                      </label>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="openbox_delivery"
                      name="openbox_delivery"
                      checked={formData.openbox_delivery}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label
                      htmlFor="openbox_delivery"
                      className="text-sm font-medium text-gray-700"
                    >
                      Open Box Delivery
                    </label>
                  </div>
                </div>

                {(formData.is_instant_return || formData.openbox_delivery) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Base Product Value
                      </label>
                      <input
                        type="number"
                        name="base_product_value"
                        value={formData.base_product_value}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      {errors.base_product_value && (
                        <p className="text-red-500 text-sm">
                          {errors.base_product_value}
                        </p>
                      )}
                    </div>

                    {formData.is_instant_return && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Instant Return Charge
                        </label>
                        <input
                          type="number"
                          name="instant_return_charge"
                          value={formData.instant_return_charge}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        {errors.instant_return_charge && (
                          <p className="text-red-500 text-sm">
                            {errors.instant_return_charge}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `${config.VITE_BASE_ADMIN_URL}/subcategories/list`
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
                    {updateMode ? "Update" : "Add"}
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

export default AddSubCategory;
