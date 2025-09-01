


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
  Eye,
  Trash2,
} from "lucide-react";
import {
  getAdsByVendorId,
  getAdById,
  deleteAd,
} from "../../../services/api.ads";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import { useAppContext } from "../../../context/AppContext";
import {
  formatDate,
  formatTime,
} from "../../../utils/date&Time/dateAndTimeFormatter";
import config from "../../../config/config";
import { useNavigate } from "react-router";

const ViewModal = ({ isOpen, onClose, ad }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl text-[black] font-semibold mb-4">Ad Details</h2>
        <p>
          <strong>Product ID:</strong> {ad?.product_id}
        </p>
        <p>
          <strong>Start Date:</strong> {formatDate(ad?.start_date)} {""} |{" "}
          {formatTime(ad?.start_date)}
        </p>
        <p>
          <strong>End Date:</strong> {formatDate(ad?.end_date)} {""} |{" "}
          {formatTime(ad?.end_date)}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          {ad?.status.charAt(0).toUpperCase() + ad?.status.slice(1)}
        </p>
        <p>
          <strong>Is Active:</strong> {ad?.is_active ? "1" : "0"}
        </p>
        <p>
          <strong>Vendor Id:</strong>
          {ad?.vendor_id}
        </p>
        <p>
          <strong>Amount:</strong>
          {ad?.amount}
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const VendorAdlist = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [ads, setAds] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedAd, setSelectedAd] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await getAdsByVendorId(user.id);
        setAds(response || []);
        setDisplayedData(response || []);
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };
    fetchAds();
  }, []);

  const openModal = async (ad) => {
    setSelectedAd(ad);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAd(null);
  };

  const openDeleteModal = (ad) => {
    setSelectedAd(ad);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAd) return;
    setIsDeleting(true);
    try {
      await deleteAd(selectedAd.id);
      setAds(ads.filter((ad) => ad.id !== selectedAd.id));
      setDisplayedData(displayedData.filter((ad) => ad.id !== selectedAd.id));
    } catch (error) {
      console.error("Error deleting ad:", error);
    }
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
  };

  const columns = useMemo(
    () => [
      { header: "SL", cell: (info) => info.row.index + 1, disableSortBy: true },

      { header: "Product Name", accessorKey: "Product.name" },
      {
        header: "Start Date",
        accessorKey: "start_date",
        cell: ({ row }) => (
          <div>
            {formatDate(row.original.start_date)}
            <br />
            {formatTime(row.original.start_date)}
          </div>
        ),
      },
      {
        header: "End Date",
        accessorKey: "end_date",
        cell: ({ row }) => (
          <div>
            {formatDate(row.original.end_date)}
            <br />
            {formatTime(row.original.end_date)}
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const status =
            row.original.status.charAt(0).toUpperCase() +
            row.original.status.slice(1);

          return (
            <span className="flex items-center">
              <span
                className={`w-2 h-2 mr-2 rounded-full ${
                  row.original.status === "pending"
                    ? "bg-yellow-500"
                    : row.original.status === "approved"
                    ? "bg-green-500"
                    : row.original.status === "rejected"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              ></span>
              {status}
            </span>
          );
        },
      },

      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => openModal(row.original)}
              className="p-2 rounded-full text-green-500 hover:bg-green-600 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="p-2 rounded-full text-red-500 hover:bg-red-600 hover:text-white transition-colors"
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
          Ads List
        </h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg  text-sm sm:text-lg transition-colors w-full sm:w-auto"
          onClick={() => navigate(`${config.VITE_BASE_VENDOR_URL}/ads/add`)}
        >
          + Add Ads
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
            </thead>
            <tbody className="bg-white">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={table.getFlatHeaders().length}
                    className="text-center py-4 text-gray-500"
                  >
                    No ads found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
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
                ))
              )}
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
                      ? "bg-blue-500 text-white"
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
      <ViewModal isOpen={showModal} onClose={closeModal} ad={selectedAd} />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Ad"
        message="Are you sure you want to delete this ad?"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default VendorAdlist;