import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CiImageOn, CiVideoOn } from "react-icons/ci";
import { IoCloudUploadOutline } from "react-icons/io5";
import { X, Plus, Eye } from "lucide-react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  addProduct,
  updateProduct,
  getProductById,
} from "../../../services/api.product";
import {
  getCategories,
  getSubCategories,
  getInnerSubCategories,
} from "../../../services/api.category";
import { getAllFabricsByStatus } from "../../../services/api.fabric";
import { getAllColors } from "../../../services/api.color";
import { getAllSizes } from "../../../services/api.size";
import slugify from "slugify";
import advertisement from "/assets/banners/advertisement_banner.png";
import config from "../../../config/config";
import { getAllvendors } from "../../../services/api.vendor";
import { useAppContext } from "../../../context/AppContext";
import ImageGuidelinesModal from "../../../components/Admin/modals/ImageGuidelinesModal";
import { BsQuestionCircle } from "react-icons/bs";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { getSettings } from "../../../services/api.settings";
import { notifyOnFail } from "../../../utils/notification/toast";

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { user } = useAppContext();

  const [categories, setCategories] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [innerSubCategories, setInnerSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [filteredInnerSubCategories, setFilteredInnerSubCategories] = useState(
    []
  );
  const [vendorDetails, setVendorDetails] = useState([]);
  const [isVendorProduct, setIsVendorProduct] = useState(true);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null);
  const [selectedSubCategoryDetails, setSelectedSubCategoryDetails] =
    useState(null);
  const [selectedInnerSubCategoryDetails, setSelectedInnerSubCategoryDetails] =
    useState(null);
  const [deletedMediaIds, setDeletedMediaIds] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    specifications: [],
    general_info: "",
    product_details: "",
    warranty_info: "",
    base_price: 0,
    original_price: null,
    discounted_price: null,
    type: "",
    tags: [],
    sku: "",
    hsn_code: "",
    barcode: "",
    stock: "",
    low_stock_threshold: "",
    platform_fee: 0,
    package_weight: 0,
    package_length: 0,
    package_width: 0,
    package_height: 0,
    package_depth: 0,
    gst: 0,
    visibility: "Hidden",
    category_id: "",
    sub_category_id: "",
    inner_sub_category_id: "",
    fabric_id: "",
    vendor_id: "",
    meta_title: "",
    meta_description: "",
    slug: "",
    status: true,
    is_variation: false,
    is_featured: false,
    productFiles: [],
  });

  const [specifications, setSpecifications] = useState([
    { feature: "", specification: "" },
  ]);
  const [variations, setVariations] = useState([
    {
      color_id: "",
      media: [],
      sizes: [
        {
          size_id: "",
          stock: "",
          original_price: "",
          discounted_price: "",
          sku: "",
          barcode: "",
        },
      ],
    },
  ]);
  const [priceErrors, setPriceErrors] = useState({
    main: "",
    variations: variations.map(() => ({ sizes: [] })),
  });

  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    url: "",
    type: "",
  });

  useEffect(() => {
    const getAllCategories = async () => {
      const res = await getCategories();
      const formattedCategory = res.data?.map((data) => ({
        id: data.id,
        name: data.title,
        type: data.type,
        hsn_code: data.hsn_code,
        gst: data.gst,
      }));
      setCategories(formattedCategory);
    };

    const getSubcategories = async () => {
      const res = await getSubCategories();
      const formattedCategory = res.data?.map((data) => ({
        id: data.id,
        name: data.title,
        categoryId: data.cat_id,
        hsn_code: data.hsn_code,
        gst: data.gst,
      }));
      setSubCategories(formattedCategory);
    };

    const getInnerSubcategories = async () => {
      const res = await getInnerSubCategories();
      const formattedCategory = res.data?.map((data) => ({
        id: data.id,
        name: data.title,
        subCategoryId: data.sub_cat_id,
        hsn_code: data.hsn_code,
        gst: data.gst,
      }));
      setInnerSubCategories(formattedCategory);
    };

    const getVendorData = async () => {
      const res = await getAllvendors();
      const formattedVendor = res.data?.map((data) => ({
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        shop_name: data.shop_name,
      }));
      setVendorDetails(formattedVendor);
    };

    const getAllColorsData = async () => {
      const res = await getAllColors();
      if (res.status === 1) {
        setColors(res.data);
      }
    };

    const gePlatformFeefromSettings = async () => {
      const res = await getSettings();
      if (res.status === 1) {
        setFormData((prev) => ({
          ...prev,
          platform_fee: res.data.platform_fee,
        }));
      }
    };

    getAllCategories();
    getSubcategories();
    getInnerSubcategories();
    getVendorData();
    getAllColorsData();
    gePlatformFeefromSettings();
  }, []);

  // dynamic size fetching
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const query = {};
        // if (formData.inner_sub_category_id) {
        //   query.innerSubCategoryId = formData.inner_sub_category_id;
        // }
        if (formData.sub_category_id) {
          query.subCategoryId = formData.sub_category_id;
        }

        const res = await getAllSizes(query);
        if (res.status === 1) {
          setSizes(res.data);
        }
      } catch (error) {
        console.error("Error fetching sizes:", error);
      }
    };

    fetchSizes();
  }, [formData.sub_category_id, formData.inner_sub_category_id]);

  // dynamic fabric fetching when category is selected
  useEffect(() => {
    if (formData.category_id) {
      const getAllFabrics = async () => {
        const query = formData.category_id
          ? { categoryId: formData.category_id }
          : {};
        const res = await getAllFabricsByStatus(query);
        const formattedFabrics = res?.map((data) => ({
          id: data.id,
          name: data.name,
        }));
        setFabrics(formattedFabrics || []);
      };

      getAllFabrics();
    }
  }, [formData.category_id]);

  useEffect(() => {
    if (isEditMode) {
      fetchProductData();
    }
  }, [id]);

  // Update category details when category is selected
  useEffect(() => {
    if (formData.category_id) {
      const category = categories.find(
        (c) => c.id === parseInt(formData.category_id)
      );
      setSelectedCategoryDetails(category);

      // Set type from category
      if (category?.type) {
        setFormData((prev) => ({
          ...prev,
          type: category.type,
        }));
      }
    }
  }, [formData.category_id, categories]);

  // Update subcategory details when subcategory is selected
  useEffect(() => {
    if (formData.sub_category_id) {
      const subCategory = subCategories.find(
        (sc) => sc.id === parseInt(formData.sub_category_id)
      );
      setSelectedSubCategoryDetails(subCategory);
    }
  }, [formData.sub_category_id, subCategories]);

  // Update inner subcategory details when inner subcategory is selected
  useEffect(() => {
    if (formData.inner_sub_category_id) {
      const innerSubCategory = innerSubCategories.find(
        (isc) => isc.id === parseInt(formData.inner_sub_category_id)
      );
      setSelectedInnerSubCategoryDetails(innerSubCategory);
    }
  }, [formData.inner_sub_category_id, innerSubCategories]);

  useEffect(() => {
    if (formData.category_id && subCategories.length > 0) {
      const filtered = subCategories.filter(
        (subCat) => subCat.categoryId === parseInt(formData.category_id)
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories([]);
    }
  }, [formData.category_id, subCategories]);

  useEffect(() => {
    if (formData.sub_category_id && innerSubCategories.length > 0) {
      const filtered = innerSubCategories.filter(
        (innerSubCat) =>
          innerSubCat.subCategoryId === parseInt(formData.sub_category_id)
      );
      setFilteredInnerSubCategories(filtered);
    } else {
      setFilteredInnerSubCategories([]);
    }
  }, [formData.sub_category_id, innerSubCategories]);

  // Validate stock threshold doesn't exceed stock
  useEffect(() => {
    if (parseInt(formData.low_stock_threshold) > parseInt(formData.stock)) {
      setFormData((prev) => ({
        ...prev,
        low_stock_threshold: formData.stock,
      }));
    }
  }, [formData.stock, formData.low_stock_threshold]);

  const fetchProductData = async () => {
    try {
      const response = await getProductById(id);
      if (response.status === 1) {
        const productData = response.data;

        let parsedTags = [];
        if (productData.tags) {
          try {
            parsedTags =
              typeof productData.tags === "string"
                ? JSON.parse(productData.tags)
                : productData.tags;
          } catch (error) {
            console.error("Error parsing tags:", error);
          }
        }

        let parsedSpecifications = [];
        if (productData.specifications) {
          try {
            parsedSpecifications =
              typeof productData.specifications === "string"
                ? JSON.parse(productData.specifications)
                : productData.specifications;
          } catch (error) {
            console.error("Error parsing specifications:", error);
          }
        }

        setFormData((prev) => ({
          ...prev,
          category_id: productData.category_id,
        }));

        setTimeout(() => {
          setFormData((prev) => ({
            ...prev,
            ...productData,
            tags: parsedTags,
            specifications: parsedSpecifications,
            productFiles: productData.media.map((media) => ({
              id: media.id, // Include media ID
              url: media.url,
              type: media.type,
              preview: media.url,
            })),
          }));
          setSpecifications(
            parsedSpecifications.length > 0
              ? parsedSpecifications
              : [{ feature: "", specification: "" }]
          );

          if (productData.variations) {
            const updatedVariations = productData.variations.map(
              (variation) => ({
                ...variation,
                media: variation.media.map((media) => ({
                  id: media.id, // Include media ID
                  url: media.url,
                  type: media.type,
                  preview: media.url,
                })),
                sizes: variation.sizes || [],
              })
            );
            setVariations(updatedVariations);
          }
        }, 0);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "name") {
      const newSlug = generateSlug(value);
      const newMetaTitle = `${value} | IERADA`;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: newSlug,
        meta_title: newMetaTitle,
      }));
      setPriceErrors((prev) => ({ ...prev, main: "" }));
    } else if (name === "category_id") {
      setFormData((prev) => ({
        ...prev,
        category_id: value,
        sub_category_id: "",
        inner_sub_category_id: "",
      }));
      setPriceErrors((prev) => ({ ...prev, main: "" }));
    } else if (name === "sub_category_id") {
      setFormData((prev) => ({
        ...prev,
        sub_category_id: value,
        inner_sub_category_id: "",
      }));
      setPriceErrors((prev) => ({ ...prev, main: "" }));
    } else if (name === "low_stock_threshold") {
      // Ensure threshold doesn't exceed stock
      const threshold = Math.min(
        parseInt(value),
        parseInt(formData.stock) || 0
      );
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(threshold) ? "" : threshold,
      }));
      setPriceErrors((prev) => ({ ...prev, main: "" }));
    } else if (name === "original_price" || name === "discounted_price") {
      const newValue = parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Validate prices
      const originalPrice =
        name === "original_price"
          ? newValue
          : parseFloat(formData.original_price) || 0;
      const discountedPrice =
        name === "discounted_price"
          ? newValue
          : parseFloat(formData.discounted_price) || 0;

      if (
        discountedPrice >= originalPrice &&
        originalPrice !== 0 &&
        discountedPrice !== 0
      ) {
        setPriceErrors((prev) => ({
          ...prev,
          main: "Selling price must be lower than original price",
        }));
      } else {
        setPriceErrors((prev) => ({ ...prev, main: "" }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      setPriceErrors((prev) => ({ ...prev, main: "" }));
    }
  };

  // Validate image dimensions before upload
  const validateImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        resolve(width >= 512 && height >= 682);
      };
      img.src = URL.createObjectURL(file);
    });
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

  const handleSlugChange = (e) => {
    const newSlug = e.target.value.toLowerCase();
    if (validateSlug(newSlug) || newSlug === "") {
      setFormData((prev) => ({
        ...prev,
        slug: newSlug,
      }));
    }
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecifications = [...specifications];
    newSpecifications[index][field] = value;
    setSpecifications(newSpecifications);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { feature: "", specification: "" }]);
    setFormData({
      ...formData,
      specifications: [...specifications, { feature: "", specification: "" }],
    });
  };

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
    setFormData({
      ...formData,
      specifications: specifications.filter((_, i) => i !== index),
    });
  };

  const handleVariationChange = (colorIndex, field, value) => {
    const newVariations = [...variations];
    newVariations[colorIndex][field] = value;
    setVariations(newVariations);
  };

  const handleSizeChange = (colorIndex, sizeIndex, field, value) => {
    const newVariations = [...variations];
    newVariations[colorIndex].sizes[sizeIndex][field] = value;
    setVariations(newVariations);

    // Validate prices for variations
    if (field === "original_price" || field === "discounted_price") {
      const originalPrice =
        parseFloat(newVariations[colorIndex].sizes[sizeIndex].original_price) ||
        0;
      const discountedPrice =
        parseFloat(
          newVariations[colorIndex].sizes[sizeIndex].discounted_price
        ) || 0;

      setPriceErrors((prev) => {
        const newErrors = [...prev.variations];
        newErrors[colorIndex] = {
          ...newErrors[colorIndex],
          sizes: [...(newErrors[colorIndex]?.sizes || [])],
        };
        newErrors[colorIndex].sizes[sizeIndex] =
          discountedPrice >= originalPrice &&
          originalPrice !== 0 &&
          discountedPrice !== 0
            ? "Selling price must be lower than original price"
            : "";
        return { ...prev, variations: newErrors };
      });
    }
  };

  const addColorVariation = () => {
    setVariations([
      ...variations,
      {
        // unique_id: Date.now().toString(),
        color_id: "",
        media: [],
        sizes: [
          {
            size_id: "",
            stock: "",
            original_price: "",
            discounted_price: "",
            sku: "",
            barcode: "",
          },
        ],
      },
    ]);
  };

  const addSizeToColor = (colorIndex) => {
    const newVariations = [...variations];
    newVariations[colorIndex].sizes.push({
      size_id: "",
      stock: "",
      original_price: "",
      discounted_price: "",
      sku: "",
      barcode: "",
    });
    setVariations(newVariations);
  };

  const removeColorVariation = (colorIndex) => {
    setVariations(variations.filter((_, index) => index !== colorIndex));
  };

  const removeSizeFromColor = (colorIndex, sizeIndex) => {
    const newVariations = [...variations];
    newVariations[colorIndex].sizes = newVariations[colorIndex].sizes.filter(
      (_, index) => index !== sizeIndex
    );
    setVariations(newVariations);
  };

  const handleFileChange = async (e, variationIndex) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    // Validate each file
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const isValid = await validateImageDimensions(file);
        if (!isValid) {
          notifyOnFail(
            `Image ${file.name} doesn't meet minimum resolution requirements (512x682px)`
          );
          continue;
        }
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    if (formData.is_variation) {
      setVariations((prev) => {
        const newVariations = [...prev];
        const processedFiles = validFiles.map((file) => ({
          file,
          type: file.type.startsWith("image/") ? "image" : "video",
          preview: URL.createObjectURL(file),
        }));
        const existingMedia = new Set(
          newVariations[variationIndex].media.map((media) => media.file.name)
        );
        const uniqueProcessedFiles = processedFiles.filter(
          (file) => !existingMedia.has(file.file.name)
        );
        newVariations[variationIndex].media = [
          ...newVariations[variationIndex].media,
          ...uniqueProcessedFiles,
        ];
        return newVariations;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        productFiles: [
          ...prev.productFiles,
          ...validFiles.map((file) => ({
            file,
            type: file.type.startsWith("image/") ? "image" : "video",
            preview: URL.createObjectURL(file),
          })),
        ],
      }));
    }
  };

  const handleRemoveFile = (index, variationIndex = null) => {
    if (formData.is_variation && variationIndex !== null) {
      setVariations((prev) => {
        const newVariations = [...prev];
        const media = newVariations[variationIndex].media;
        const mediaItem = media[index];
        if (mediaItem.id) {
          setDeletedMediaIds((prev) => [...prev, mediaItem.id]);
        }
        URL.revokeObjectURL(mediaItem?.preview);
        newVariations[variationIndex].media = media.filter(
          (_, i) => i !== index
        );
        return newVariations;
      });
    } else {
      setFormData((prev) => {
        const files = [...prev.productFiles];
        const mediaItem = files[index];
        if (mediaItem.id) {
          setDeletedMediaIds((prev) => [...prev, mediaItem.id]);
        }
        URL.revokeObjectURL(files[index].preview);
        const updatedFiles = files.filter((_, i) => i !== index);
        return { ...prev, productFiles: updatedFiles };
      });
    }
  };

  const renderMediaPreview = (file, index, variationIndex = null) => {
    const handlePreview = () => {
      setPreviewModal({
        isOpen: true,
        url: file.preview || file.url,
        type: file.type,
      });
    };

    return (
      <div key={index} className="relative group">
        {file.type === "image" ? (
          <img
            src={file.preview || file.url}
            alt="preview"
            className="w-20 h-20 object-cover rounded-lg border"
          />
        ) : (
          <video
            src={file.preview || file.url}
            className="w-20 h-20 object-cover rounded-lg border"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
          <button
            onClick={handlePreview}
            className="p-1 bg-white rounded-full text-gray-700 hover:text-gray-900"
            aria-label="Preview media"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleRemoveFile(index, variationIndex)}
            className="p-1 bg-white rounded-full text-red-500 hover:text-red-700"
            aria-label="Remove media"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    try {
      // Check for price errors
      if (
        priceErrors.main ||
        priceErrors.variations.some((v) => v.sizes.some((s) => s))
      ) {
        notifyOnFail("Please fix price validation errors before submitting.");
        return;
      }

      // Validate SKU for non-variation product
      if (!formData.is_variation && !formData.sku.trim()) {
        notifyOnFail("SKU is required for the product.");
        return;
      }

      // Validate SKU for variations
      if (formData.is_variation) {
        for (const variation of variations) {
          for (const size of variation.sizes) {
            if (!size.sku.trim()) {
              notifyOnFail("SKU is required for all variations.");
              return;
            }
          }
        }
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (
          key !== "productFiles" &&
          key !== "variations" &&
          key !== "specifications"
        ) {
          if (key === "fabric_id" && !formData[key]) {
            // Do not append fabric_id if it is empty
          } else {
            formDataToSend.append(
              key,
              typeof formData[key] === "object" && key !== "specifications"
                ? JSON.stringify(formData[key])
                : formData[key]
            );
          }
        }
      });

      // Append specifications separately
      formDataToSend.append("specifications", JSON.stringify(specifications));

      // Append deleted media IDs
      if (deletedMediaIds.length > 0) {
        formDataToSend.append("delete_media", JSON.stringify(deletedMediaIds));
      }

      if (formData.is_variation) {
        const variationsForSubmit = variations.flatMap((variation) =>
          variation.sizes.map((size) => ({
            color_id: variation.color_id,
            size_id: size.size_id,
            stock: size.stock,
            original_price: size.original_price,
            discounted_price: size.discounted_price,
            sku: size.sku,
            barcode: size.barcode,
          }))
        );
        formDataToSend.append(
          "variations",
          JSON.stringify(variationsForSubmit)
        );

        // Track all media files and their indices
        const allMediaFiles = [];
        const variationMedia = variations
          .filter((v) => v.media.length > 0)
          .map((variation) => {
            const fileIndices = [];
            variation.media.forEach((media) => {
              if (media.file instanceof File) {
                // New file
                const globalIndex = allMediaFiles.length;
                allMediaFiles.push(media.file);
                fileIndices.push(globalIndex);
              } else if (media.id) {
                // Existing media
                fileIndices.push(media.id);
              }
            });
            return {
              color_id: variation.color_id,
              file_indices: fileIndices,
            };
          });

        formDataToSend.append(
          "variation_media",
          JSON.stringify(variationMedia)
        );

        // Append new files
        allMediaFiles.forEach((file) => {
          formDataToSend.append("files", file);
        });
      } else {
        const allMediaFiles = formData.productFiles
          .map((fileObj, index) => ({
            file: fileObj.file instanceof File ? fileObj.file : null,
            id: fileObj.id || null,
            index,
          }))
          .filter((fileObj) => fileObj.file || fileObj.id);

        const mediaIndices = allMediaFiles.map((fileObj, index) =>
          fileObj.file ? index : fileObj.id
        );

        // Append new files
        allMediaFiles
          .filter((fileObj) => fileObj.file)
          .forEach((fileObj) => {
            formDataToSend.append("files", fileObj.file);
          });

        // For non-variation products, include media indices if needed
        if (mediaIndices.length > 0) {
          formDataToSend.append("media_indices", JSON.stringify(mediaIndices));
        }
      }

      const response = isEditMode
        ? await updateProduct(id, formDataToSend)
        : await addProduct(formDataToSend);

      if (response.status === 1) {
        navigate(`${config.VITE_BASE_ADMIN_URL}/product/list`);
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      notifyOnFail("Error submitting product");
    }
  };

  const renderMediaUploadSection = (variationIndex = null) => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
          <CiImageOn size={20} />
          <span>Add Images</span> <span className=" text-red-600">*</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileChange(e, variationIndex)}
          />
        </label>
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
          <CiVideoOn size={20} />
          <span>Add Videos</span>
          <input
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileChange(e, variationIndex)}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-4">
        {variationIndex !== null
          ? variations[variationIndex].media?.map((file, index) =>
              renderMediaPreview(file, index, variationIndex)
            )
          : formData.productFiles.map((file, index) =>
              renderMediaPreview(file, index)
            )}
      </div>
    </div>
  );

  const renderPreviewModal = () =>
    previewModal.isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex justify-end mb-2">
            <button
              onClick={() =>
                setPreviewModal({ isOpen: false, url: "", type: "" })
              }
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          {previewModal.type === "image" ? (
            <img
              src={previewModal.url}
              alt="preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
          ) : (
            <video
              src={previewModal.url}
              controls
              className="max-w-full max-h-[80vh]"
            />
          )}
        </div>
      </div>
    );

  // Tooltip component for hints
  const TooltipHint = ({ id, content }) => (
    <>
      <BsQuestionCircle
        size={14}
        className="text-gray-500 cursor-pointer ml-1"
        data-tooltip-id={id}
        data-tooltip-content={content}
      />
      <Tooltip
        id={id}
        place="top"
        effect="solid"
        className="!text-xs !max-w-xs !z-[9999]"
      />
    </>
  );

  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <div className="container px-4 py-2 space-y-6 max-w-[80%] max-h-[100%] flex-1 overflow-y-scroll scrollbar-hide">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          {isEditMode ? "Edit Product" : "Create a New Product"}
        </h1>

        <div className="flex space-x-4 mb-4"></div>

        {/* Vendor Selection */}
        <div className="">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            Select Vendor<span className="text-red-600">*</span>
            <TooltipHint
              id="vendor-tooltip"
              content="Select the vendor who is supplying this product"
            />
          </label>
          <select
            name="vendor_id"
            value={formData.vendor_id}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
          >
            <option value="" disabled>
              Select Vendor
            </option>
            {vendorDetails.length > 0 ? (
              vendorDetails.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.first_name} {vendor.last_name} - {vendor.shop_name}
                </option>
              ))
            ) : (
              <option disabled>No vendors available</option>
            )}
          </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                Product Name <span className="text-red-600">*</span>
                <TooltipHint
                  id="name-tooltip"
                  content="Enter the full product name as it should appear to customers"
                />
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>

            {/* Hidden type field - populated from category */}
            <input type="hidden" name="type" value={formData.type} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  Category <span className="text-red-600">*</span>
                  <TooltipHint
                    id="category-tooltip"
                    content="Main product category. This will determine the product type automatically."
                  />
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  Subcategory <span className="text-red-600">*</span>
                  <TooltipHint
                    id="subcategory-tooltip"
                    content="More specific product classification under the main category"
                  />
                </label>
                <select
                  name="sub_category_id"
                  value={formData.sub_category_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  disabled={!formData.category_id}
                >
                  <option value="" disabled>
                    Select Subcategory
                  </option>
                  {filteredSubCategories.map((subCategory) => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  Inner Subcategory <span className="text-red-600">*</span>
                  <TooltipHint
                    id="inner-subcategory-tooltip"
                    content="Most specific product classification level"
                  />
                </label>
                <select
                  name="inner_sub_category_id"
                  value={formData.inner_sub_category_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  disabled={!formData.sub_category_id}
                >
                  <option value="" disabled>
                    Select Inner Subcategory
                  </option>
                  {filteredInnerSubCategories.map((innerSubCategory) => (
                    <option
                      key={innerSubCategory.id}
                      value={innerSubCategory.id}
                    >
                      {innerSubCategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  Fabric
                  <TooltipHint
                    id="fabric-tooltip"
                    content="Select the primary fabric material for this product"
                  />
                </label>
                <select
                  name="fabric_id"
                  value={formData.fabric_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                >
                  <option value="" disabled>
                    Select Fabric
                  </option>
                  {fabrics.map((fabric) => (
                    <option key={fabric.id} value={fabric.id}>
                      {fabric.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Display HSN Code and GST Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  HSN Code <span className="text-red-600">*</span>
                  <TooltipHint
                    id="hsn-tooltip"
                    content="Harmonized System Nomenclature code for taxation."
                  />
                </label>
                <input
                  type="text"
                  name="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  // readOnly
                />
                {/* <p className="text-xs text-gray-500 mt-1">
                  {selectedInnerSubCategoryDetails?.hsn_code
                    ? "From Inner Subcategory"
                    : selectedSubCategoryDetails?.hsn_code
                    ? "From Subcategory"
                    : selectedCategoryDetails?.hsn_code
                    ? "From Category"
                    : "No HSN code set in category hierarchy"}
                </p> */}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    GST Percentage <span className="text-red-600">*</span>
                    <TooltipHint
                      id="gst-amount-tooltip"
                      content="GST percentage applied to this product."
                    />
                  </label>
                  <input
                    type="number"
                    name="gst"
                    value={formData.gst}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                    // readOnly
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                General Info
              </label>
              <CKEditor
                editor={ClassicEditor}
                data={formData.general_info}
                onChange={(event, editor) => {
                  setFormData((prev) => ({
                    ...prev,
                    general_info: editor.getData(),
                  }));
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product Details
              </label>
              <CKEditor
                editor={ClassicEditor}
                data={formData.product_details}
                onChange={(event, editor) => {
                  setFormData((prev) => ({
                    ...prev,
                    product_details: editor.getData(),
                  }));
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Warranty Info
              </label>
              <CKEditor
                editor={ClassicEditor}
                data={formData.warranty_info}
                onChange={(event, editor) => {
                  setFormData((prev) => ({
                    ...prev,
                    warranty_info: editor.getData(),
                  }));
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-1">
            Product Specifications
            <TooltipHint
              id="specifications-tooltip"
              content="List of product specifications."
            />
          </h2>
          <div className="space-y-4">
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={spec.feature}
                    onChange={(e) =>
                      handleSpecificationChange(
                        index,
                        "feature",
                        e.target.value
                      )
                    }
                    placeholder="Feature"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={spec.specification}
                    onChange={(e) =>
                      handleSpecificationChange(
                        index,
                        "specification",
                        e.target.value
                      )
                    }
                    placeholder="Specification"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>
                <button
                  onClick={() => removeSpecification(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X />
                </button>
              </div>
            ))}
            <button
              onClick={addSpecification}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
            >
              <Plus size={20} /> Add Specification
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">
                Cost Price (Base Price/Manufacturing Price){" "}
                <span className=" text-red-600">*</span>
              </label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                Original Price (MRP) <span className="text-red-600">*</span>
                <TooltipHint
                  id="original-price-tooltip"
                  content="Maximum Retail Price (MRP) of the product"
                />
              </label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                Selling Price (Discounted Price){" "}
                <span className="text-red-600">*</span>
                <TooltipHint
                  id="selling-price-tooltip"
                  content="Actual selling price after discounts"
                />
              </label>
              <input
                type="number"
                name="discounted_price"
                value={formData.discounted_price}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black ${
                  priceErrors.main ? "border-red-500" : ""
                }`}
              />
              {priceErrors.main && (
                <p className="mt-1 text-sm text-red-600">{priceErrors.main}</p>
              )}
              {/* <div className="bg-blue-200 p-2 mt-2 rounded-md">
                <label className="block text-sm font-medium text-gray-700 ">
                  Profit Margin: ₹
                  {(formData.original_price || 0) -
                    (formData.discounted_price || 0)}
                </label>
              </div> */}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                Stock <span className="text-red-600">*</span>
                <TooltipHint
                  id="stock-tooltip"
                  content="Total available quantity of this product"
                />
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                Low Stock Threshold <span className="text-red-600">*</span>
                <TooltipHint
                  id="threshold-tooltip"
                  content="When stock reaches this level, you'll be notified. Cannot exceed total stock."
                />
              </label>
              <input
                type="number"
                name="low_stock_threshold"
                value={formData.low_stock_threshold}
                onChange={handleInputChange}
                max={formData.stock}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Barcode
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold mb-1">
              Product Language Tags
            </h2>
            <TooltipHint
              id="tags-tooltip"
              content="Add relevant tags to help customers find this product in Hindi Or Any Other Language"
            />
          </div>

          <div className="space-y-4">
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
        Product Tags
        
      </label> */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Add a tag and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      e.preventDefault();
                      const newTag = e.target.value.trim();
                      if (!formData.tags.includes(newTag)) {
                        setFormData((prev) => ({
                          ...prev,
                          tags: [...prev.tags, newTag],
                        }));
                      }
                      e.target.value = "";
                    }
                  }}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          tags: prev.tags.filter((_, i) => i !== index),
                        }));
                      }}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Press Enter to add tags. Tags help customers find your product.
              </p>
            </div>
          </div>
        </div>

        {!formData.is_variation && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">Media</h2>
              <button
                className="flex items-center gap-1 text-sm text-gray-600"
                onClick={() => setIsGuideModalOpen(true)}
              >
                <BsQuestionCircle />
              </button>
            </div>
            {renderMediaUploadSection()}
          </div>
        )}

        {/* Variations section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-1">
              Variations
              <TooltipHint
                id="variations-tooltip"
                content="Add variations to the product."
              />
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_variation"
                checked={formData.is_variation}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Enable Variations</label>
            </div>
          </div>

          {formData.is_variation && (
            <div className="space-y-6">
              {variations?.map((variation, colorIndex) => (
                <div key={colorIndex} className="border rounded-lg p-4">
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Color
                      </label>
                      <select
                        value={variation.color_id}
                        onChange={(e) =>
                          handleVariationChange(
                            colorIndex,
                            "color_id",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                      >
                        <option value="">Select Color</option>
                        {colors.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeColorVariation(colorIndex)}
                      className="text-red-500 hover:text-red-700 self-end"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-700">
                        Media Files for{" "}
                        {colors.find((c) => c.id === variation.color_id)
                          ?.name || `Variation ${colorIndex + 1}`}
                      </h3>
                      <button
                        className="flex items-center gap-1 text-sm text-gray-600"
                        onClick={() => setIsGuideModalOpen(true)}
                      >
                        <BsQuestionCircle />
                      </button>
                    </div>
                    {renderMediaUploadSection(colorIndex)}
                  </div>

                  <div className="space-y-4">
                    {variation.sizes.map((size, sizeIndex) => (
                      <div
                        key={sizeIndex}
                        className="grid grid-cols-6 gap-2 items-end"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Size
                          </label>
                          <select
                            value={size.size_id}
                            onChange={(e) =>
                              handleSizeChange(
                                colorIndex,
                                sizeIndex,
                                "size_id",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          >
                            <option value="">Select Size</option>
                            {sizes.map((size) => (
                              <option key={size.id} value={size.id}>
                                {size.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Stock
                          </label>
                          <input
                            type="number"
                            value={size.stock}
                            onChange={(e) =>
                              handleSizeChange(
                                colorIndex,
                                sizeIndex,
                                "stock",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Original Price
                          </label>
                          <input
                            type="number"
                            value={size.original_price}
                            onChange={(e) =>
                              handleSizeChange(
                                colorIndex,
                                sizeIndex,
                                "original_price",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Selling Price
                          </label>
                          <input
                            type="number"
                            value={size.discounted_price}
                            onChange={(e) =>
                              handleSizeChange(
                                colorIndex,
                                sizeIndex,
                                "discounted_price",
                                e.target.value
                              )
                            }
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black ${
                              priceErrors.variations[colorIndex]?.sizes[
                                sizeIndex
                              ]
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {priceErrors.variations[colorIndex]?.sizes[
                            sizeIndex
                          ] && (
                            <p className="mt-1 text-sm text-red-600">
                              {
                                priceErrors.variations[colorIndex].sizes[
                                  sizeIndex
                                ]
                              }
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Barcode
                          </label>
                          <input
                            type="text"
                            value={size.barcode}
                            onChange={(e) =>
                              handleSizeChange(
                                colorIndex,
                                sizeIndex,
                                "barcode",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              SKU <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={size.sku}
                              onChange={(e) =>
                                handleSizeChange(
                                  colorIndex,
                                  sizeIndex,
                                  "sku",
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                              required
                            />
                          </div>
                          <button
                            onClick={() =>
                              removeSizeFromColor(colorIndex, sizeIndex)
                            }
                            className="text-red-500 hover:text-red-700 self-end"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => addSizeToColor(colorIndex)}
                      className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
                    >
                      <Plus size={20} /> Add Size
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={addColorVariation}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
              >
                <Plus size={20} /> Add Color Variation
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Charges & Shipping</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Other Charges (Default from Admin)
                </label>
                <input
                  type="number"
                  name="platform_fee"
                  value={formData.platform_fee}
                  onChange={handleInputChange}
                  disabled
                  className="mt-1 block w-full bg-gray-200 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Weight (g)
                </label>
                <input
                  type="number"
                  name="package_weight"
                  value={formData.package_weight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Length (cm)
                </label>
                <input
                  type="number"
                  name="package_length"
                  value={formData.package_length}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Width (cm)
                </label>
                <input
                  type="number"
                  name="package_width"
                  value={formData.package_width}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="package_height"
                  value={formData.package_height}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Depth (cm)
                </label>
                <input
                  type="number"
                  name="package_depth"
                  value={formData.package_depth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meta Title
                <span className="text-xs text-gray-500 ml-2">
                  (Automatically generated, but can be customized)
                </span>
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                placeholder="Product Name | IERADA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                URL Slug
                <span className="text-xs text-gray-500 ml-2">
                  (Generated from product name, use only lowercase letters,
                  numbers, and hyphens)
                </span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleSlugChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-black ${
                  validateSlug(formData.slug)
                    ? "border-gray-300 focus:border-black"
                    : "border-red-300 focus:border-red-500"
                }`}
                placeholder="product-url-slug"
              />
              {!validateSlug(formData.slug) && formData.slug !== "" && (
                <p className="mt-1 text-sm text-red-600">
                  Slug can only contain lowercase letters, numbers, and hyphens
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meta Description
                <span className="text-xs text-gray-500 ml-2">
                  (Recommended: 150-160 characters)
                </span>
              </label>
              <textarea
                name="meta_description"
                value={formData.meta_description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                placeholder="Enter a compelling description of your product for search engines..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Characters: {formData.meta_description.length}/160
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Additional Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                Visibility
                <TooltipHint
                  id="visibility-tooltip"
                  text="This controls whether or not your product will be visible to customers."
                />
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              >
                <option value="Hidden">Hidden</option>
                <option value="Published">Published</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <label className="text-sm text-gray-700 flex items-center gap-1">
                  Featured Product
                  <TooltipHint
                    id="is-featured-tooltip"
                    text="This product will be highlighted on the homepage."
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between py-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300"
          >
            Cancel
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => handleSubmit(true)}
              className="px-6 py-2 bg-[#F47954] text-white rounded-md "
            >
              {isEditMode ? "Update Product" : "Create Product"}
            </button>
          </div>
        </div>
      </div>

      {renderPreviewModal()}

      {isGuideModalOpen && (
        <ImageGuidelinesModal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AddEditProduct;
