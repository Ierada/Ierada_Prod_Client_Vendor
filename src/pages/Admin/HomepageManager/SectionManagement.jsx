import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ArrowLeft, Plus, X, ExternalLink } from "lucide-react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { getAllSliders } from "../../../services/api.slider";
import { getAllProducts } from "../../../services/api.product";
import {
  getCategories,
  getSubCategories,
} from "../../../services/api.category";
import { getBannersByType } from "../../../services/api.banner";
import {
  createSection,
  getSectionById,
  updateSection,
} from "../../../services/api.homepage";
import config from "../../../config/config";
import { getActiveOffer } from "../../../services/api.offers";
import defaultImg from "/assets/bg/empty-img2.svg";

const sectionTypeConfigs = {
  slider: {
    title: "Slider Section",
    description: "Add multiple sliders with images or videos",
    multiSelect: true,
    singleSelect: false,
    fetchApi: getAllSliders,
    renderOption: (item) => ({
      title: item.title,
      media:
        item.file_type === "video" ? (
          <video
            src={`${item.image || defaultImg}`}
            className="w-20 h-20 object-cover rounded"
          />
        ) : (
          <img
            src={`${item.image || defaultImg}`}
            className="w-20 h-20 object-cover rounded"
            alt={item.title}
          />
        ),
    }),
  },
  product_collection: {
    title: "Product Collection",
    description: "Select multiple products to display",
    multiSelect: true,
    singleSelect: false,
    fetchApi: getAllProducts,
    renderOption: (item) => ({
      title: item.name,
      media: (
        <img
          src={item.image || defaultImg}
          className="w-20 h-20 object-cover rounded"
          alt={item.name}
        />
      ),
    }),
  },
  category_collection: {
    title: "Category Collection",
    description: "Select multiple categories to display",
    multiSelect: true,
    singleSelect: false,
    fetchApi: getCategories,
    renderOption: (item) => ({
      title: item.title,
      media: (
        <img
          src={item.image || defaultImg}
          className="w-20 h-20 object-cover rounded"
          alt={item.title}
        />
      ),
    }),
  },
  subcategory_collection: {
    title: "Subcategory Collection",
    description: "Select multiple subcategories to display",
    multiSelect: true,
    singleSelect: false,
    fetchApi: getSubCategories,
    renderOption: (item) => ({
      title: item.title,
      media: (
        <img
          src={item.image || defaultImg}
          className="w-20 h-20 object-cover rounded"
          alt={item.title}
        />
      ),
    }),
  },
  banner: {
    title: "Banner Section",
    description: "Add a banner with image",
    multiSelect: false,
    singleSelect: true,
    fetchApi: () => getBannersByType("image"),
    renderOption: (item) => ({
      title: item.title,
      media: (
        <img
          src={item.file_url || defaultImg}
          className="w-20 h-20 object-cover rounded"
          alt={item.title}
        />
      ),
    }),
  },
  video: {
    title: "Video Section",
    description: "Add multiple video banners",
    multiSelect: true,
    singleSelect: false,
    fetchApi: () => getBannersByType("video"),
    renderOption: (item) => ({
      title: item.title,
      media: (
        <video src={item.file_url} className="w-20 h-20 object-cover rounded" />
      ),
    }),
  },
  featured_products: {
    title: "Featured Products",
    description: "Automatically displays featured products",
    multiSelect: false,
    singleSelect: false,
  },
  trending_products: {
    title: "Trending Products & Browse History",
    description: "Automatically displays trending products",
    multiSelect: false,
    singleSelect: false,
  },
  brand_logos: {
    title: "Brand Logos",
    description: "Add multiple brand logos",
    customContent: true,
    multiContent: true,
    defaultContent: {
      image: "",
    },
  },
  download_app: {
    title: "Download App Section",
    description: "Configure app download information",
    customContent: true,
    defaultContent: {
      title: "",
      subtitle: "",
      description: "",
      image: "",
      android_link: "",
      ios_link: "",
    },
  },
  subcategory_grid: {
    title: "Subcategory Grid",
    description: "Select multiple subcategories",
    multiSelect: true,
    singleSelect: false,
    fetchApi: () => getSubCategories(),
    renderOption: (item) => ({
      title: item.title,
      media: (
        <img
          src={item.image || defaultImg}
          className="w-20 h-20 object-cover rounded"
          alt={item.title}
        />
      ),
    }),
  },
  service_features: {
    title: "Service Features",
    description: "Automatically displays the features",
    multiSelect: false,
    singleSelect: false,
  },
  // service_features: {
  //   title: "Service Features",
  //   description: "Add multiple service features",
  //   customContent: true,
  //   multiContent: true,
  //   defaultContent: {
  //     title: "",
  //     subtitle: "",
  //     icon: "",
  //   },
  // },
  offer_collection: {
    title: "Offer Collection",
    description: "Select multiple offers to display",
    multiSelect: true,
    singleSelect: false,
    fetchApi: getActiveOffer,
    renderOption: (item) => ({
      title: item.title,
      media: (
        <img
          src={item.image || defaultImg}
          className="w-20 h-20 object-cover rounded"
          alt={item.title}
        />
      ),
    }),
  },
  offer_slider: {
    title: "Offer Slider",
    description: "Select multiple offers to display",
    multiSelect: true,
    singleSelect: false,
    fetchApi: getActiveOffer,
    renderOption: (item) => ({
      title: item.title,
      media: (
        <img
          src={item.image || defaultImg}
          className="w-20 h-20 object-cover rounded"
          alt={item.title}
        />
      ),
    }),
  },
  category_grid: {
    title: "Category Grid (New)",
    description: "Select multiple categories to display",
    multiSelect: true,
    singleSelect: false,
    fetchApi: getCategories,
    renderOption: (item) => ({
      title: item.title,
      media: (
        <img
          src={item.image || defaultImg}
          className="w-20 h-20 object-cover rounded"
          alt={item.title}
        />
      ),
    }),
  },
  recently_viewed: {
    title: "Recently Viewed (New)",
    description:
      "Automatically displays recently viewed products based on user",
    multiSelect: false,
    singleSelect: false,
  },
  deal_of_the_day: {
    title: "Deal of the Day (New)",
    description: "Select a offer to display",
    multiSelect: false,
    singleSelect: true,
    fetchApi: getActiveOffer,
    renderOption: (item) => ({
      title: item.title,
      media: (
        <img
          src={item.image || defaultImg}
          className="w-20 h-20 object-cover rounded"
          alt={item.title}
        />
      ),
    }),
  },
  personalized_products: {
    title: "Personalized Products (New)",
    description: "Automatically displays personalized products based on user",
    multiSelect: false,
    singleSelect: false,
  },
  dynamicbanner: {
    title: "Dynamic Banner Section (New)",
    description:
      "Select multiple banners to display (up to 4 per page on large screens)",
    multiSelect: true,
    singleSelect: false,
    fetchApi: () => getBannersByType("image"),
    renderOption: (item) => ({
      title: item.title,
      media: (
        <img
          src={item.file_url || defaultImg}
          className="w-20 h-20 object-cover rounded"
          alt={item.title}
        />
      ),
    }),
  },
  seo_content: {
    title: "SEO Content (New)",
    description: "Add rich text content for SEO purposes",
    multiSelect: false,
    singleSelect: false,
    customContent: true,
  },
};

const SectionManagement = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [options, setOptions] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    type: "slider",
    is_active: true,
    content: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (id) {
      loadSection();
    }
  }, [id]);

  useEffect(() => {
    loadOptions(formData.type);
  }, [formData.type]);

  const loadSection = async () => {
    try {
      setLoading(true);
      const response = await getSectionById(id);
      if (response.status === 1) {
        const { title, subtitle, description, type, is_active, content } =
          response.data;
        const parsedContent =
          typeof content === "string" ? JSON.parse(content) : content;
        let contentValue;
        if (type === "seo_content") {
          contentValue = parsedContent?.html || "";
        } else if (type === "download_app") {
          contentValue = parsedContent || {};
        } else {
          contentValue = Array.isArray(parsedContent) ? parsedContent : [];
        }
        setFormData({
          title,
          subtitle,
          description,
          type,
          is_active,
          content: contentValue,
        });
      } else {
        setError("Failed to load section");
      }
    } catch (err) {
      setError("Failed to load section");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async (type, page = 1) => {
    const config = sectionTypeConfigs[type];
    if (config?.fetchApi) {
      try {
        setLoading(true);
        let response;

        if (type === "product_collection") {
          response = await config.fetchApi(`page=${page}&limit=9`);
          if (response?.status === 1) {
            setOptions(response.data || []);
            setPagination(
              response.pagination || {
                page: 1,
                limit: 9,
                total: 0,
                totalPages: 0,
              }
            );
          }
        } else {
          response = await config.fetchApi();
          if (response?.status === 1) {
            setOptions(response.data || []);
          }
        }

        if (response?.status !== 1) {
          setError(`Failed to load ${type} options`);
        }
      } catch (err) {
        setError(`Failed to load ${type} options`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submissionData = new FormData();

      // Append normal fields
      Object.keys(formData).forEach((key) => {
        if (key !== "content") {
          submissionData.append(key, formData[key]);
        }
      });

      // Handle special cases
      if (formData.type === "brand_logos") {
        formData.content.forEach((item) => {
          if (item instanceof File) {
            submissionData.append("brand_images", item); // Append new images
          } else {
            submissionData.append("existing_images[]", item); // Append existing image filenames
          }
        });
      } else if (formData.type === "seo_content") {
        submissionData.append(
          "content",
          JSON.stringify({ html: formData.content })
        );
      } else {
        // If not brand_logos or seo_content, just send the content as JSON string
        submissionData.append("content", JSON.stringify(formData.content));
      }

      // Choose API function based on edit (id exists) or create (no id)
      const response = id
        ? await updateSection(id, submissionData)
        : await createSection(submissionData);

      if (response.status === 1) {
        navigate(`${config.VITE_BASE_ADMIN_URL}/managehomepage`);
      } else {
        setError(response.message || "Failed to save section");
      }
    } catch (err) {
      setError("Failed to save section");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderPagination = () => {
    if (formData.type !== "product_collection" || pagination.totalPages <= 1) {
      return null;
    }

    return (
      <div className="flex justify-center mt-6">
        <div className="flex space-x-2">
          <button
            type="button"
            disabled={pagination.page === 1}
            onClick={() =>
              loadOptions("product_collection", pagination.page - 1)
            }
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else {
                  // Show current page and surrounding pages
                  const start = Math.max(1, pagination.page - 2);
                  const end = Math.min(
                    pagination.totalPages,
                    pagination.page + 2
                  );
                  if (end - start < 4) {
                    if (start === 1) {
                      pageNum = i + 1;
                    } else {
                      pageNum = pagination.totalPages - 4 + i;
                    }
                  } else {
                    pageNum = start + i;
                  }
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => loadOptions("product_collection", pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      pagination.page === pageNum
                        ? "bg-blue-600 text-white"
                        : "border hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}
          </div>

          <button
            type="button"
            disabled={pagination.page === pagination.totalPages}
            onClick={() =>
              loadOptions("product_collection", pagination.page + 1)
            }
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderContentSelector = () => {
    const config = sectionTypeConfigs[formData.type];

    if (formData.type === "seo_content") {
      return (
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <label className="block text-sm font-medium mb-2">SEO Content</label>
          <CKEditor
            editor={ClassicEditor}
            data={formData.content}
            onChange={(event, editor) => {
              const data = editor.getData();
              setFormData({ ...formData, content: data });
            }}
          />
        </div>
      );
    }

    if (formData.type === "brand_logos") {
      return (
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <label className="block text-sm font-medium mb-2">
            Upload Brand Logos
          </label>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files);

              setFormData({
                ...formData,
                content: [...formData.content, ...files], // Store actual files
              });
            }}
            className="w-full px-4 py-2 border rounded-md"
          />

          {/* Image Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {formData.content.map((item, index) => {
              const imageSrc =
                item instanceof File ? URL.createObjectURL(item) : `${item}`;

              return (
                <div key={index} className="relative">
                  <img
                    src={imageSrc || defaultImg}
                    alt={`Brand Logo ${index + 1}`}
                    className="w-50 h-50 object-cover rounded-md border"
                  />
                  <button
                    onClick={() => {
                      const newContent = formData.content.filter(
                        (_, i) => i !== index
                      );
                      setFormData({ ...formData, content: newContent });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (!config.multiSelect && !config.singleSelect && !config.customContent) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600">{config.description}</p>
        </div>
      );
    }

    if (config.customContent) {
      if (config.multiContent) {
        return (
          <div className="space-y-4">
            {formData.content.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg shadow-sm border"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Item {index + 1}</h3>
                  <button
                    onClick={() => {
                      const newContent = [...formData.content];
                      newContent.splice(index, 1);
                      setFormData({ ...formData, content: newContent });
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {Object.keys(config.defaultContent).map((key) => (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                    <input
                      type="text"
                      value={item[key] || ""}
                      onChange={(e) => {
                        const newContent = [...formData.content];
                        newContent[index] = {
                          ...newContent[index],
                          [key]: e.target.value,
                        };
                        setFormData({ ...formData, content: newContent });
                      }}
                      className="w-full px-4 py-2 border rounded-md"
                    />
                  </div>
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  content: [...formData.content, { ...config.defaultContent }],
                })
              }
              className="w-full p-4 border-2 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>
        );
      }

      return (
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          {Object.keys(config.defaultContent).map((key) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </label>
              <input
                type="text"
                value={formData.content[key] || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: { ...formData.content, [key]: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          ))}
        </div>
      );
    }

    // Sort items to show selected items first
    const sortedOptions = [...options].sort((a, b) => {
      const aSelected = formData.content?.includes(a.id);
      const bSelected = formData.content?.includes(b.id);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });

    if (formData.type === "product_collection") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedOptions?.map((option) => {
              const { title, media } = config.renderOption(option);
              const isSelected = formData.content?.includes(option.id);

              return (
                <div
                  key={option.id}
                  onClick={() => {
                    if (config.singleSelect) {
                      setFormData({ ...formData, content: [option.id] });
                    } else {
                      const newContent = isSelected
                        ? formData.content.filter((id) => id !== option.id)
                        : [...formData.content, option.id];
                      setFormData({ ...formData, content: newContent });
                    }
                  }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {media}
                    <div>
                      <h3 className="font-medium">{title}</h3>
                      {config.singleSelect && isSelected && (
                        <span className="text-sm text-blue-600">Selected</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {renderPagination()}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedOptions?.map((option) => {
            const { title, media } = config.renderOption(option);
            const isSelected = formData.content?.includes(option.id);

            return (
              <div
                key={option.id}
                onClick={() => {
                  if (config.singleSelect) {
                    setFormData({ ...formData, content: [option.id] });
                  } else {
                    const newContent = isSelected
                      ? formData.content.filter((id) => id !== option.id)
                      : [...formData.content, option.id];
                    setFormData({ ...formData, content: newContent });
                  }
                }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-4">
                  {media}
                  <div>
                    <h3 className="font-medium">{title}</h3>
                    {config.singleSelect && isSelected && (
                      <span className="text-sm text-blue-600">Selected</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() =>
              navigate(`${config.VITE_BASE_ADMIN_URL}/managehomepage`)
            }
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold">
            {id ? "Edit Section" : "Create New Section"}
          </h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Section Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            {formData.type !== "seo_content" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
            )}

            {formData.type !== "seo_content" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Section Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Section Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  let newContent;
                  if (sectionTypeConfigs[newType].customContent) {
                    newContent = sectionTypeConfigs[newType].multiContent
                      ? []
                      : newType === "seo_content"
                      ? ""
                      : {};
                  } else {
                    newContent = [];
                  }
                  setFormData({
                    ...formData,
                    type: newType,
                    content: newContent,
                  });
                  setPagination({
                    page: 1,
                    limit: 9,
                    total: 0,
                    totalPages: 0,
                  });
                }}
                className="w-full px-4 py-2 border rounded-md"
                required
              >
                {Object.entries(sectionTypeConfigs).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.title}
                  </option>
                ))}
              </select>
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

          <div className="space-y-4">
            <h2 className="text-lg font-medium">Content</h2>
            {formData.type === "banner" && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-gray-600 font-medium">
                  Note: For Banner Section, you can select only one item.
                </p>
              </div>
            )}
            {formData.type === "dynamicbanner" && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-gray-600 font-medium">
                  Note: Select multiple banners (up to 4 will be displayed per
                  page on large screens).
                </p>
              </div>
            )}
            {renderContentSelector()}
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() =>
                navigate(`${config.VITE_BASE_ADMIN_URL}/managehomepage`)
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
              {loading ? "Saving..." : id ? "Update Section" : "Create Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionManagement;
