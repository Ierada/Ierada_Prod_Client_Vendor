import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
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
  Eye,
  Download,
  Upload,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";
import { debounce } from "../../../utils/debounce";
import {
  getLikesReport,
  getProductLikes,
  generateLikeTemplate,
  bulkLikeUpdate,
} from "../../../services/api.likes";

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

const LikesReport = () => {
  const [products, setProducts] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
    category: "",
    vendor_id: "",
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [productLikes, setProductLikes] = useState([]);
  const [likesLoading, setLikesLoading] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const limitOptions = [5, 10, 25, 50, 100];

  const fetchLikesReport = async (
    page = 1,
    filters = {},
    search = "",
    limit = pagination.limit
  ) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        category: filters.category || "",
        vendor_id: filters.vendor_id || "",
      });

      const response = await getLikesReport(queryParams.toString());
      const data = response?.data?.filter((item) => item && item.id) || [];
      setProducts(data);
      setDisplayedData(data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });

      // Set category options
      if (response.filters && response.filters.categories) {
        setCategoryOptions(
          response.filters.categories.map((cat) => ({
            value: cat.id,
            label: cat.title,
          }))
        );
      }

      // Set vendor options
      if (response.filters && response.filters.vendors) {
        setVendorOptions(
          response.filters.vendors.map((vendor) => ({
            value: vendor.id,
            label: vendor.name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching likes report:", error);
      setProducts([]);
      setDisplayedData([]);
      notifyOnFail("Failed to fetch likes report");
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchLikesReport = useCallback(
    debounce((page, filters, searchTerm, limit) => {
      fetchLikesReport(page, filters, searchTerm, limit);
    }, 500),
    []
  );

  // Fetch product likes for modal
  const fetchProductLikes = async (productId) => {
    setLikesLoading(true);
    try {
      const response = await getProductLikes(productId);
      setProductLikes(response.data || []);
    } catch (error) {
      console.error("Error fetching product likes:", error);
      notifyOnFail("Failed to fetch user likes");
      setProductLikes([]);
    } finally {
      setLikesLoading(false);
    }
  };

  const openLikesModal = async (product) => {
    console.log("Opening likes modal for product:", product);
    if (!product) return;
    setSelectedProduct(product);
    await fetchProductLikes(product.id);
    setShowLikesModal(true);
  };

  const closeLikesModal = () => {
    setShowLikesModal(false);
    setSelectedProduct(null);
    setProductLikes([]);
  };

  // Bulk template download
  const handleGenerateTemplate = async () => {
    try {
      const response = await generateLikeTemplate();
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "likes_update_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      notifyOnSuccess("Template downloaded successfully");
    } catch (error) {
      console.error("Error generating template:", error);
      notifyOnFail("Failed to generate template");
    }
  };

  // Bulk upload
  const handleBulkUpload = async () => {
    if (!bulkFile) {
      notifyOnFail("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", bulkFile);

    try {
      const response = await bulkLikeUpdate(formData);
      if (response.status === 1) {
        notifyOnSuccess(response.message);
        setBulkFile(null);
        fileInputRef.current.value = "";
        // Refetch data
        fetchLikesReport(
          pagination.page,
          filters,
          searchTerm,
          pagination.limit
        );
      } else {
        notifyOnFail(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading bulk likes:", error);
      notifyOnFail("Upload failed");
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLikesReport(pagination.page, filters, searchTerm);
  }, []);

  // Handle search and filters
  useEffect(() => {
    debouncedFetchLikesReport(1, filters, searchTerm, pagination.limit);
  }, [searchTerm, filters, pagination.limit, debouncedFetchLikesReport]);

  const columns = useMemo(
    () => [
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
        header: "Product Name",
        accessorKey: "name",
        cell: ({ row }) => <p>{row.original?.name || "N/A"}</p>,
      },
      {
        header: "SKU",
        accessorKey: "sku",
        cell: ({ row }) => <p>{row.original?.sku || "N/A"}</p>,
      },
      {
        header: "Category",
        accessorKey: "category",
        cell: ({ row }) => <p>{row.original?.Category?.title || "N/A"}</p>,
      },
      {
        header: "Vendor",
        accessorKey: "vendor_name",
        cell: ({ row }) => (
          <p>
            {row.original?.User?.vendorDetails
              ? `${row.original.User.vendorDetails.first_name} ${row.original.User.vendorDetails.last_name}`
              : "N/A"}
          </p>
        ),
      },
      {
        header: "Total Likes",
        accessorKey: "total_likes",
        cell: ({ row }) => (
          <span className="font-medium">{row.original?.total_likes || 0}</span>
        ),
      },
      {
        header: "Actions",
        accessorKey: "actions",
        disableSortBy: true,
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => openLikesModal(row.original)}
              className={`${
                row.original?.total_likes === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "text-blue-500 hover:bg-blue-600 hover:text-white"
              } p-2 rounded-full transition-colors`}
              disabled={row.original?.total_likes === 0}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
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
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: "", vendor_id: "" });
    setSearchTerm("");
    fetchLikesReport(1, {}, "");
  };

  const handlePageChange = (newPage) => {
    fetchLikesReport(newPage, filters, searchTerm, pagination.limit);
  };

  const handleLimitChange = (newLimit) => {
    fetchLikesReport(1, filters, searchTerm, newLimit);
  };

  const handleFirstPage = () => handlePageChange(1);
  const handleLastPage = () => handlePageChange(pagination.totalPages);
  const handleSearch = (e) => setSearchTerm(e.target.value);

  const getVisiblePageNumbers = () => {
    const maxButtons = 5;
    const { page, totalPages } = pagination;
    if (totalPages <= maxButtons)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
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
          Likes Report
        </h2>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center justify-between mb-5 gap-4">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by product name or SKU"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full sm:w-auto border-gray-100 border py-3 px-10 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-400"
          />
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 text-lg" />
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleGenerateTemplate}
            className="px-4 py-2 bg-[#F47954] text-white rounded-md flex items-center justify-center"
          >
            <Download className="mr-2 w-4 h-4" /> Generate Template
          </button>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx"
              onChange={(e) => setBulkFile(e.target.files[0])}
              className="hidden"
              id="bulk-upload"
            />
            <label
              htmlFor="bulk-upload"
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center cursor-pointer"
            >
              <Upload className="mr-2 w-4 h-4" /> Upload File
            </label>
            {bulkFile && (
              <button
                onClick={handleBulkUpload}
                className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center justify-center"
              >
                Process Upload
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-md px-3 py-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
          <FilterSelect
            label="Category"
            options={categoryOptions}
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          />
          <FilterSelect
            label="Vendor"
            options={vendorOptions}
            value={filters.vendor_id}
            onChange={(e) => handleFilterChange("vendor_id", e.target.value)}
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

      {/* Products Table */}
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
                      className={`py-4 text-left text-sm font-medium text-[#333843] px-6`}
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
                        {header.column.getCanSort() && (
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
                          className="py-4 text-[#1C2A53] text-sm px-6"
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
                      No likes report found
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
            onClick={handleFirstPage}
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
            onClick={handleLastPage}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal for Product Likes */}
      {showLikesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Users who liked "{selectedProduct?.name}" (Total:{" "}
                {productLikes.length})
              </h3>
              <button
                onClick={closeLikesModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              {likesLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F47954]"></div>
                </div>
              ) : productLikes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-3 px-6 text-left text-sm font-medium text-gray-900">
                          User ID
                        </th>
                        <th className="py-3 px-6 text-left text-sm font-medium text-gray-900">
                          Name
                        </th>
                        <th className="py-3 px-6 text-left text-sm font-medium text-gray-900">
                          Email
                        </th>
                        <th className="py-3 px-6 text-left text-sm font-medium text-gray-900">
                          Phone
                        </th>
                        <th className="py-3 px-6 text-left text-sm font-medium text-gray-900">
                          Liked At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {productLikes.map((like, index) => (
                        <tr key={like.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-6 text-sm text-gray-900">
                            {like.User.id}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900">
                            {like.User?.customerDetails?.first_name}{" "}
                            {like.User?.customerDetails?.last_name}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900">
                            {like.User.email}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900">
                            {like.User.phone || "N/A"}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900">
                            {new Date(like.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">
                  No users found for this product.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LikesReport;
