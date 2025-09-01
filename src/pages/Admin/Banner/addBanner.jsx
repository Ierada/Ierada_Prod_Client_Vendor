import React, { useState, useEffect } from "react";
import { CiImageOn } from "react-icons/ci";
import { BsCameraVideo } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import {
  addBanners,
  updateBanner,
  getBannerById,
} from "../../../services/api.banner";
import {
  getCategories,
  getSubCategories,
  getInnerSubCategories,
} from "../../../services/api.category";
import { useParams, useNavigate } from "react-router-dom";

const BannerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [innerSubCategories, setInnerSubCategories] = useState([]);
  const [error, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    banner: null,
    mobile_image: null,
    title: "",
    subtitle: "",
    positions: "hometop",
    link_type: "direct_link",
    link: "",
    file_type: "image",
    cat_id: "",
    subcat_id: "",
    inner_subcat_id: "",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mobilePreviewUrl, setMobilePreviewUrl] = useState(null);

  // Fetch categories and banner data (if editing) on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch all category data
        const [catRes, subCatRes, innerSubCatRes] = await Promise.all([
          getCategories(),
          getSubCategories(),
          getInnerSubCategories(),
        ]);

        setCategories(
          catRes.data?.map((data) => ({
            id: data.id,
            name: data.title,
          })) || []
        );

        setSubCategories(
          subCatRes.data?.map((data) => ({
            id: data.id,
            name: data.title,
            categoryId: data.cat_id,
          })) || []
        );

        setInnerSubCategories(
          innerSubCatRes.data?.map((data) => ({
            id: data.id,
            name: data.title,
            subCategoryId: data.sub_cat_id,
          })) || []
        );

        // If editing, fetch the banner data
        if (isEditing) {
          const bannerRes = await getBannerById(id);
          if (bannerRes?.data) {
            const bannerData = bannerRes.data;

            setFormData({
              title: bannerData.title || "",
              subtitle: bannerData.subtitle || "",
              positions: bannerData.positions || "hometop",
              link_type: bannerData.link_type || "direct_link",
              link: bannerData.link || "",
              file_type: bannerData.file_type || "image",
              cat_id: bannerData.cat_id || "",
              subcat_id: bannerData.subcat_id || "",
              inner_subcat_id: bannerData.inner_subcat_id || "",
              banner: null,
              mobile_image: null,
            });

            // Set preview URLs for the existing files
            if (bannerData.file_url) {
              setPreviewUrl(bannerData.file_url);
            }
            if (bannerData.mobile_image_url) {
              setMobilePreviewUrl(bannerData.mobile_image_url);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (!file) return;

      if (name === "banner") {
        setFormData((prev) => ({
          ...prev,
          banner: file,
        }));
        const fileUrl = URL.createObjectURL(file);
        setPreviewUrl(fileUrl);

        // Set file_type based on the file's MIME type
        const isVideo = file.type.startsWith("video/");
        setFormData((prev) => ({
          ...prev,
          file_type: isVideo ? "video" : "image",
        }));
      } else if (name === "mobile_image") {
        setFormData((prev) => ({
          ...prev,
          mobile_image: file,
        }));
        const mobileFileUrl = URL.createObjectURL(file);
        setMobilePreviewUrl(mobileFileUrl);
      }
    } else if (type === "radio") {
      if (name === "link_type") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          link: "",
          cat_id: "",
          subcat_id: "",
          inner_subcat_id: "",
        }));
      } else if (name === "file_type") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          banner: null,
          mobile_image: null,
        }));
        setPreviewUrl(null);
        setMobilePreviewUrl(null);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};

    // Basic validation
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.subtitle.trim()) newErrors.subtitle = "Subtitle is required.";

    // Link type specific validation
    switch (formData.link_type) {
      case "direct_link":
        if (!formData.link.trim()) {
          newErrors.link = "Link is required.";
        } else if (
          !/^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(formData.link)
        ) {
          newErrors.link = "Enter a valid URL.";
        }
        break;
      case "category":
        if (!formData.cat_id) newErrors.cat_id = "Category is required.";
        break;
      case "subcategory":
        if (!formData.cat_id) newErrors.cat_id = "Category is required.";
        if (!formData.subcat_id)
          newErrors.subcat_id = "Subcategory is required.";
        break;
      case "innersubcategory":
        if (!formData.cat_id) newErrors.cat_id = "Category is required.";
        if (!formData.subcat_id)
          newErrors.subcat_id = "Subcategory is required.";
        if (!formData.inner_subcat_id)
          newErrors.inner_subcat_id = "Inner subcategory is required.";
        break;
    }

    // File validation only required for new banners or when changing the file
    if (!isEditing || formData.banner) {
      if (!formData.banner && !previewUrl) {
        newErrors.banner = `${
          formData.file_type === "image" ? "Image" : "Video"
        } is required.`;
      }
    }

    // Mobile image validation for image-type banners
    if (
      formData.file_type === "image" &&
      (!isEditing || formData.mobile_image)
    ) {
      if (!formData.mobile_image && !mobilePreviewUrl) {
        newErrors.mobile_image = "Mobile image is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = new FormData();

    // Add all form data except the files
    Object.keys(formData).forEach((key) => {
      if (
        key !== "banner" &&
        key !== "mobile_image" &&
        formData[key] !== null &&
        formData[key] !== ""
      ) {
        submitData.append(key, formData[key]);
      }
    });

    // Add the files
    if (formData.banner) {
      submitData.append("banner", formData.banner);
    }
    if (formData.mobile_image) {
      submitData.append("mobile_image", formData.mobile_image);
    }

    try {
      setLoading(true);
      let response;

      if (isEditing) {
        response = await updateBanner(id, submitData);
      } else {
        response = await addBanners(submitData);
      }

      if (response?.status === 1) {
        navigate(-1);
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "submitting"} banner:`,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Banner size guidelines based on file type
  const getSizeGuidelines = () => {
    if (formData.file_type === "image") {
      return (
        <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-medium text-blue-800">
            Image Banner Guidelines:
          </h4>
          <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
            <li>Desktop Image: 1920×550 pixels (16:9 ratio)</li>
            <li>Mobile Image: 768×432 pixels (16:9 ratio)</li>
            <li>Maximum file size: 5MB</li>
            <li>Supported formats: JPG, PNG, WebP</li>
            <li>
              For best results, use high-quality images with good contrast for
              text visibility
            </li>
          </ul>
        </div>
      );
    } else {
      return (
        <div className="mt-2 p-4 bg-purple-50 rounded-lg border border-purple-100">
          <h4 className="font-medium text-purple-800">
            Video Banner Guidelines:
          </h4>
          <ul className="list-disc list-inside text-sm text-purple-700 mt-2 space-y-1">
            <li>Recommended resolution: 1920×1080 pixels (16:9 ratio)</li>
            <li>Recommended duration: 15-30 seconds</li>
            <li>Maximum file size: 50MB</li>
            <li>Supported formats: MP4, WebM</li>
            <li>For best performance, use H.264 codec for MP4 files</li>
            <li>Consider adding subtle motion to enhance visual impact</li>
          </ul>
        </div>
      );
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F47954]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        {isEditing ? "Edit Banner" : "Add a New Banner"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              placeholder="Enter banner title"
            />
            {error.title && (
              <p className="text-red-500 text-sm">{error.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subtitle
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              placeholder="Enter banner subtitle"
            />
            {error.subtitle && (
              <p className="text-red-500 text-sm">{error.subtitle}</p>
            )}
          </div>

          {/* Link Type Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Link Type
            </label>
            <div className="space-y-2">
              {[
                { value: "direct_link", label: "Direct Link" },
                { value: "category", label: "Category" },
                { value: "subcategory", label: "Subcategory" },
                { value: "innersubcategory", label: "Inner Subcategory" },
              ].map((type) => (
                <div key={type.value} className="flex items-center">
                  <input
                    type="radio"
                    id={type.value}
                    name="link_type"
                    value={type.value}
                    checked={formData.link_type === type.value}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <label
                    htmlFor={type.value}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Link Fields */}
          {formData.link_type === "direct_link" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Link URL
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                placeholder="Enter URL"
              />
              {error.link && (
                <p className="text-red-500 text-sm">{error.link}</p>
              )}
            </div>
          )}

          {(formData.link_type === "category" ||
            formData.link_type === "subcategory" ||
            formData.link_type === "innersubcategory") && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="cat_id"
                value={formData.cat_id}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {error.cat_id && (
                <p className="text-red-500 text-sm">{error.cat_id}</p>
              )}
            </div>
          )}

          {(formData.link_type === "subcategory" ||
            formData.link_type === "innersubcategory") &&
            formData.cat_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <select
                  name="subcat_id"
                  value={formData.subcat_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                >
                  <option value="">Select Subcategory</option>
                  {subCategories
                    .filter(
                      (sub) =>
                        String(sub.categoryId) === String(formData.cat_id)
                    )
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                </select>
                {error.subcat_id && (
                  <p className="text-red-500 text-sm">{error.subcat_id}</p>
                )}
              </div>
            )}

          {formData.link_type === "innersubcategory" && formData.subcat_id && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Inner Subcategory
              </label>
              <select
                name="inner_subcat_id"
                value={formData.inner_subcat_id}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              >
                <option value="">Select Inner Subcategory</option>
                {innerSubCategories
                  .filter(
                    (inner) =>
                      String(inner.subCategoryId) === String(formData.subcat_id)
                  )
                  .map((inner) => (
                    <option key={inner.id} value={inner.id}>
                      {inner.name}
                    </option>
                  ))}
              </select>
              {error.inner_subcat_id && (
                <p className="text-red-500 text-sm">{error.inner_subcat_id}</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          {/* File Type Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              File Type
            </label>
            <div className="space-y-2">
              {[
                { value: "image", label: "Image", icon: CiImageOn },
                { value: "video", label: "Video", icon: BsCameraVideo },
              ].map((type) => (
                <div key={type.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`file_type_${type.value}`}
                    name="file_type"
                    value={type.value}
                    checked={formData.file_type === type.value}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <label
                    htmlFor={`file_type_${type.value}`}
                    className="ml-2 text-sm text-gray-700 flex items-center"
                  >
                    <type.icon className="mr-1 text-lg" />
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* File Upload for Main Banner */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Upload {formData.file_type === "image" ? "Image" : "Video"}
              </label>
            </div>

            {getSizeGuidelines()}

            <div
              className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => document.getElementById("file-upload").click()}
            >
              <input
                id="file-upload"
                type="file"
                name="banner"
                accept={formData.file_type === "image" ? "image/*" : "video/*"}
                onChange={handleInputChange}
                className="hidden"
              />
              {formData.file_type === "image" ? (
                <CiImageOn className="mx-auto h-12 w-12 text-gray-400" />
              ) : (
                <BsCameraVideo className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <p className="mt-2 text-sm text-gray-600">
                Click to upload banner{" "}
                {formData.file_type === "image" ? "image" : "video"}
              </p>
              {formData.banner && (
                <p className="mt-2 text-sm text-gray-500">
                  {formData.banner.name}
                </p>
              )}
              {!formData.banner && previewUrl && (
                <p className="mt-2 text-sm text-gray-500">
                  Current {formData.file_type} (click to change)
                </p>
              )}
            </div>
            {error.banner && (
              <p className="text-red-500 text-sm">{error.banner}</p>
            )}
          </div>

          {/* File Upload for Mobile Image (only for image type) */}
          {formData.file_type === "image" && (
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Mobile Image
                </label>
              </div>

              <div
                className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() =>
                  document.getElementById("mobile-file-upload").click()
                }
              >
                <input
                  id="mobile-file-upload"
                  type="file"
                  name="mobile_image"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
                <CiImageOn className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload mobile image
                </p>
                {formData.mobile_image && (
                  <p className="mt-2 text-sm text-gray-500">
                    {formData.mobile_image.name}
                  </p>
                )}
                {!formData.mobile_image && mobilePreviewUrl && (
                  <p className="mt-2 text-sm text-gray-500">
                    Current mobile image (click to change)
                  </p>
                )}
              </div>
              {error.mobile_image && (
                <p className="text-red-500 text-sm">{error.mobile_image}</p>
              )}
            </div>
          )}

          {/* Preview Section */}
          {(previewUrl || mobilePreviewUrl) && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="relative border rounded-lg overflow-hidden">
                {formData.file_type === "image" ? (
                  <>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600">
                        Desktop Image Preview
                      </p>
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Banner preview"
                          className="w-full h-48 object-cover"
                        />
                      )}
                    </div>
                    {formData.file_type === "image" && mobilePreviewUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Mobile Image Preview
                        </p>
                        <img
                          src={mobilePreviewUrl}
                          alt="Mobile banner preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  previewUrl && (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-48 object-cover"
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#F47954] text-white rounded-md hover:bg-[#e66a45] transition-colors disabled:bg-gray-400"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              </span>
            ) : (
              `${isEditing ? "Update" : "Save"} Banner`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerForm;
