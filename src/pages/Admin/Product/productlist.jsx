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
  Edit,
  Eye,
  Trash2,
  Download,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductModal from "../../../components/Vendor/Models/ProductModal";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import { CiImport } from "react-icons/ci";
import {
  getAllProducts,
  updateProductVisibility,
  updateBulkProductVisibility,
  deleteProduct,
  bulkDeleteProducts,
} from "../../../services/api.product";
import config from "../../../config/config";
import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";
import { CSVLink } from "react-csv";
import BulkActionModal from "../../../components/Admin/modals/BulkActionModal";
import { debounce } from "../../../utils/debounce";

const FilterSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <label className="text-sm font-medium text-txtPage">{label}</label>
      <div
        className="w-full p-2 border rounded-md bg-white flex justify-between items-center cursor-pointer border-gray-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {options.find((opt) => opt.value === value)?.label || label}
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
      </div>

      {isOpen && (
        <div className="absolute w-full mt-1 bg-white border rounded-md shadow-md z-10 max-h-32 overflow-y-auto">
          {options?.map((option) => (
            <div
              key={option.value}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange({ target: { value: option.value } });
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

const BulkCustomDeleteModal = ({
  isOpen,
  onClose,
  initialCustomIds = [],
  onRefetch,
}) => {
  const [customIds, setCustomIds] = useState(initialCustomIds);
  const [inputValue, setInputValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [invalidIds, setInvalidIds] = useState([]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCustomIds(initialCustomIds);
      setInputValue("");
      setError("");
      setSuccessMessage("");
      setInvalidIds([]);
      setIsDeleting(false);
    }
  }, [isOpen, initialCustomIds]);

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

  const handleDelete = async () => {
    if (customIds.length === 0) {
      setError("Please enter at least one custom ID");
      return;
    }
    setIsDeleting(true);
    setError("");
    setSuccessMessage("");
    try {
      // Assume bulkDeleteProducts now accepts { customIds }
      const response = await bulkDeleteProducts({ customIds });
      if (response.status === 1) {
        setSuccessMessage(
          `Successfully deleted ${response.deletedCount} product(s)`
        );
        if (response.invalid && response.invalid.length > 0) {
          setInvalidIds(response.invalid);
          // Keep modal open to show invalid
        } else {
          onClose();
          onRefetch();
        }
      } else {
        setError(response.message || "Failed to delete products");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (successMessage) {
      onRefetch(); // Refetch if deletion was partially successful
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Bulk Delete Products by Product ID
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
            placeholder="Type a custom ID and press Enter to add"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isDeleting}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Added Product IDs ({customIds.length})
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-200 p-2 rounded-md bg-gray-50">
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
                    disabled={isDeleting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No custom IDs added yet</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || customIds.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete Products"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Product = () => {
  const [products, setProducts] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkCustomDeleteModalOpen, setIsBulkCustomDeleteModalOpen] =
    useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
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
    category_name: "",
    stock: "",
    visibility: "",
    vendor_id: "",
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [visibilityOptions, setVisibilityOptions] = useState([
    "All",
    "Published",
    "Hidden",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [isProcessingBulkAction, setIsProcessingBulkAction] = useState(false);
  const [csvData, setCsvData] = useState({ headers: [], data: [] });
  const csvLinkRef = React.useRef();
  const [csvDataAll, setCsvDataAll] = useState({ headers: [], data: [] });
  const csvLinkAllRef = React.useRef();
  const [bulkDeleteCustomIds, setBulkDeleteCustomIds] = useState([]);
  const limitOptions = [5, 10, 25, 50, 100];
  const navigate = useNavigate();

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
        stock: filters.stock || "",
        visibility: filters.visibility || "",
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

      // Prepare CSV data for current page
      prepareCsvData(data, false);

      // Set category options
      if (response.filters && response.filters.categories) {
        setCategoryOptions(response.filters.categories);
      }

      // Format and set vendor options
      if (response.filters && response.filters.vendors) {
        const formattedVendors = response.filters.vendors.map((vendor) => ({
          value: vendor.id,
          label: vendor.name || "N/A",
        }));
        setVendorOptions(formattedVendors);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setDisplayedData([]);
      notifyOnFail("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced fetchProducts for search
  const debouncedFetchProducts = useCallback(
    debounce((page, filters, searchTerm, limit) => {
      fetchProducts(page, filters, searchTerm, limit);
    }, 500),
    []
  );

  // Prepare CSV data (unchanged)
  const prepareCsvData = (productsData, isAll = false) => {
    if (!productsData || productsData.length === 0) return;

    const headers = [
      { label: "ID", key: "id" },
      { label: "Product Name", key: "name" },
      { label: "Category", key: "category" },
      { label: "Sub Category", key: "sub_category" },
      { label: "Image URL", key: "image" },
      { label: "Vendor ID", key: "vendor_id" },
      { label: "Base Price", key: "base_price" },
      { label: "MRP", key: "original_price" },
      { label: "Discount Price", key: "discount_price" },
      { label: "Shipping Charges", key: "shipping_charge" },
      { label: "Stock", key: "stock" },
      { label: "Status", key: "status" },
      { label: "Visibility", key: "visibility" },
      { label: "SKU", key: "sku" },
      { label: "HSN Code", key: "hsn_code" },
      { label: "Barcode", key: "barcode" },
      { label: "GST (%)", key: "gst" },
      { label: "Dead Weight", key: "package_weight" },
      { label: "Volumetric Weight", key: "volumetric_weight" },
      { label: "Package Height", key: "package_height" },
      { label: "Package Length", key: "package_length" },
      { label: "Package Width", key: "package_width" },
      { label: "Package Depth", key: "package_depth" },
      { label: "Type", key: "type" },
      { label: "Created At", key: "created_at" },
    ];

    const formattedData = productsData.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category || "N/A",
      sub_category: product.sub_category || "N/A",
      image: product.image || "",
      vendor_id: product.vendor_id,
      base_price: product.base_price,
      original_price: product.original_price,
      discount_price: product.discount_price,
      shipping_charge: product.shipping_charge,
      stock: product.stock,
      status: product.status ? "Active" : "Inactive",
      visibility: product.visibility,
      sku: product.sku || "",
      hsn_code: product.hsn_code || "",
      barcode: product.barcode || "",
      gst: product.gst || 0,
      package_weight: product.package_weight || 0,
      volumetric_weight: product.volumetric_weight || 0,
      package_height: product.package_height || 0,
      package_length: product.package_length || 0,
      package_width: product.package_width || 0,
      package_depth: product.package_depth || 0,
      type: product.type || "",
      created_at: new Date(product.created_at).toLocaleString(),
    }));

    if (isAll) {
      setCsvDataAll({ headers, data: formattedData });
    } else {
      setCsvData({ headers, data: formattedData });
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts(pagination.page, filters, searchTerm);
  }, []);

  // Handle search input change
  useEffect(() => {
    debouncedFetchProducts(1, filters, searchTerm, pagination.limit);
  }, [searchTerm, filters, pagination.limit, debouncedFetchProducts]);

  // Handle bulk visibility update (fixed with table.getSelectedRowModel)
  const handleBulkVisibilityUpdate = async (newVisibility) => {
    setIsProcessingBulkAction(true);
    try {
      const selectedRows = table.getSelectedRowModel().rows;
      const selectedIds = selectedRows.map((row) => row.original.id);

      if (selectedIds.length === 0) {
        notifyOnFail("Please select at least one product");
        return;
      }

      const response = await updateBulkProductVisibility({
        productIds: selectedIds,
        visibility: newVisibility,
      });

      if (response.status === 1) {
        notifyOnSuccess(
          `Successfully updated ${response.updatedCount} product(s) visibility to ${newVisibility}`
        );

        setDisplayedData((prevData) =>
          prevData.map((product) =>
            selectedIds.includes(product.id)
              ? { ...product, visibility: newVisibility }
              : product
          )
        );

        setRowSelection({});
      } else {
        notifyOnFail(response.message || "Failed to update products");
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
      notifyOnFail("Something went wrong. Please try again.");
    } finally {
      setIsProcessingBulkAction(false);
      setIsBulkActionModalOpen(false);
    }
  };

  const handleBulkCustomDeleteRefetch = useCallback(() => {
    fetchProducts(pagination.page, filters, searchTerm, pagination.limit);
    setRowSelection({});
  }, [pagination.page, filters, searchTerm, pagination.limit]);

  const openBulkCustomDeleteModal = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedCustomIds = selectedRows
      .map((row) => row.original.custom_id)
      .filter(Boolean);
    setBulkDeleteCustomIds(selectedCustomIds);
    setIsBulkCustomDeleteModalOpen(true);
  };

  const handleStatusToggle = useCallback(
    async (id) => {
      if (!id) return;
      try {
        const product = displayedData.find((p) => p.id === id);
        if (!product) {
          console.error("Error: Product not found.");
          return;
        }

        const updatedStatus =
          product.visibility === "Published" ? "Hidden" : "Published";

        const response = await updateProductVisibility(id, {
          visibility: updatedStatus,
        });

        if (response.status === 1) {
          notifyOnSuccess(`Status updated to ${updatedStatus}`);

          const updateVisibility = (list) =>
            list.map((p) =>
              p.id === id ? { ...p, visibility: updatedStatus } : p
            );

          setProducts((prevProducts) => updateVisibility(prevProducts));
          setDisplayedData((prevData) => updateVisibility(prevData));
        } else {
          notifyOnFail(response.message || "Failed to update the status.");
        }
      } catch (error) {
        console.error(
          "Error updating status:",
          error.response?.data || error.message
        );
        notifyOnFail("Something went wrong. Please try again.");
      }
    },
    [displayedData]
  );

  const openModal = useCallback((product, mode = "view") => {
    if (!product) return;
    setSelectedProduct(product);
    setModalMode(mode);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const openDeleteModal = useCallback((product) => {
    if (!product) return;
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  }, []);

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
        header: "Vendor",
        accessorKey: "vendor_name",
        cell: ({ row }) => <p>{row.original?.vendor_name || "N/A"}</p>,
      },
      {
        header: "Category",
        accessorKey: "category",
        cell: ({ row }) => <p>{row.original?.category || "N/A"}</p>,
      },
      {
        header: "Sub Category",
        accessorKey: "sub_category",
        cell: ({ row }) => <p>{row.original?.sub_category || "N/A"}</p>,
      },
      {
        header: "MRP",
        accessorKey: "original_price",
        cell: ({ row }) => (
          <span>
            ₹{row.original?.original_price?.toLocaleString("en-IN") || "0"}
          </span>
        ),
      },
      {
        header: "Shipping Charges",
        accessorKey: "shipping_charge",
        cell: ({ row }) => <span>{row.original?.shipping_charge || "0"}</span>,
      },
      {
        header: "Discount Price",
        accessorKey: "discount_price",
        cell: ({ row }) => <span>{row.original?.discount_price || "0"}</span>,
      },
      {
        header: "Status",
        accessorKey: "visibility",
        cell: ({ row }) => (
          <button
            onClick={() => handleStatusToggle(row.original?.id)}
            className={`px-2 py-1 rounded-md text-sm font-medium ${
              row.original?.visibility === "Published"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {row.original?.visibility || "N/A"}
          </button>
        ),
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
      {
        header: "Actions",
        accessorKey: "actions",
        disableSortBy: true,
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => openModal(row.original, "view")}
              className="p-2 rounded-full text-green-500 hover:bg-green-600 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                navigate(
                  `${config.VITE_BASE_ADMIN_URL}/product/edit/${row?.original?.id}`
                );
              }}
              className="p-2 rounded-full text-[#5897F7] hover:bg-[#5897F7] hover:text-white transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="p-2 rounded-full text-[#FD7777] hover:bg-[#FD7777] hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [
      pagination.page,
      pagination.limit,
      handleStatusToggle,
      openModal,
      openDeleteModal,
      navigate,
    ] // Added dependencies
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

  const handleExportCSV = () => {
    if (csvLinkRef.current && csvData.data && csvData.data.length > 0) {
      csvLinkRef.current.link.click();
    } else {
      notifyOnFail("No data available for export");
    }
  };

  const handleExportAllCSV = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: 1,
        limit: pagination.total,
        search: searchTerm,
        category: filters.category_name || "",
        stock: filters.stock || "",
        visibility: filters.visibility || "",
        vendor_id: filters.vendor_id || "",
      });

      const response = await getAllProducts(queryParams.toString());
      const allData = response?.data?.filter((item) => item && item.id) || [];
      prepareCsvData(allData, true);

      setTimeout(() => {
        if (csvLinkAllRef.current) {
          csvLinkAllRef.current.link.click();
        }
      }, 100);
    } catch (error) {
      console.error("Error fetching all products for export:", error);
      notifyOnFail("Failed to export all products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setIsDeletingProduct(true);

    try {
      const response = await deleteProduct(selectedProduct.id);

      if (response.status === 1) {
        setIsDeleteModalOpen(false);
        await fetchProducts(pagination.page, filters, searchTerm);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      notifyOnFail("Unable to delete the product");
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category_name: "",
      stock: "",
      visibility: "",
      vendor_id: "",
    });
    setSearchTerm("");
    fetchProducts(1, {}, "");
  };

  const handlePageChange = (newPage) => {
    fetchProducts(newPage, filters, searchTerm, pagination.limit);
  };

  const handleLimitChange = (newLimit) => {
    setRowSelection({});
    fetchProducts(1, filters, searchTerm, newLimit);
  };

  const handleFirstPage = () => {
    handlePageChange(1);
  };

  const handleLastPage = () => {
    handlePageChange(pagination.totalPages);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openBulkActionModal = () => {
    if (selectedRowCount === 0) {
      notifyOnFail("Please select at least one product");
      return;
    }
    setIsBulkActionModalOpen(true);
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
          All Products
        </h2>
        <button
          className="w-full sm:w-auto px-8 py-2 bg-[#F47954] text-white rounded-md flex items-center justify-center"
          onClick={() => navigate(`${config.VITE_BASE_ADMIN_URL}/product/add`)}
        >
          <Plus className="mr-2" /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between mb-5 gap-4">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full sm:w-auto border-gray-100 border py-3 px-10 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-400"
          />
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 text-lg" />
        </div>

        <div className="flex gap-2">
          {selectedRowCount > 0 && (
            <>
              <button
                onClick={openBulkActionModal}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center"
              >
                Update Status ({selectedRowCount})
              </button>
            </>
          )}

          <button
            onClick={openBulkCustomDeleteModal}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md flex items-center justify-center"
          >
            Bulk Delete by Product ID
            {selectedRowCount > 0 && ` (${selectedRowCount} selected)`}
          </button>

          <button
            onClick={handleExportCSV}
            className="w-full sm:w-auto px-4 py-2 bg-[#F47954] text-white rounded-md flex items-center justify-center"
          >
            <Download className="mr-2" size={20} />
            Export Current
          </button>

          <button
            onClick={handleExportAllCSV}
            className="w-full sm:w-auto px-4 py-2 bg-[#F47954] text-white rounded-md flex items-center justify-center"
          >
            <Download className="mr-2" size={20} />
            Export All
          </button>

          {csvData.data && csvData.headers && (
            <CSVLink
              data={csvData.data}
              headers={csvData.headers}
              filename={`Products_Page_${
                pagination.page
              }_${new Date().toLocaleDateString()}.csv`}
              className="hidden"
              ref={csvLinkRef}
            />
          )}

          {csvDataAll.data && csvDataAll.headers && (
            <CSVLink
              data={csvDataAll.data}
              headers={csvDataAll.headers}
              filename={`All_Products_${new Date().toLocaleDateString()}.csv`}
              className="hidden"
              ref={csvLinkAllRef}
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-md px-3 py-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
          <FilterSelect
            label="Vendor"
            options={vendorOptions}
            value={filters.vendor_id}
            onChange={(e) => handleFilterChange("vendor_id", e.target.value)}
          />
          <FilterSelect
            label="Category"
            options={categoryOptions}
            value={filters.category_name}
            onChange={(e) =>
              handleFilterChange("category_name", e.target.value)
            }
          />
          <FilterSelect
            label="Visibility"
            options={visibilityOptions}
            value={filters.visibility}
            onChange={(e) => handleFilterChange("visibility", e.target.value)}
          />
          <NumberInput
            label="Stock"
            value={filters.stock}
            onChange={(e) => handleFilterChange("stock", e.target.value)}
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
            onClick={handleFirstPage}
            disabled={pagination.page <= 1}
            className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
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
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleLastPage}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showModal && (
        <ProductModal
          isOpen={showModal}
          onClose={closeModal}
          product={selectedProduct}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete the product "${selectedProduct?.name}"? This action cannot be undone.`}
        isDeleting={isDeletingProduct}
      />

      <BulkCustomDeleteModal
        isOpen={isBulkCustomDeleteModalOpen}
        onClose={() => setIsBulkCustomDeleteModalOpen(false)}
        initialCustomIds={bulkDeleteCustomIds}
        onRefetch={handleBulkCustomDeleteRefetch}
      />

      <BulkActionModal
        isOpen={isBulkActionModalOpen}
        onClose={() => setIsBulkActionModalOpen(false)}
        onAction={(visibility) => handleBulkVisibilityUpdate(visibility)}
        title="Update Product Visibility"
        options={[
          { value: "Published", label: "Mark as Published" },
          { value: "Hidden", label: "Mark as Hidden" },
        ]}
        isProcessing={isProcessingBulkAction}
        selectedCount={selectedRowCount}
      />
    </div>
  );
};

export default Product;
