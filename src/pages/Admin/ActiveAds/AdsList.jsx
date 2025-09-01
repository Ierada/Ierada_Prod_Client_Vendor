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
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  getAllAds,
  approveAd,
  rejectAd,
  setPendingAd,
} from "../../../services/api.ads";
import {
  formatDate,
  formatTime,
} from "../../../utils/date&Time/dateAndTimeFormatter";

const ViewModal = ({ isOpen, onClose, ad, onStatusChange }) => {
  if (!isOpen) return null;

  const handleApprove = () => {
    onStatusChange(ad.id, "approved");
  };

  const handleReject = () => {
    onStatusChange(ad.id, "rejected");
  };

  const handlePending = () => {
    onStatusChange(ad.id, "pending");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl text-black font-semibold mb-4">Ad Details</h2>

        <div className="space-y-2">
          <p>
            <strong>Product Name:</strong> {ad?.Product?.name || "N/A"}
          </p>
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
            <span
              className={`px-2 py-1 rounded-lg text-white ${
                ad?.status === "pending"
                  ? "bg-yellow-500"
                  : ad?.status === "approved"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              {ad?.status.charAt(0).toUpperCase() + ad?.status.slice(1)}
            </span>
          </p>
          <p>
            <strong>Is Active:</strong> {ad?.is_active ? "Yes" : "No"}
          </p>
          <p>
            <strong>Vendor:</strong>{" "}
            {ad?.User?.vendorDetails
              ? `${ad.User.vendorDetails.first_name} ${ad.User.vendorDetails.last_name}`
              : ad?.vendor_id}
          </p>
          <p>
            <strong>Amount:</strong> ${ad?.amount}
          </p>
        </div>

        <div className="mt-6 flex justify-between">
          <div className="flex space-x-2">
            <button
              onClick={handleApprove}
              disabled={ad?.status === "approved"}
              className={`px-3 py-1 rounded text-white ${
                ad?.status === "approved"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              Approve
            </button>
            <button
              onClick={handleReject}
              disabled={ad?.status === "rejected"}
              className={`px-3 py-1 rounded text-white ${
                ad?.status === "rejected"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              Reject
            </button>
            <button
              onClick={handlePending}
              disabled={ad?.status === "pending"}
              className={`px-3 py-1 rounded text-white ${
                ad?.status === "pending"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              Pending
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status, onClick }) => {
  const statusConfig = {
    pending: {
      bgColor: "bg-yellow-500 hover:bg-yellow-600",
      icon: <Clock className="w-4 h-4 mr-1" />,
    },
    approved: {
      bgColor: "bg-green-500 hover:bg-green-600",
      icon: <CheckCircle className="w-4 h-4 mr-1" />,
    },
    rejected: {
      bgColor: "bg-red-500 hover:bg-red-600",
      icon: <XCircle className="w-4 h-4 mr-1" />,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-white ${config.bgColor} flex items-center`}
    >
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  );
};

const AdsList = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedAd, setSelectedAd] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const response = await getAllAds();

      if (response?.status === 1) {
        setAds(response.data || []);
      } else {
        setError("Failed to fetch ads");
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      setError("Error fetching ads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openModal = (ad) => {
    setSelectedAd(ad);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAd(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      let response;

      if (newStatus === "approved") {
        response = await approveAd(id);
      } else if (newStatus === "rejected") {
        response = await rejectAd(id);
      } else {
        // We'd need to implement setPendingAd in the API service
        response = await setPendingAd(id);
      }

      if (response?.status === 1) {
        // Update local state immediately for better UX
        setAds((prevAds) =>
          prevAds.map((ad) =>
            ad.id === id
              ? {
                  ...ad,
                  status: newStatus,
                  is_active: newStatus === "approved",
                }
              : ad
          )
        );

        // If modal is open and shows the affected ad, update it
        if (selectedAd && selectedAd.id === id) {
          setSelectedAd((prev) => ({
            ...prev,
            status: newStatus,
            is_active: newStatus === "approved",
          }));
        }
      } else {
        console.error("Status change failed");
      }
    } catch (error) {
      console.error(`Error changing status to ${newStatus}:`, error);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "SL",
        cell: (info) => info.row.index + 1,
        enableSorting: false,
      },
      {
        header: "Product Name",
        accessorFn: (row) => row.Product?.name || "N/A",
        id: "productName",
      },
      {
        header: "Vendor",
        accessorFn: (row) => {
          if (row.User?.vendorDetails) {
            return `${row.User.vendorDetails.first_name} ${row.User.vendorDetails.last_name}`;
          }
          return `Vendor #${row.vendor_id}`;
        },
        id: "vendor",
      },
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
        header: "Amount",
        accessorKey: "amount",
        cell: ({ row }) => `$${row.original.amount}`,
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <StatusBadge
              status={row.original.status}
              onClick={() => openModal(row.original)}
            />
          </div>
        ),
      },
      {
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => openModal(row.original)}
              className="px-3 py-1.5 rounded-lg bg-blue-200 text-blue-500 hover:bg-blue-300 transition-colors flex items-center"
            >
              <Eye className="w-4 h-4 mr-1" /> View
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: ads,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
          <button
            onClick={fetchAds}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl text-black font-semibold mb-4">Ads List</h2>

      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search ads..."
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border-gray-100 border py-3 px-10 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-400 w-64"
          />
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 text-lg" />
        </div>

        <div className="text-sm text-gray-500">Total Ads: {ads.length}</div>
      </div>

      {ads.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No ads found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
              <span className="text-sm text-gray-600">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>

              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="px-2 py-1 border rounded text-sm"
              >
                {[10, 20, 30, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                First
              </button>

              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, table.getPageCount()) },
                  (_, i) => {
                    const pageIndex = i;
                    return (
                      <button
                        key={i}
                        onClick={() => table.setPageIndex(pageIndex)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                          table.getState().pagination.pageIndex === pageIndex
                            ? "bg-[#F47954] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageIndex + 1}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      <ViewModal
        isOpen={showModal}
        onClose={closeModal}
        ad={selectedAd}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default AdsList;
