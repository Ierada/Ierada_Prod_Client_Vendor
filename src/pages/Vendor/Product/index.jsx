import React, { useState, useMemo } from "react";
import {
  useTable,
  usePagination,
  useSortBy,
  useGlobalFilter,
} from "react-table";

import {
  Eye,
  Edit,
  Trash2,
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductModal from "../../../components/Vendor/Models/ProductModal";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import { useEffect } from "react";
import {
  deleteProduct,
  getProductsByVendorId,
} from "../../../services/api.product";
import { useAppContext } from "../../../context/AppContext";
import { notifyOnFail } from "../../../utils/notification/toast";
import config from "../../../config/config";
import { motion } from "framer-motion";

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-12 bg-gray-200 rounded mb-4" />
    {[...Array(5)].map((_, idx) => (
      <div key={idx} className="h-20 bg-gray-100 rounded mb-2 p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-12"
  >
    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
    <h3 className="text-xl font-medium text-gray-900 mb-2">
      No Products Found
    </h3>
    <p className="text-gray-500">
      Start by adding your first product to the store.
    </p>
  </motion.div>
);

const Product = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getProductsByVendorId(user.id);
      if (response.status === 1) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      notifyOnFail("Unable to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const getTotalStock = (variations) => {
    return variations.reduce((total, variation) => {
      return (
        total +
        variation.sizes.reduce((sizeTotal, size) => sizeTotal + size.stock, 0)
      );
    }, 0);
  };

  const getMainImage = (media) => {
    return (
      media?.find((m) => m.type === "image")?.url || "/placeholder-image.jpg"
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "SL",
        accessor: (row, index) => index + 1,
        disableSortBy: true,
      },
      {
        Header: "Product Photo",
        accessor: "media",
        Cell: ({ row }) => (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={getMainImage(row.original.media)}
            alt={row.original.name}
            className="w-16 h-16 object-cover rounded shadow-sm"
          />
        ),
      },
      {
        Header: "Product Name",
        accessor: "name",
      },
      {
        Header: "Category",
        accessor: "Category.title",
        Cell: ({ row }) => (
          <div className="space-y-1">
            <p>{row.original.Category?.title || "N/A"}</p>
            <p className="text-sm text-gray-500">
              {row.original.SubCategory?.title || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              {row.original.InnerSubCategory?.title || "N/A"}
            </p>
          </div>
        ),
      },
      {
        Header: "Visibility",
        accessor: "visibility",
        Cell: ({ row }) => (
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`px-3 py-1 rounded-full text-sm ${
              row.original.visibility === "Published"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.original.visibility}
          </motion.span>
        ),
      },
      {
        Header: "Pricing",
        accessor: "original_price",
        Cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">
              {formatPrice(row.original.original_price)}
            </p>
            {row.original.discounted_price && (
              <p className="text-sm text-gray-500 line-through">
                {formatPrice(row.original.discounted_price)}
              </p>
            )}
          </div>
        ),
      },
      {
        Header: "Stock",
        accessor: "stock",
        Cell: ({ row }) => (
          <span className="bg-blue-50 px-3 py-1 rounded text-blue-700 font-medium">
            {row.original.is_variation
              ? getTotalStock(row.original.variations)
              : row.original.stock}
          </span>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        disableSortBy: true,
        Cell: ({ row }) => (
          <motion.div
            className="flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <button
              onClick={() => openModal(row.original)}
              className="p-2 rounded-full text-green-500 hover:bg-green-600 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                navigate(
                  `${config.VITE_BASE_VENDOR_URL}/product/edit/${row.original.id}`
                )
              }
              className="p-2 rounded-full text-blue-500 hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="p-2 rounded-full text-red-500 hover:bg-red-600 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable(
    {
      columns,
      data: products,
      initialState: { pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const getPageNumbers = () => {
    const totalPages = pageCount;
    const currentPage = pageIndex + 1;
    let pagesToShow = [];

    // Show all pages if there are 5 or fewer
    if (totalPages <= 5) {
      pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always show first page
      pagesToShow.push(1);

      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range if at edges
      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      // Add ellipsis if needed at start
      if (start > 2) {
        pagesToShow.push("...");
      }

      // Add pages in range
      for (let i = start; i <= end; i++) {
        pagesToShow.push(i);
      }

      // Add ellipsis if needed at end
      if (end < totalPages - 1) {
        pagesToShow.push("...");
      }

      // Always show last page
      pagesToShow.push(totalPages);
    }

    return pagesToShow;
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800">
          All Products
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-lg transition-colors"
          onClick={() =>
            navigate(
              `${config.VITE_BASE_VENDOR_URL}/product/addProduct/${user.id}`
            )
          }
        >
          + Add Product
        </motion.button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full rounded-lg pl-10 pr-4 py-3 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : products.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg overflow-hidden shadow-sm border"
        >
          <div className="overflow-x-auto">
            <table {...getTableProps()} className="w-full">
              <thead className="bg-gray-50">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                        className="px-4 py-4 text-left text-sm font-semibold text-gray-700 border-b"
                      >
                        <div className="flex items-center space-x-1">
                          {column.render("Header")}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? " ↓"
                                : " ↑"
                              : ""}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map((row) => {
                  prepareRow(row);
                  return (
                    <motion.tr
                      {...row.getRowProps()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="px-4 py-4">
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="flex items-center gap-2">
              {getPageNumbers().map((pageNumber, index) => {
                if (pageNumber === "...") {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2">
                      {pageNumber}
                    </span>
                  );
                }
                return (
                  <button
                    key={pageNumber}
                    onClick={() => gotoPage(pageNumber - 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      pageIndex === pageNumber - 1
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-gray-600"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-gray-600"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <ProductModal
        isOpen={showModal}
        onClose={closeModal}
        product={selectedProduct}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        isDeleting={isDeletingProduct}
      />
    </motion.div>
  );
};

export default Product;
