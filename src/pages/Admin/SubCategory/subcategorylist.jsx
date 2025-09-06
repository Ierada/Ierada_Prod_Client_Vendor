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
  Plus,
} from "lucide-react";
import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";
import {
  getSubCategories,
  deleteSubCategory,
} from "../../../services/api.category";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import SubCategoryModal from "../../../components/Admin/modals/SubCategoryModal";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import { getCategories } from "../../../services/api.category";
import { CiImport } from "react-icons/ci";

const SubCategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const [subCategories, setSubCategories] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingSubCategory, setIsDeletingSubCategory] = useState(false);

  const fetchSubCategories = async () => {
    try {
      const response = await getSubCategories();
      setSubCategories(response.data || []);
    } catch (error) {
      notifyOnFail("Failed to fetch subcategories.");
      setSubCategories([]);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

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

  const openModal = (subCategory, mode) => {
    setSelectedSubCategory(subCategory);
    setModalMode(mode);

    setShowModal(true);
  };

  const closeModal = async () => {
    setShowModal(false);
    await fetchSubCategories();
  };

  const openDeleteModal = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSubCategory) return;
    setIsDeletingSubCategory(true);
    try {
      const res = await deleteSubCategory(selectedSubCategory.id);
      if (res) {
        // notifyOnSuccess("SubCategory deleted successfully.");
        // setSubCategories(prev =>
        //   prev.filter(s => s.id !== selectedSubCategory.id)
        // );
        setIsDeleteModalOpen(false);
        await fetchSubCategories();
      }
    } catch (error) {
      notifyOnFail("Failed to delete subcategory.");
    } finally {
      setIsDeletingSubCategory(false);
      setIsDeleteModalOpen(false);
    }
  };

  const exportToCSV = () => {
    if (!subCategories || subCategories.length === 0) return;

    // Define CSV header
    const headers = [
      "ID",
      "Title",
      "Subtitle",
      "Category",
      "HSN Code",
      "Image",
    ];

    // Format data rows
    const rows = subCategories.map((sub) => [
      sub.id,
      sub.title,
      sub.subtitle || "",
      categories.find((c) => c.id === sub.cat_id)?.title || "N/A",
      sub.hsn_code || "",
      sub.image || "",
    ]);

    // Combine headers and rows
    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `subcategories_${new Date().toISOString()}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: "SL",
      cell: ({ row }) => row.index + 1,
      disableSortBy: true,
    },
    {
      accessorKey: "title",
      header: "SubCategory",
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
      accessorKey: "cat_id",
      header: "Category",
      cell: ({ row }) => {
        const category = categories.find(
          (category) => category.id === row.original.cat_id
        );
        return (
          <span className="text-sm">{category ? category.title : "N/A"}</span>
        );
      },
    },

    {
      accessorKey: "subtitle",
      header: "Sub Title",
      Cell: ({ value }) => <span className="text-sm">{value || "N/A"}</span>,
    },
    {
      header: "HSN Code",
      accessorKey: "hsn_code",
      Cell: ({ value }) => <span className="text-sm">{value || "N/A"}</span>,
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
            onClick={() =>
              navigate(
                `${config.VITE_BASE_ADMIN_URL}/subcategories/add?id=${row.original.id}`
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
        </div>
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: subCategories,
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
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800">
            All SubCategories
          </h2>
          <button
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-gray-800 text-lg transition-colors"
            onClick={() =>
              navigate(`${config.VITE_BASE_ADMIN_URL}/subcategories/add`)
            }
          >
            <Plus className="w-5 h-5" /> Add SubCategory
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search category..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full px-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47954]"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={exportToCSV}
            className="w-full sm:w-auto px-4 py-2 bg-[#F47954] text-white rounded-md flex items-center justify-center"
          >
            <CiImport className="mr-2" size={20} />
            Export Data
          </button>
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
          <SubCategoryModal
            isOpen={showModal}
            onClose={closeModal}
            mode={modalMode}
            subCategory={selectedSubCategory}
          />
        )}

        {isDeleteModalOpen && (
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            handleDelete={handleDelete}
            isDeleting={isDeletingSubCategory}
            title="Delete Slider"
            message="Are you sure you want to delete this slider? This action cannot be undone."
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default SubCategoryList;
