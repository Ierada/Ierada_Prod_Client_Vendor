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
import slugify from "slugify";
import advertisement from "/assets/banners/advertisement_banner.png";
import config from "../../../config/config";
import { getAllvendors } from "../../../services/api.vendor";
import { useAppContext } from "../../../context/AppContext";

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { user } = useAppContext();

  const [categories, setCategories] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [innerSubCategories, setInnerSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [filteredInnerSubCategories, setFilteredInnerSubCategories] = useState(
    []
  );
  const [vendorDetails, setVendorDetails] = useState([]);
  const [isVendorProduct, setIsVendorProduct] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    specifications: [], // Array of {feature, specification}
    general_info: "",
    product_details: "",
    warranty_info: "",
    base_price: "",
    original_price: "",
    discounted_price: "",
    type: "",
    tags: [],
    sku: "",
    hsn_code: "",
    barcode: "",
    stock: "",
    low_stock_threshold: "",
    free_shipping: false,
    shipping_charges: "",
    package_weight: "",
    package_length: "",
    package_width: "",
    package_height: "",
    tax: "",
    tax_type: "",
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
      unique_id: Date.now().toString(),
      color_name: "",
      color_code: "",
      media: [],
      sizes: [
        {
          size: "",
          stock: "",
          original_price: "",
          discounted_price: "",
          sku: "",
        },
      ],
    },
  ]);

  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    url: "",
    type: "",
  });



  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all initial data in parallel
        const [categoriesRes, subCategoriesRes, innerSubCategoriesRes, fabricsRes, vendorsRes] = await Promise.all([
          getCategories(),
          getSubCategories(),
          getInnerSubCategories(),
          getAllFabricsByStatus(),
          getAllvendors(),
        ]);
  
        // Process categories
        const formattedCategory = categoriesRes.data?.map((data) => ({
          id: data.id,
          name: data.title,
        }));
        setCategories(formattedCategory);
  
        // Process subcategories
        const formattedSubCategory = subCategoriesRes.data?.map((data) => ({
          id: data.id,
          name: data.title,
          categoryId: data.cat_id,
        }));
        setSubCategories(formattedSubCategory);
  
        // Process inner subcategories
        const formattedInnerSubCategory = innerSubCategoriesRes.data?.map((data) => ({
          id: data.id,
          name: data.title,
          subCategoryId: data.sub_cat_id,
        }));
        setInnerSubCategories(formattedInnerSubCategory);
  
        // Process fabrics
        const formattedFabrics = fabricsRes?.map((data) => ({
          id: data.id,
          name: data.name,
        }));
        setFabrics(formattedFabrics);
  
        // Process vendors
        const formattedVendor = vendorsRes.data?.map((data) => ({
          id: data.id,
          first_name: data.first_name,
        }));
        setVendorDetails(formattedVendor);
  
        // Fetch product data if in edit mode after initial data is processed
        if (isEditMode) {
          const productResponse = await getProductById(id);
          if (productResponse.status === 1) {
            const productData = productResponse.data;
  
            // Filter subcategories based on product's category_id
            const filteredSub = formattedSubCategory.filter(
              (subCat) => subCat.categoryId === parseInt(productData.category_id)
            );
            setFilteredSubCategories(filteredSub);
  
            // Filter inner subcategories based on product's sub_category_id
            const filteredInner = formattedInnerSubCategory.filter(
              (innerSubCat) =>
                innerSubCat.subCategoryId === parseInt(productData.sub_category_id)
            );
            setFilteredInnerSubCategories(filteredInner);
  
            // Set formData with product details
            setFormData({
              ...productData,
              productFiles: productData.media || [],
            });
  
            // Set variations if present
            if (productData.variations) {
              const updatedVariations = productData.variations.map((variation) => ({
                ...variation,
                media: variation.media || [],
                sizes: variation.sizes || [],
              }));
              setVariations(updatedVariations);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [id, isEditMode]); // Add dependencies as needed

  useEffect(() => {
    const getAllCategories = async () => {
      const res = await getCategories();
      const formattedCategory = res.data?.map((data) => ({
        id: data.id,
        name: data.title,
      }));
      setCategories(formattedCategory);
    };

    const getSubcategories = async () => {
      const res = await getSubCategories();
      const formattedCategory = res.data?.map((data) => ({
        id: data.id,
        name: data.title,
        categoryId: data.cat_id,
      }));
      setSubCategories(formattedCategory);
    };

    const getInnerSubcategories = async () => {
      const res = await getInnerSubCategories();
      const formattedCategory = res.data?.map((data) => ({
        id: data.id,
        name: data.title,
        subCategoryId: data.sub_cat_id,
      }));
      setInnerSubCategories(formattedCategory);
    };

    const getAllFabrics = async () => {
      const res = await getAllFabricsByStatus();

      const formattedFabrics = res?.map((data) => ({
        id: data.id,
        name: data.name,
      }));
      setFabrics(formattedFabrics);
    };

    const getVendorData = async () => {
      const res = await getAllvendors();
      console.log(res), "res of vendor data";
      const formattedVendor = res.data?.map((data) => ({
        id: data.id,
        first_name: data.first_name,
      }));
      setVendorDetails(formattedVendor);
    };

    getAllCategories();
    getSubcategories();
    getInnerSubcategories();
    getAllFabrics();
    getVendorData();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchProductData();
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode && formData.category_id && subCategories.length > 0) {
      // Filter subcategories based on selected category
      const filtered = subCategories.filter(
        (subCat) => subCat.categoryId === parseInt(formData.category_id)
      );
      setFilteredSubCategories(filtered);

      // If we have a sub_category_id, filter inner subcategories
      if (formData.sub_category_id && innerSubCategories.length > 0) {
        const filteredInner = innerSubCategories.filter(
          (innerSubCat) =>
            innerSubCat.subCategoryId === parseInt(formData.sub_category_id)
        );
        setFilteredInnerSubCategories(filteredInner);
      }
    }
  }, [
    isEditMode,
    formData.category_id,
    formData.sub_category_id,
    subCategories,
    innerSubCategories,
  ]);
  useEffect(() => {
    if (formData.category_id) {
      const filtered = subCategories.filter(
        (subCat) => subCat.categoryId === parseInt(formData.category_id)
      );
      setFilteredSubCategories(filtered);

      setFormData((prev) => ({
        ...prev,
        sub_category_id: "",
        inner_sub_category_id: "",
      }));
    } else {
      setFilteredSubCategories([]);
    }
  }, [formData.category_id, subCategories, isEditMode]);

  useEffect(() => {
    if (formData.sub_category_id) {
      const filtered = innerSubCategories.filter(
        (innerSubCat) =>
          innerSubCat.subCategoryId === parseInt(formData.sub_category_id)
      );
      setFilteredInnerSubCategories(filtered);

      setFormData((prev) => ({
        ...prev,
        inner_sub_category_id: "",
      }));
    } else {
      setFilteredInnerSubCategories([]);
    }
  }, [formData.sub_category_id, innerSubCategories, isEditMode]);

  const fetchProductData = async () => {
    try {
      const response = await getProductById(id);
      if (response.status === 1) {
        const productData = response.data;
        setFormData({
          ...productData,
          productFiles: productData.media || [],
        });

        if (productData.variations) {
          const updatedVariations = productData.variations.map((variation) => ({
            ...variation,
            media: variation.media || [],
            sizes: variation.sizes || [],
          }));
          setVariations(updatedVariations);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const groupVariationsByColor = (variations) => {
    const grouped = {};
    variations.forEach((variation) => {
      if (!grouped[variation.unique_id]) {
        grouped[variation.unique_id] = {
          unique_id: variation.unique_id,
          color_name: variation.color_name,
          color_code: variation.color_code,
          sizes: [],
        };
      }
      grouped[variation.unique_id].sizes.push({
        size: variation.size,
        stock: variation.stock,
        original_price: variation.original_price,
        discounted_price: variation.discounted_price,
        sku: variation.sku,
      });
    });
    return Object.values(grouped);
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
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
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
  };

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
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
  };

  const addColorVariation = () => {
    setVariations([
      ...variations,
      {
        unique_id: Date.now().toString(),
        color_name: "",
        color_code: "",
        sizes: [
          {
            size: "",
            stock: "",
            original_price: "",
            discounted_price: "",
            sku: "",
          },
        ],
      },
    ]);
  };

  const addSizeToColor = (colorIndex) => {
    const newVariations = [...variations];
    newVariations[colorIndex].sizes.push({
      size: "",
      stock: "",
      original_price: "",
      discounted_price: "",
      sku: "",
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

  const handleFileChange = (e, variationIndex) => {
    const files = Array.from(e.target.files);

    if (formData.is_variation) {
      setVariations((prev) => {
        const newVariations = [...prev];
        const processedFiles = files.map((file) => ({
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
          ...files.map((file) => ({
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

        URL.revokeObjectURL(media[index]?.preview);

        newVariations[variationIndex].media = media.filter(
          (_, i) => i !== index
        );

        return newVariations;
      });
    } else {
      setFormData((prev) => {
        const files = [...prev.productFiles];

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
      const formDataToSend = new FormData();

      // Append basic form data
      Object.keys(formData).forEach((key) => {
        if (key !== "productFiles" && key !== "variations") {
          formDataToSend.append(
            key,
            typeof formData[key] === "object"
              ? JSON.stringify(formData[key])
              : formData[key]
          );
        }
      });

      if (formData.is_variation) {
        // Prepare variations data
        const variationsForSubmit = variations.flatMap((variation) =>
          variation.sizes.map((size) => ({
            unique_id: variation.unique_id,
            color_name: variation.color_name,
            color_code: variation.color_code,
            size: size.size,
            stock: size.stock,
            original_price: size.original_price,
            discounted_price: size.discounted_price,
            sku: size.sku,
          }))
        );
        formDataToSend.append(
          "variations",
          JSON.stringify(variationsForSubmit)
        );

        // Prepare variation media mapping
        const variation_media = variations
          .filter((v) => v.media.length > 0)
          .map((variation) => ({
            unique_id: variation.unique_id,
            file_indices: variation.media.map((_, index) => {
              const globalIndex =
                variations
                  .slice(0, variations.indexOf(variation))
                  .reduce((sum, v) => sum + v.media.length, 0) + index;
              return globalIndex;
            }),
          }));
        formDataToSend.append(
          "variation_media",
          JSON.stringify(variation_media)
        );

        // Append all media files
        variations.forEach((variation) => {
          variation.media.forEach((media) => {
            if (media.file instanceof File) {
              formDataToSend.append("files", media.file);
            }
          });
        });
      } else {
        // Append regular product files
        formData.productFiles.forEach((fileObj) => {
          if (fileObj.file instanceof File) {
            formDataToSend.append("files", fileObj.file);
          }
        });
      }

      const response = isEditMode
        ? await updateProduct(id, formDataToSend)
        : await addProduct(formDataToSend);

      if (response.status === 1) {
        navigate(`${config.VITE_BASE_VENDOR_URL}/product`);
      }
    } catch (error) {
      console.error("Error submitting product:", error);
    }
  };

  const renderMediaUploadSection = (variationIndex = null) => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
          <CiImageOn size={20} />
          <span>Add Images</span>
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

  // const create_add = [
  //   { id: 1, title: "Create Add", subtitle: "Advertisement Banner of vendors" },
  //   { id: 2, title: "Create Add", subtitle: "Advertisement Banner of vendors" },
  // ];

  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <div className="container px-4 py-2 space-y-6 max-w-[75%] max-h-[100%] flex-1 overflow-y-scroll scrollbar-hide">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          {isEditMode ? "Edit Product" : "Create a New Product"}
        </h1>

        {/* Buttons for Product Type */}
        <div className="flex space-x-4 mb-4">
          {/* <button
            className={`px-4 py-2 rounded ${
              !isVendorProduct ? "bg-[#F47954] text-white" : "bg-gray-200"
            }`}
            onClick={() => setIsVendorProduct(false)}
          >
            + Add Inhouse Products
          </button> */}
          <button
            className={`px-4 py-2 rounded ${
              isVendorProduct ? "bg-[#F47954] text-white" : "bg-gray-200"
            }`}
            onClick={() => setIsVendorProduct(true)}
          >
            + Add Vendor Products
          </button>
        </div>

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                >
                  <option value="" disabled>
                    Select Type
                  </option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Boy">Boy</option>
                  <option value="Girl">Girl</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fabric
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
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
                <label className="block text-sm font-medium text-gray-700">
                  Subcategory
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
                <label className="block text-sm font-medium text-gray-700">
                  Inner Subcategory
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

        {/* Specifications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Specifications</h2>
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

        {/* Render media section only if variations are disabled */}
        {!formData.is_variation && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Media</h2>
            {renderMediaUploadSection()}
          </div>
        )}

        {/* Variations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Variations</h2>
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
              {variations.map((color, colorIndex) => (
                <div key={color.unique_id} className="border rounded-lg p-4">
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Color Name
                      </label>
                      <input
                        type="text"
                        value={color.color_name}
                        onChange={(e) =>
                          handleVariationChange(
                            colorIndex,
                            "color_name",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Color Code
                      </label>
                      <input
                        type="color"
                        value={color.color_code}
                        onChange={(e) =>
                          handleVariationChange(
                            colorIndex,
                            "color_code",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black h-10"
                      />
                    </div>
                    <button
                      onClick={() => removeColorVariation(colorIndex)}
                      className="text-red-500 hover:text-red-700 self-end"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Media Files for{" "}
                      {color.color_name || `Variation ${colorIndex + 1}`}
                    </h3>
                    {renderMediaUploadSection(colorIndex)}
                  </div>

                  <div className="space-y-4">
                    {color.sizes.map((size, sizeIndex) => (
                      <div
                        key={sizeIndex}
                        className="grid grid-cols-5 gap-4 items-end"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Size
                          </label>
                          <input
                            type="text"
                            value={size.size}
                            onChange={(e) =>
                              handleSizeChange(
                                colorIndex,
                                sizeIndex,
                                "size",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          />
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
                            Discounted Price
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              SKU
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

        {/* Pricing and Inventory */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Base Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cost Price (Base Price/Manufacturing Price)
              </label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 ">
                Original Price (MRP)
              </label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 ">
                Selling Price (Discounted Price)
              </label>
              <input
                type="number"
                name="discounted_price"
                value={formData.discounted_price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
              <div className="bg-blue-200 p-2 mt-2 rounded-md">
                <label className="block text-sm font-medium text-gray-700 ">
                  Profit Margin (Cost Price - Selling Price): ₹
                  {(formData.discounted_price || 0) -
                    (formData.base_price || 0)}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock
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
              <label className="block text-sm font-medium text-gray-700">
                Low Stock Threshold
              </label>
              <input
                type="number"
                name="low_stock_threshold"
                value={formData.low_stock_threshold}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                HSN Code
              </label>
              <input
                type="text"
                name="hsn_code"
                value={formData.hsn_code}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
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

        {/* Shipping */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Shipping</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="free_shipping"
                checked={formData.free_shipping}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Free Shipping</label>
            </div>

            {!formData.free_shipping && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shipping Charges
                </label>
                <input
                  type="number"
                  name="shipping_charges"
                  value={formData.shipping_charges}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </div>
          </div>
        </div>

        {/* Tax */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Tax</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tax Type
              </label>
              <select
                name="tax_type"
                value={formData.tax_type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              >
                <option value="">Select Tax Type</option>
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tax Amount
              </label>
              <input
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
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

        {/* Additional Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Additional Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Visibility
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
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <label className="text-sm text-gray-700">
                  Featured Product
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between py-4">
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => handleSubmit(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(true)}
              className="px-6 py-2 bg-[#F47954] text-white rounded-md "
            >
              {isEditMode ? "Update Product" : "Create Product"}
            </button>
          </div>
        </div>
      </div>

      {/* Vendor ID Section */}
      {isVendorProduct && (
        <div className="mt-32 ml-8">
          <label className="block text-sm font-medium text-gray-700">
            Select Vendor
          </label>
          <select
            name="vendor_id"
            value={formData.vendor_id}
            onChange={handleInputChange}
            className="w-[230px] border px-3 py-2mt-1 block rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
          >
            <option value="" disabled>
              Select Vendor
            </option>
            {vendorDetails.length > 0 ? (
              vendorDetails.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.first_name}
                </option>
              ))
            ) : (
              <option disabled>No vendors available</option>
            )}
          </select>
        </div>
      )}

      {renderPreviewModal()}
    </div>
  );
};

export default AddEditProduct;
