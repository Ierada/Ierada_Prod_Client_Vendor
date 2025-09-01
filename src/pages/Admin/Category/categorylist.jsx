import React, { useState, useEffect } from "react";
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
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";
import {
  getCategories,
  deleteCategory,
  exportCategoriesCSV,
} from "../../../services/api.category";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import CategoryModal from "../../../components/Admin/modals/CategoryModal";
import { useNavigate } from "react-router-dom";

const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      notifyOnFail("Failed to fetch categories.");
      setCategories([]);
    }
  };

  const openModal = (category, mode) => {
    setSelectedCategory(category);
    setModalMode(mode);
    setShowModal(true);
  };

  const closeModal = async () => {
    setShowModal(false);
    setSelectedCategory(null);
    await fetchCategories();
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setIsDeletingCategory(true);
    try {
      const res = await deleteCategory(selectedCategory.id);
      if (res.status === 1) {
        notifyOnSuccess("Category deleted successfully.");
        await fetchCategories();
      }
    } catch (error) {
      notifyOnFail("Failed to delete category.");
    } finally {
      setIsDeletingCategory(false);
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await exportCategoriesCSV();

      if (!response || response.status !== 200) {
        throw new Error("Export failed");
      }

      // Get filename from Content-Disposition header if available, or use default
      let filename = "categories-export.csv";
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create blob from response data and trigger download
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notifyOnSuccess("Categories exported successfully.");
    } catch (error) {
      console.error("Export error:", error);
      notifyOnFail("Failed to export categories.");
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      header: "SL",
      cell: ({ row }) => row.index + 1,
      disableSortBy: true,
    },
    {
      accessorKey: "title",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.image || "/placeholder.png"}
            alt=""
            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
          />
          <div>
            <h3 className="font-medium text-gray-900">{row.original.title}</h3>
            <p className="text-sm text-gray-500">
              {row.original.subtitle || "All winter clothes"}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.meta_description,
    },
    // {
    //   accessorKey: 'products',
    //   header: 'Products',
    //   cell: ({ row }) => row.original.total_products,
    // },
    {
      accessorKey: "added",
      header: "Added",
      cell: () => "29 Aug 2024",
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal(row.original, "view")}
            className="p-2 rounded-full text-green-500 hover:bg-green-600 hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openModal(row.original, "edit")}
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
        </div>
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: categories,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Categories</h1>
          <div className="flex gap-4">
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export
                </>
              )}
            </button>
            <button
              onClick={() => navigate("/admin/categories/add")}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-coral-600 transition-colors flex items-center gap-2"
            >
              + Add New Category
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search category..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full px-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47954]"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {table.getFlatHeaders().map((header) => (
                    <th
                      key={header.id}
                      className="bg-white px-6 py-4 text-left text-sm font-medium text-gray-500"
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
                          <div className="flex flex-col">
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
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="flex items-center gap-2">
              {Array.from(
                { length: table.getPageCount() },
                (_, i) => i + 1
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => table.setPageIndex(pageNumber - 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md ${
                    table.getState().pagination.pageIndex === pageNumber - 1
                      ? "bg-[#F47954] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex items-center gap-2 text-gray-600 hover:text-[#F47954] disabled:opacity-50 disabled:hover:text-gray-600"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex items-center gap-2 text-gray-600 hover:text-[#F47954] disabled:opacity-50 disabled:hover:text-gray-600"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showModal && (
          <CategoryModal
            isOpen={showModal}
            onClose={closeModal}
            mode={modalMode}
            category={selectedCategory}
          />
        )}

        {isDeleteModalOpen && (
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            isDeleting={isDeletingCategory}
            title="Delete Category"
            message="Are you sure you want to delete this category? This action cannot be undone."
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryList;
