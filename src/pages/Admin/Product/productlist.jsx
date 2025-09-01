import React, { useState, useMemo, useEffect } from "react";
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
} from "../../../services/api.product";
import config from "../../../config/config";
import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";
import { CSVLink } from "react-csv";
import BulkActionModal from "../../../components/Admin/modals/BulkActionModal";

const FilterSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <label className="text-sm font-medium text-txtPage">{label}</label>
      <div
        className="w-full p-2 border rounded-md bg-white flex justify-between items-center cursor-pointer border-gray-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || label}
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
          {options?.map((option, index) => (
            <div
              key={index}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange({ target: { value: option } });
                setIsOpen(false);
              }}
            >
              {option}
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

const Product = () => {
  const [products, setProducts] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
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
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [visibilityOptions, setVisibilityOptions] = useState([
    "All",
    "Published",
    "Hidden",
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // New state for row selection
  const [rowSelection, setRowSelection] = useState({});
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [isProcessingBulkAction, setIsProcessingBulkAction] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const csvLinkRef = React.useRef();

  // Added for pagination limit options
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
      });

      const response = await getAllProducts(queryParams.toString());

      setProducts(response?.data || []);
      setDisplayedData(response?.data || []);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });

      // Prepare CSV data when products are loaded
      prepareCSVData(response?.data || []);

      // Store category options for dropdown
      if (response.filters && response.filters.categories) {
        setCategoryOptions(response.filters.categories);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setDisplayedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Improved CSV data preparation with all major fields
  const prepareCSVData = (productsData) => {
    if (!productsData || productsData.length === 0) return;

    // Define CSV headers based on the API response
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
      { label: "Package Weight", key: "package_weight" },
      { label: "Package Height", key: "package_height" },
      { label: "Package Length", key: "package_length" },
      { label: "Package Width", key: "package_width" },
      { label: "Package Depth", key: "package_depth" },
      { label: "Type", key: "type" },
      { label: "Created At", key: "created_at" },
    ];

    // Format data for CSV
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
      package_height: product.package_height || 0,
      package_length: product.package_length || 0,
      package_width: product.package_width || 0,
      package_depth: product.package_depth || 0,
      type: product.type || "",
      created_at: new Date(product.created_at).toLocaleString(),
    }));

    setCsvData({
      headers: headers,
      data: formattedData,
    });
  };

  useEffect(() => {
    fetchProducts(pagination.page, filters, searchTerm);
  }, []);

  // Handle bulk action for visibility update
  const handleBulkVisibilityUpdate = async (newVisibility) => {
    setIsProcessingBulkAction(true);
    try {
      const selectedIds = Object.keys(rowSelection).map(Number);

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

        // Update local state to reflect changes
        setDisplayedData((prevData) =>
          prevData.map((product) =>
            selectedIds.includes(product.id)
              ? { ...product, visibility: newVisibility }
              : product
          )
        );

        // Clear selection after successful update
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

  // Get count of selected rows
  const selectedRowCount = Object.keys(rowSelection).length;

  const columns = useMemo(
    () => [
      // Add checkbox column for row selection
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
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Product ID",
        accessorKey: "id",
      },
      {
        header: "Product Photo",
        accessorKey: "image",
        cell: ({ row }) =>
          row.original.image ? (
            <img
              src={row.original.image}
              alt={row.original.name}
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
        cell: ({ row }) => <p>{row.original.name}</p>,
      },
      {
        header: "Category",
        accessorKey: "category",
        cell: ({ row }) => <p>{row.original.category || "N/A"}</p>,
      },
      {
        header: "Sub Category",
        accessorKey: "sub_category",
        cell: ({ row }) => <p>{row.original.sub_category || "N/A"}</p>,
      },
      {
        header: "MRP",
        accessorKey: "original_price",
        cell: ({ row }) => (
          <span>₹{row.original.original_price?.toLocaleString("en-IN")}</span>
        ),
      },
      {
        header: "Shipping Charges",
        accessorKey: "shipping_charge",
      },
      {
        header: "Discount Price",
        accessorKey: "discount_price",
      },
      {
        header: "Status",
        accessorKey: "visibility",
        cell: ({ row }) => (
          <button
            onClick={() => handleStatusToggle(row.original.id)}
            className={`px-2 py-1 rounded-md text-sm font-medium ${
              row.original.visibility === "Published"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {row.original.visibility}
          </button>
        ),
      },
      {
        header: "Stock",
        accessorKey: "stock",
      },
      {
        header: "Created At",
        accessorKey: "created_at",
        cell: ({ row }) => (
          <span>{new Date(row.original.created_at).toLocaleString()}</span>
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
                  `${config.VITE_BASE_ADMIN_URL}/product/edit/${row?.original.id}`
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
    []
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

  const handleStatusToggle = async (id) => {
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
  };

  // Export to CSV handler
  const handleExportCSV = () => {
    if (csvLinkRef.current && csvData.data && csvData.data.length > 0) {
      csvLinkRef.current.link.click();
    } else {
      notifyOnFail("No data available for export");
    }
  };

  // Keep other existing functions (openModal, closeModal, handleDelete, etc.)
  const openModal = (product) => {
    setModalMode(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setIsDeletingProduct(true);

    try {
      const response = await deleteProduct(selectedProduct.id);

      if (response.status === 1) {
        setIsDeleteModalOpen(false);
        await fetchProducts();
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
    });
    setSearchTerm("");
    fetchProducts(1, {}, ""); // Reset to first page with no filters
  };

  // Apply filters
  const handleShowData = () => {
    fetchProducts(1, filters, searchTerm); // Reset to first page with new filters
  };

  // Updated pagination handlers
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

  // Open bulk action modal
  const openBulkActionModal = () => {
    if (selectedRowCount === 0) {
      notifyOnFail("Please select at least one product");
      return;
    }
    setIsBulkActionModalOpen(true);
  };

  // Get visible page numbers for pagination
  const getVisiblePageNumbers = () => {
    const maxButtons = 5; // Maximum number of page buttons to show
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
            <button
              onClick={openBulkActionModal}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center"
            >
              Update Status ({selectedRowCount})
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="w-full sm:w-auto px-4 py-2 bg-[#F47954] text-white rounded-md flex items-center justify-center"
          >
            <Download className="mr-2" size={20} />
            Export CSV
          </button>

          {/* Hidden CSVLink component */}
          {csvData.data && csvData.headers && (
            <CSVLink
              data={csvData.data}
              headers={csvData.headers}
              filename={`Products_${new Date().toLocaleDateString()}.csv`}
              className="hidden"
              ref={csvLinkRef}
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-md px-3 py-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
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

        <div className="flex gap-3 col-span-2 mt-3 md:justify-end md:-mt-11">
          <button
            className="px-6 py-2 bg-gray-300 text-[#4C4C1F] text-sm font-medium rounded-2xl"
            onClick={clearFilters}
          >
            Clear
          </button>
          <button
            className="px-6 py-3 bg-[#F47954] text-sm font-medium text-white rounded-2xl"
            onClick={handleShowData}
          >
            Show Data
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
                      className="px-6 py-4 text-left text-sm font-medium text-[#333843]"
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
                {displayedData.length > 0 ? (
                  displayedData.map((product, index) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      {/* Checkbox column */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        <div className="px-1">
                          <input
                            type="checkbox"
                            checked={!!rowSelection[product.id]}
                            onChange={() => {
                              setRowSelection((prev) => ({
                                ...prev,
                                [product.id]: !prev[product.id],
                              }));
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </div>
                      </td>

                      {/* Serial number */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>

                      {/* Product ID */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        {product?.custom_id}
                      </td>

                      {/* Product Photo */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </td>

                      {/* Product Name */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        {product.name}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        {product.category || "N/A"}
                      </td>

                      {/* Sub Category */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        {product.sub_category || "N/A"}
                      </td>

                      {/* MRP */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        ₹{product.original_price?.toLocaleString("en-IN")}
                      </td>

                      {/* Shipping Charges */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        {product.shipping_charge}
                      </td>

                      {/* Discount Price */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        {product.discount_price}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        <button
                          onClick={() => handleStatusToggle(product.id)}
                          className={`px-2 py-1 rounded-md text-sm font-medium ${
                            product.visibility === "Published"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.visibility}
                        </button>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        {product.stock}
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        {new Date(product.created_at).toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-[#1C2A53] text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal(product, "view")}
                            className="p-2 rounded-full text-green-500 hover:bg-green-600 hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              navigate(
                                `${config.VITE_BASE_ADMIN_URL}/product/edit/${product.id}`
                              );
                            }}
                            className="p-2 rounded-full text-[#5897F7] hover:bg-[#5897F7] hover:text-white transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-2 rounded-full text-[#FD7777] hover:bg-[#FD7777] hover:text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
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

      {/* Enhanced pagination section */}
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

      {/* Product Modals */}
      {showModal && (
        <ProductModal
          isOpen={showModal}
          onClose={closeModal}
          product={modalMode}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete the product "${selectedProduct?.name}"? This action cannot be undone.`}
        isDeleting={isDeletingProduct}
      />

      {/* Bulk Action Modal */}
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
