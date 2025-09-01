import React from "react";
import { useState, useEffect, useMemo } from "react";

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
} from "lucide-react";
import {
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../../../services/api.faqs";
import FaqsModal from "../../../components/Admin/modals/FaqsModal";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";

export default function FAQsList() {
  const [faqs, setFaqs] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [mode, setMode] = useState("add");
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingFaqs, setIsDeletingFaqs] = useState(false);

  const fetchFaqsData = async () => {
    try {
      const response = await getAllFaqs();
      setFaqs(response.data || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  useEffect(() => {
    fetchFaqsData();
  }, []);

  const openModal = (faq, mode) => {
    setSelectedFaq(faq || null);
    setMode(mode);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    fetchFaqsData();
    setModalOpen(false);
  };

  const openDeleteModal = (faq) => {
    setSelectedFaq(faq);
    setIsDeleteModalOpen(true);
  };
  const handleDelete = async () => {
    if (!selectedFaq) return;
    setIsDeletingFaqs(true);

    try {
      setIsDeleteModalOpen(false);
      const res = await deleteFaq(selectedFaq.id);
      console.log(res);

      if (res.status === 1) {
        fetchFaqsData();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      notifyOnFail("Unable to delete the product");
    } finally {
      setIsDeletingFaqs(false);
    }
  };
  const handleSubmit = async (formData) => {
    try {
      if (mode === "add") {
        await createFaq(formData);
        // alert("FAQ created successfully!");
      } else if (mode === "edit") {
        await updateFaq(selectedFaq.id, formData);
        // alert("FAQ updated successfully!");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting FAQ:", error);
      //   alert("An error occurred while submitting the FAQ.");
    }
  };
  const columns = useMemo(() => [
    {
      header: "SL",
      cell: (info) => info.row.index + 1,
      disableSortBy: true,
    },
    {
      header: "Question",
      accessorKey: "question",
    },
    {
      header: "Answer",
      accessorKey: "answer",
    },
    {
      header: "Type",
      accessorKey: "type",
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
  ]);

  const table = useReactTable({
    data: faqs,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 font-satoshi text-center sm:text-left">
          FAQs List
        </h2>
        <button
          className="bg-[#F47954] text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg hover:bg-gray-800 text-sm sm:text-lg transition-colors w-full sm:w-auto"
          onClick={() => openModal(null, "add")}
        >
          + Add FAQs
        </button>
      </div>

      <div className=" md:p-4 rounded-lg mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:w-auto border-gray-100 border py-3 px-10 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-400"
          />
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 text-lg" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                {table.getFlatHeaders().map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-sm font-semibold text-[#333843]"
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
              <div></div>
            </thead>
            <tbody className="bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-[#1C2A53] text-sm"
                    >
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

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t">
          <div className="flex items-center gap-2">
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
              (pageNumber) => (
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
              )
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-500 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-500 disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <FaqsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={mode}
        faqs={selectedFaq}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this faqs? This action cannot be undone."
        isDeleting={isDeletingFaqs}
      />
    </div>
  );
}
