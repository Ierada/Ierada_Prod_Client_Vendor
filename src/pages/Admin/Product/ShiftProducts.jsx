import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronsLeft,
  ChevronsRight,
  X,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { debounce } from "../../../utils/debounce";
import { getAllProducts, shiftProducts } from "../../../services/api.product";
import {
  getCategories,
  getInnerSubCategoriesBySubCategoryId,
  getSubCategoriesByCategoryId,
} from "../../../services/api.category";
import config from "../../../config/config";
import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";
import { getAllvendors } from "../../../services/api.vendor";

const FilterSelect = ({ label, options, value, onSelect, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <label className="text-sm font-medium text-txtPage">{label}</label>
      <div
        className="w-full p-2 border rounded-md bg-white flex justify-between items-center cursor-pointer border-gray-500"
        onClick={() => !loading && setIsOpen(!isOpen)}
      >
        {loading ? (
          <span>Loading...</span>
        ) : (
          <>
            {options.find((opt) => opt.value === value)?.label ||
              `Select ${label}`}
            <svg
              className={`w-5 h-5 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </div>

      {isOpen && !loading && (
        <div className="absolute w-full mt-1 bg-white border rounded-md shadow-md z-10 max-h-32 overflow-y-auto">
          {options?.map((option) => (
            <div
              key={option.value}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NumberInput = ({ label, value, onChange }) => {
  return (
    <div className="relative w-full">
      <label className="text-sm font-medium text-txtPage">{label}</label>
      <input
        type="number"
        className="w-full p-2 border rounded-md bg-white border-gray-500"
        value={value}
        onChange={(e) => onChange({ target: { value: e.target.value } })}
        min="0"
      />
    </div>
  );
};

// Modal for Target Selection
const ShiftConfirmationModal = ({
  isOpen,
  onClose,
  selectedProductsCount,
  onConfirm,
  targetCategory,
  targetSubCategory,
  targetInnerSubCategory,
  categoryOptions,
  subCategoryOptions,
  innerSubCategoryOptions,
  setTargetCategory,
  setTargetSubCategory,
  setTargetInnerSubCategory,
  loadingSubCats = false,
  loadingInnerSubCats = false,
  isShifting = false,
}) => {
  const [localCategory, setLocalCategory] = useState(targetCategory);
  const [localSubCategory, setLocalSubCategory] = useState(targetSubCategory);
  const [localInnerSubCategory, setLocalInnerSubCategory] = useState(
    targetInnerSubCategory
  );

  useEffect(() => {
    setLocalCategory(targetCategory);
    setLocalSubCategory(targetSubCategory);
    setLocalInnerSubCategory(targetInnerSubCategory);
  }, [targetCategory, targetSubCategory, targetInnerSubCategory]);

  const handleCategorySelect = (option) => {
    const value = option.value;
    setLocalCategory(value);
    setLocalSubCategory("");
    setLocalInnerSubCategory("");
    setTargetCategory(value);
    setTargetSubCategory("");
    setTargetInnerSubCategory("");
  };

  const handleSubCategorySelect = (option) => {
    const value = option.value;
    setLocalSubCategory(value);
    setLocalInnerSubCategory("");
    setTargetSubCategory(value);
    setTargetInnerSubCategory("");
  };

  const handleInnerSubCategorySelect = (option) => {
    const value = option.value;
    setLocalInnerSubCategory(value);
    setTargetInnerSubCategory(value);
  };

  const handleConfirm = () => {
    if (!localCategory || !localSubCategory || !localInnerSubCategory) {
      notifyOnFail(
        "Please select target category, subcategory, and inner subcategory"
      );
      return;
    }
    onConfirm();
  };

  const handleClose = () => {
    onClose();
    setLocalCategory("");
    setLocalSubCategory("");
    setLocalInnerSubCategory("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Shift {selectedProductsCount} Product(s)
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-4">
          <FilterSelect
            label="Target Category"
            options={categoryOptions}
            value={localCategory}
            onSelect={handleCategorySelect}
          />

          <FilterSelect
            label="Target Subcategory"
            options={subCategoryOptions}
            value={localSubCategory}
            onSelect={handleSubCategorySelect}
            loading={loadingSubCats}
          />

          <FilterSelect
            label="Target Inner Subcategory"
            options={innerSubCategoryOptions}
            value={localInnerSubCategory}
            onSelect={handleInnerSubCategorySelect}
            loading={loadingInnerSubCats}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              !localCategory ||
              !localSubCategory ||
              !localInnerSubCategory ||
              isShifting
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Package className="w-4 h-4 mr-2" />
            {isShifting ? "Shifting..." : "Confirm Shift"}
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkCustomShiftModal = ({
  isOpen,
  onClose,
  initialCustomIds = [],
  onRefetch,
  categoryOptions,
}) => {
  const [customIds, setCustomIds] = useState(initialCustomIds);
  const [inputValue, setInputValue] = useState("");
  const [isShifting, setIsShifting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [invalidIds, setInvalidIds] = useState([]);

  // Target states
  const [targetCategory, setTargetCategory] = useState("");
  const [targetSubCategory, setTargetSubCategory] = useState("");
  const [targetInnerSubCategory, setTargetInnerSubCategory] = useState("");
  const [targetSubCategoryOptions, setTargetSubCategoryOptions] = useState([]);
  const [targetInnerSubCategoryOptions, setTargetInnerSubCategoryOptions] =
    useState([]);
  const [loadingTargetSubCats, setLoadingTargetSubCats] = useState(false);
  const [loadingTargetInnerSubCats, setLoadingTargetInnerSubCats] =
    useState(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCustomIds(initialCustomIds);
      setInputValue("");
      setError("");
      setSuccessMessage("");
      setInvalidIds([]);
      setIsShifting(false);
      setTargetCategory("");
      setTargetSubCategory("");
      setTargetInnerSubCategory("");
      setTargetSubCategoryOptions([]);
      setTargetInnerSubCategoryOptions([]);
    }
  }, [isOpen, initialCustomIds]);

  // Dynamic fetch target subcategories
  const fetchTargetSubCategories = async (categoryId) => {
    if (!categoryId) {
      setTargetSubCategoryOptions([]);
      setTargetInnerSubCategoryOptions([]);
      return;
    }
    setLoadingTargetSubCats(true);
    try {
      const res = await getSubCategoriesByCategoryId(categoryId);
      const subCats = res?.data || [];
      setTargetSubCategoryOptions(
        subCats.map((sub) => ({ value: sub.id, label: sub.title }))
      );
      setTargetSubCategory("");
      setTargetInnerSubCategory("");
    } catch (error) {
      console.error("Error fetching target subcategories:", error);
      setTargetSubCategoryOptions([]);
      notifyOnFail("Failed to fetch subcategories");
    } finally {
      setLoadingTargetSubCats(false);
    }
  };

  // Dynamic fetch target inner subcategories
  const fetchTargetInnerSubCategories = async (subCategoryId) => {
    if (!subCategoryId) {
      setTargetInnerSubCategoryOptions([]);
      return;
    }
    setLoadingTargetInnerSubCats(true);
    try {
      const res = await getInnerSubCategoriesBySubCategoryId(subCategoryId);
      const innerSubCats = res?.data || [];
      setTargetInnerSubCategoryOptions(
        innerSubCats.map((inner) => ({ value: inner.id, label: inner.title }))
      );
      setTargetInnerSubCategory("");
    } catch (error) {
      console.error("Error fetching target inner subcategories:", error);
      setTargetInnerSubCategoryOptions([]);
      notifyOnFail("Failed to fetch inner subcategories");
    } finally {
      setLoadingTargetInnerSubCats(false);
    }
  };

  // Effects for target fetches
  useEffect(() => {
    if (targetCategory) {
      fetchTargetSubCategories(targetCategory);
    }
  }, [targetCategory]);

  useEffect(() => {
    if (targetSubCategory) {
      fetchTargetInnerSubCategories(targetSubCategory);
    }
  }, [targetSubCategory]);

  const addCustomId = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const trimmed = inputValue.trim();
      if (!customIds.includes(trimmed)) {
        setCustomIds([...customIds, trimmed]);
      }
      setInputValue("");
      setError("");
    }
  };

  const removeCustomId = (idToRemove) => {
    setCustomIds(customIds.filter((id) => id !== idToRemove));
    // Clear invalid if removed
    setInvalidIds((prev) => prev.filter((id) => id !== idToRemove));
  };

  const handleTargetCategorySelect = (option) => {
    const value = option.value;
    setTargetCategory(value);
    setTargetSubCategory("");
    setTargetInnerSubCategory("");
  };

  const handleTargetSubCategorySelect = (option) => {
    const value = option.value;
    setTargetSubCategory(value);
    setTargetInnerSubCategory("");
  };

  const handleTargetInnerSubCategorySelect = (option) => {
    const value = option.value;
    setTargetInnerSubCategory(value);
  };

  const handleShift = async () => {
    if (customIds.length === 0) {
      setError("Please enter at least one product ID");
      return;
    }
    if (!targetCategory || !targetSubCategory || !targetInnerSubCategory) {
      setError(
        "Please select target category, subcategory, and inner subcategory"
      );
      return;
    }
    setIsShifting(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await shiftProducts({
        customIds,
        target_category_id: targetCategory,
        target_sub_category_id: targetSubCategory,
        target_inner_sub_category_id: targetInnerSubCategory,
      });
      if (response.status === 1) {
        setSuccessMessage(
          `Successfully shifted ${response.updatedCount} product(s)`
        );
        if (response.invalid && response.invalid.length > 0) {
          setInvalidIds(response.invalid);
          // Keep modal open to show invalid
        } else {
          onClose();
          onRefetch();
        }
      } else {
        setError(response.message || "Failed to shift products");
      }
    } catch (err) {
      console.error("Bulk shift error:", err);
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsShifting(false);
    }
  };

  const handleClose = () => {
    if (successMessage) {
      onRefetch(); // Refetch if shift was partially successful
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Bulk Shift Products by Product ID
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        {invalidIds.length > 0 && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p className="font-medium">Invalid Product IDs (not found):</p>
            <ul className="list-disc list-inside mt-1">
              {invalidIds.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Product ID
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={addCustomId}
            placeholder="Type a product ID and press Enter to add"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isShifting}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Added Product IDs ({customIds.length})
          </label>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto border border-gray-200 p-2 rounded-md bg-gray-50">
            {customIds.length > 0 ? (
              customIds.map((id) => (
                <div
                  key={id}
                  className="bg-blue-100 px-2 py-1 rounded-md flex items-center gap-1 text-sm"
                >
                  {id}
                  <button
                    onClick={() => removeCustomId(id)}
                    className="text-red-500 hover:text-red-700 ml-1"
                    disabled={isShifting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No product IDs added yet</p>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <FilterSelect
            label="Target Category"
            options={categoryOptions}
            value={targetCategory}
            onSelect={handleTargetCategorySelect}
          />

          <FilterSelect
            label="Target Subcategory"
            options={targetSubCategoryOptions}
            value={targetSubCategory}
            onSelect={handleTargetSubCategorySelect}
            loading={loadingTargetSubCats}
          />

          <FilterSelect
            label="Target Inner Subcategory"
            options={targetInnerSubCategoryOptions}
            value={targetInnerSubCategory}
            onSelect={handleTargetInnerSubCategorySelect}
            loading={loadingTargetInnerSubCats}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            disabled={isShifting}
          >
            Cancel
          </button>
          <button
            onClick={handleShift}
            disabled={
              isShifting ||
              customIds.length === 0 ||
              !targetCategory ||
              !targetSubCategory ||
              !targetInnerSubCategory
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Package className="w-4 h-4 mr-2" />
            {isShifting ? "Shifting..." : "Shift Products"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ShiftProducts = () => {
  const [products, setProducts] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isBulkCustomShiftModalOpen, setIsBulkCustomShiftModalOpen] =
    useState(false);
  const [isShifting, setIsShifting] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category_id: "",
    category_name: "",
    sub_category_id: "",
    sub_category_name: "",
    inner_sub_category_id: "",
    inner_sub_category_name: "",
    vendor_id: "",
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [innerSubCategoryOptions, setInnerSubCategoryOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [targetFilters, setTargetFilters] = useState({
    category_id: "",
    sub_category_id: "",
    inner_sub_category_id: "",
  });
  const [targetCategoryOptions, setTargetCategoryOptions] = useState([]);
  const [targetSubCategoryOptions, setTargetSubCategoryOptions] = useState([]);
  const [targetInnerSubCategoryOptions, setTargetInnerSubCategoryOptions] =
    useState([]);
  const [loadingSubCats, setLoadingSubCats] = useState(false);
  const [loadingInnerSubCats, setLoadingInnerSubCats] = useState(false);
  const [loadingTargetSubCats, setLoadingTargetSubCats] = useState(false);
  const [loadingTargetInnerSubCats, setLoadingTargetInnerSubCats] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [bulkShiftCustomIds, setBulkShiftCustomIds] = useState([]);
  const limitOptions = [5, 10, 25, 50, 100];

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      // Fetch categories
      const catRes = await getCategories();
      const categories = catRes?.data || [];

      setCategoryOptions(
        categories?.map((cat) => ({ value: cat.id, label: cat.title }))
      );
      setTargetCategoryOptions(
        categories?.map((cat) => ({ value: cat.id, label: cat.title }))
      );

      // Fetch vendors (reuse logic from product list)
      const vendorRes = await getAllvendors();

      //   process vendor data to value and label
      const processedVendors = vendorRes?.data?.map((vendor) => ({
        value: vendor.id,
        label: vendor.first_name + " " + vendor.last_name,
      }));
      setVendorOptions(processedVendors || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      notifyOnFail("Failed to fetch initial data");
    }
  };

  const fetchProducts = async (
    page = 1,
    filters = {},
    search = "",
    limit = pagination.limit
  ) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page,
        limit: limit,
        search: search,
        category: filters.category_name || "",
        sub_category: filters.sub_category_name || "",
        inner_sub_category: filters.inner_sub_category_name || "",
        vendor_id: filters.vendor_id || "",
      });

      const response = await getAllProducts(queryParams.toString());

      const data = response?.data?.filter((item) => item && item.id) || [];
      setProducts(data);
      setDisplayedData(data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setDisplayedData([]);
      notifyOnFail("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic fetch subcategories
  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategoryOptions([]);
      setInnerSubCategoryOptions([]);
      return;
    }
    setLoadingSubCats(true);
    try {
      const res = await getSubCategoriesByCategoryId(categoryId);
      const subCats = res?.data || [];
      setSubCategoryOptions(
        subCats.map((sub) => ({ value: sub.id, label: sub.title }))
      );
      setFilters((prev) => ({
        ...prev,
        sub_category_id: "",
        sub_category_name: "",
        inner_sub_category_id: "",
        inner_sub_category_name: "",
      }));
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubCategoryOptions([]);
      notifyOnFail("Failed to fetch subcategories");
    } finally {
      setLoadingSubCats(false);
    }
  };

  // Dynamic fetch inner subcategories
  const fetchInnerSubCategories = async (subCategoryId) => {
    if (!subCategoryId) {
      setInnerSubCategoryOptions([]);
      return;
    }
    setLoadingInnerSubCats(true);
    try {
      const res = await getInnerSubCategoriesBySubCategoryId(subCategoryId);
      const innerSubCats = res?.data || [];
      setInnerSubCategoryOptions(
        innerSubCats.map((inner) => ({ value: inner.id, label: inner.title }))
      );
      setFilters((prev) => ({
        ...prev,
        inner_sub_category_id: "",
        inner_sub_category_name: "",
      }));
    } catch (error) {
      console.error("Error fetching inner subcategories:", error);
      setInnerSubCategoryOptions([]);
      notifyOnFail("Failed to fetch inner subcategories");
    } finally {
      setLoadingInnerSubCats(false);
    }
  };

  // Target dynamic fetches
  const fetchTargetSubCategories = async (categoryId) => {
    if (!categoryId) {
      setTargetSubCategoryOptions([]);
      setTargetInnerSubCategoryOptions([]);
      return;
    }
    setLoadingTargetSubCats(true);
    try {
      const res = await getSubCategoriesByCategoryId(categoryId);
      const subCats = res?.data || [];
      setTargetSubCategoryOptions(
        subCats.map((sub) => ({ value: sub.id, label: sub.title }))
      );
      setTargetFilters((prev) => ({
        ...prev,
        sub_category_id: "",
        inner_sub_category_id: "",
      }));
    } catch (error) {
      console.error("Error fetching target subcategories:", error);
      setTargetSubCategoryOptions([]);
    } finally {
      setLoadingTargetSubCats(false);
    }
  };

  const fetchTargetInnerSubCategories = async (subCategoryId) => {
    if (!subCategoryId) {
      setTargetInnerSubCategoryOptions([]);
      return;
    }
    setLoadingTargetInnerSubCats(true);
    try {
      const res = await getInnerSubCategoriesBySubCategoryId(subCategoryId);
      const innerSubCats = res?.data || [];
      setTargetInnerSubCategoryOptions(
        innerSubCats.map((inner) => ({ value: inner.id, label: inner.title }))
      );
      setTargetFilters((prev) => ({ ...prev, inner_sub_category_id: "" }));
    } catch (error) {
      console.error("Error fetching target inner subcategories:", error);
      setTargetInnerSubCategoryOptions([]);
    } finally {
      setLoadingTargetInnerSubCats(false);
    }
  };

  // Debounced fetch
  const debouncedFetchProducts = useCallback(
    debounce((page, filters, searchTerm, limit) => {
      fetchProducts(page, filters, searchTerm, limit);
    }, 500),
    []
  );

  const handleBulkCustomShiftRefetch = useCallback(() => {
    fetchProducts(pagination.page, filters, searchTerm, pagination.limit);
    setRowSelection({});
  }, [pagination.page, filters, searchTerm, pagination.limit]);

  const openBulkCustomShiftModal = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedCustomIds = selectedRows
      .map((row) => row.original.custom_id)
      .filter(Boolean);
    setBulkShiftCustomIds(selectedCustomIds);
    setIsBulkCustomShiftModalOpen(true);
  };

  // Effects
  useEffect(() => {
    fetchInitialData();
    fetchProducts();
  }, []);

  useEffect(() => {
    debouncedFetchProducts(1, filters, searchTerm, pagination.limit);
  }, [searchTerm, filters, pagination.limit, debouncedFetchProducts]);

  useEffect(() => {
    if (filters.category_id) {
      fetchSubCategories(filters.category_id);
    } else {
      setSubCategoryOptions([]);
      setInnerSubCategoryOptions([]);
    }
  }, [filters.category_id]);

  useEffect(() => {
    if (filters.sub_category_id) {
      fetchInnerSubCategories(filters.sub_category_id);
    } else {
      setInnerSubCategoryOptions([]);
    }
  }, [filters.sub_category_id]);

  // Target effects
  useEffect(() => {
    if (targetFilters.category_id) {
      fetchTargetSubCategories(targetFilters.category_id);
    } else {
      setTargetSubCategoryOptions([]);
      setTargetInnerSubCategoryOptions([]);
    }
  }, [targetFilters.category_id]);

  useEffect(() => {
    if (targetFilters.sub_category_id) {
      fetchTargetInnerSubCategories(targetFilters.sub_category_id);
    } else {
      setTargetInnerSubCategoryOptions([]);
    }
  }, [targetFilters.sub_category_id]);

  const handleFilterChange = (name, option) => {
    if (name === "vendor_id") {
      setFilters((prev) => ({ ...prev, vendor_id: option.value }));
    } else {
      const idKey = name.replace("_name", "_id");
      setFilters((prev) => ({
        ...prev,
        [name]: option.label,
        [idKey]: option.value,
      }));
    }
  };

  const handleTargetFilterChange = (name, value) => {
    setTargetFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleShift = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);

    if (selectedIds.length === 0) {
      notifyOnFail("Please select at least one product");
      return;
    }

    if (
      !targetFilters.category_id ||
      !targetFilters.sub_category_id ||
      !targetFilters.inner_sub_category_id
    ) {
      notifyOnFail(
        "Please select target category, subcategory, and inner subcategory"
      );
      return;
    }

    setIsShifting(true);
    try {
      const response = await shiftProducts({
        productIds: selectedIds,
        target_category_id: targetFilters.category_id,
        target_sub_category_id: targetFilters.sub_category_id,
        target_inner_sub_category_id: targetFilters.inner_sub_category_id,
      });

      if (response.status === 1) {
        setRowSelection({});
        setTargetFilters({
          category_id: "",
          sub_category_id: "",
          inner_sub_category_id: "",
        });
        setIsShiftModalOpen(false);
        fetchProducts(pagination.page, filters, searchTerm, pagination.limit);
      } else {
        notifyOnFail(response.message || "Failed to shift products");
      }
    } catch (error) {
      console.error("Error shifting products:", error);
      notifyOnFail(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsShifting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="px-1">
            <input
              type="checkbox"
              checked={
                table.getIsAllRowsSelected() ||
                (table.getIsSomeRowsSelected() && "indeterminate")
              }
              onChange={table.getToggleAllRowsSelectedHandler()}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        ),
      },
      {
        header: "SL",
        cell: ({ row }) =>
          (pagination.page - 1) * pagination.limit + row.index + 1,
      },
      {
        header: "Product ID",
        accessorKey: "custom_id",
      },
      {
        header: "Product Photo",
        accessorKey: "image",
        cell: ({ row }) =>
          row.original?.image ? (
            <img
              src={row.original.image}
              alt={row.original.name || "Product"}
              className="w-16 h-16 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          ),
      },
      {
        header: "Product Name",
        accessorKey: "name",
        cell: ({ row }) => <p>{row.original?.name || "N/A"}</p>,
      },
      {
        header: "Current Category",
        accessorKey: "category",
        cell: ({ row }) => <p>{row.original?.category || "N/A"}</p>,
      },
      {
        header: "Current Sub Category",
        accessorKey: "sub_category",
        cell: ({ row }) => <p>{row.original?.sub_category || "N/A"}</p>,
      },
      {
        header: "Vendor",
        accessorKey: "vendor_name",
        cell: ({ row }) => <p>{row.original?.vendor_name || "N/A"}</p>,
      },
      {
        header: "Stock",
        accessorKey: "stock",
        cell: ({ row }) => <span>{row.original?.stock || "0"}</span>,
      },
      {
        header: "Created At",
        accessorKey: "created_at",
        cell: ({ row }) => (
          <span>
            {row.original?.created_at
              ? new Date(row.original.created_at).toLocaleString()
              : "N/A"}
          </span>
        ),
      },
    ],
    [pagination.page, pagination.limit]
  );

  const table = useReactTable({
    data: displayedData,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
    getRowId: (row, index) => row.original?.id?.toString() || `row-${index}`,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  const selectedRowCount = table.getSelectedRowModel().rows.length;

  const clearFilters = () => {
    setFilters({
      category_id: "",
      category_name: "",
      sub_category_id: "",
      sub_category_name: "",
      inner_sub_category_id: "",
      inner_sub_category_name: "",
      vendor_id: "",
    });
    setSearchTerm("");
    setSubCategoryOptions([]);
    setInnerSubCategoryOptions([]);
    fetchProducts(1, {}, "");
  };

  const handlePageChange = (newPage) => {
    fetchProducts(newPage, filters, searchTerm, pagination.limit);
  };

  const handleLimitChange = (newLimit) => {
    setRowSelection({});
    fetchProducts(1, filters, searchTerm, newLimit);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const getVisiblePageNumbers = () => {
    const maxButtons = 5;
    const { page, totalPages } = pagination;

    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 font-satoshi">
          Shift Products
        </h2>
      </div>

      <div className="flex flex-wrap items-center justify-between mb-5 gap-4">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full sm:w-auto border-gray-100 border py-3 px-10 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-400"
          />
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 text-lg" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsShiftModalOpen(true)}
            disabled={selectedRowCount === 0}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Package className="mr-2 w-4 h-4" />
            Shift Products ({selectedRowCount})
          </button>

          <button
            onClick={openBulkCustomShiftModal}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md flex items-center justify-center"
          >
            <Package className="mr-2 w-4 h-4" />
            Bulk Shift by Product ID
            {selectedRowCount > 0 && ` (${selectedRowCount} selected)`}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-md px-3 py-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
          <FilterSelect
            label="Category"
            options={categoryOptions}
            value={filters.category_id}
            onSelect={(option) => {
              handleFilterChange("category_name", option);
            }}
          />
          <FilterSelect
            label="Subcategory"
            options={subCategoryOptions}
            value={filters.sub_category_id}
            onSelect={(option) =>
              handleFilterChange("sub_category_name", option)
            }
            loading={loadingSubCats}
          />
          <FilterSelect
            label="Inner Subcategory"
            options={innerSubCategoryOptions}
            value={filters.inner_sub_category_id}
            onSelect={(option) =>
              handleFilterChange("inner_sub_category_name", option)
            }
            loading={loadingInnerSubCats}
          />
          <FilterSelect
            label="Vendor"
            options={vendorOptions}
            value={filters.vendor_id}
            onSelect={(option) => handleFilterChange("vendor_id", option)}
          />
        </div>

        <div className="flex gap-3 mt-3 md:justify-end">
          <button
            className="px-6 py-2 bg-gray-300 text-[#4C4C1F] text-sm font-medium rounded-2xl"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F47954]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {table.getFlatHeaders().map((header) => (
                    <th
                      key={header.id}
                      className={`py-4 text-left text-sm font-medium text-[#333843] ${
                        header.id === "select" ? "px-1" : "px-6"
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        cursor: header.column.getCanSort()
                          ? "pointer"
                          : "default",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() &&
                          header.id !== "select" && (
                            <div>
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="w-4 h-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="w-4 h-4" />
                              ) : (
                                <ArrowUpDown className="w-4 h-4" />
                              )}
                            </div>
                          )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`py-4 text-[#1C2A53] text-sm ${
                            cell.column.id === "select" ? "px-1" : "px-6"
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t">
        <div className="flex items-center mb-4 sm:mb-0">
          <span className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {displayedData.length > 0
                ? (pagination.page - 1) * pagination.limit + 1
                : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium">{pagination.total}</span> results
          </span>

          <div className="ml-4">
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md text-sm py-1 pr-5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  Show {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination.page <= 1}
            className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getVisiblePageNumbers().map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                pagination.page === pageNumber
                  ? "bg-[#F47954] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ShiftConfirmationModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        selectedProductsCount={selectedRowCount}
        onConfirm={handleShift}
        targetCategory={targetFilters.category_id}
        targetSubCategory={targetFilters.sub_category_id}
        targetInnerSubCategory={targetFilters.inner_sub_category_id}
        categoryOptions={targetCategoryOptions}
        subCategoryOptions={targetSubCategoryOptions}
        innerSubCategoryOptions={targetInnerSubCategoryOptions}
        setTargetCategory={(val) =>
          handleTargetFilterChange("category_id", val)
        }
        setTargetSubCategory={(val) =>
          handleTargetFilterChange("sub_category_id", val)
        }
        setTargetInnerSubCategory={(val) =>
          handleTargetFilterChange("inner_sub_category_id", val)
        }
        loadingSubCats={loadingTargetSubCats}
        loadingInnerSubCats={loadingTargetInnerSubCats}
        isShifting={isShifting}
      />

      <BulkCustomShiftModal
        isOpen={isBulkCustomShiftModalOpen}
        onClose={() => setIsBulkCustomShiftModalOpen(false)}
        initialCustomIds={bulkShiftCustomIds}
        onRefetch={handleBulkCustomShiftRefetch}
        categoryOptions={categoryOptions}
      />
    </div>
  );
};

export default ShiftProducts;
