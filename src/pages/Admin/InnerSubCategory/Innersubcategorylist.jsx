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
  getInnerSubCategories,
  deleteInnerSubCategory,
  getCategories,
} from "../../../services/api.category";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import InnerSubCategoryModal from "../../../components/Admin/modals/InnerSubCategoryModal";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";

const InnerSubCategoryList = () => {
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState([]);

  const [innerSubCategories, setInnerSubCategories] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedInnerSubCategory, setselectedInnerSubCategory] =
    useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingSubCategory, setIsDeletingSubCategory] = useState(false);

  const fetchInnerSubCategories = async () => {
    try {
      const response = await getInnerSubCategories();
      setInnerSubCategories(response.data || []);
    } catch (error) {
      notifyOnFail("Failed to fetch Innersubcategories.");
      setInnerSubCategories([]);
    }
  };

  useEffect(() => {
    fetchInnerSubCategories();
  }, []);

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const response = await getSubCategories();
      setSubCategories(response.data || []);
    } catch (error) {
      notifyOnFail("Failed to fetch SubCategories.");
      setSubCategories([]);
    }
  };

  const openModal = (InnerSubCategory, mode) => {
    setselectedInnerSubCategory(InnerSubCategory);
    setModalMode(mode);

    setShowModal(true);
  };

  const closeModal = async () => {
    setShowModal(false);
    await fetchInnerSubCategories();
  };

  const openDeleteModal = (innerSubCategory) => {
    setselectedInnerSubCategory(innerSubCategory);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedInnerSubCategory) return;
    setIsDeletingSubCategory(true);
    try {
      const res = await deleteInnerSubCategory(selectedInnerSubCategory.id);
      if (res.data === 1) {
        notifyOnSuccess("InnerSubCategory deleted successfully.");
        setInnerSubCategories((prev) =>
          prev.filter((s) => s.id !== selectedInnerSubCategory.id)
        );
        setIsDeleteModalOpen(false);
        await fetchInnerSubCategories();
      }
    } catch (error) {
      notifyOnFail("Failed to delete Innersubcategory.");
    } finally {
      setIsDeletingSubCategory(false);
      setIsDeleteModalOpen(false);
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
      header: "Inner Sub Category",
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
      accessorKey: "sub_cat_id",
      header: "SubCategory",
      cell: ({ row }) => {
        const subcategory = subCategories.find(
          (subcategory) => subcategory.id === row.original.sub_cat_id
        );
        return (
          <span className="text-sm">
            {subcategory ? subcategory.title : "N/A"}
          </span>
        );
      },
    },

    {
      accessorKey: "subtitle",
      header: "Sub Title",
      Cell: ({ value }) => <span className="text-sm">{value || "N/A"}</span>,
    },
    {
      header: "Slug",
      accessorKey: "slug",
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
    data: innerSubCategories,
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
            All InnerSubCategories
          </h2>
          <button
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded  text-lg transition-colors"
            onClick={() =>
              navigate(`${config.VITE_BASE_ADMIN_URL}/innersubcategories/add`)
            }
          >
            <Plus className="w-5 h-5" /> Add InnerSubCategory
          </button>
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
          <InnerSubCategoryModal
            isOpen={showModal}
            onClose={closeModal}
            mode={modalMode}
            innerSubCategory={selectedInnerSubCategory}
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

export default InnerSubCategoryList;
