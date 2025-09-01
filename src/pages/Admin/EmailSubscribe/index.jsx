import React, { useEffect, useState, useMemo } from "react";
import { useTable, usePagination, useGlobalFilter } from "react-table";
import {
  getAllEmailSubscription,
  deleteSubscription,
  reactivateSubscription,
} from "../../../services/api.emailSubscribe";
import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";
import * as XLSX from "xlsx";

export default function EmailSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [subscriberToAction, setSubscriberToAction] = useState(null);
  const [modalAction, setModalAction] = useState(""); // "unsubscribe" or "reactivate"

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllEmailSubscription();
      if (response?.status === 1 && response?.data) {
        setSubscribers(response.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      setIsLoading(false);
      notifyOnFail("Failed to fetch subscribers");
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleActionClick = (subscriber, action) => {
    setSubscriberToAction(subscriber);
    setModalAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (subscriberToAction) {
        if (modalAction === "unsubscribe") {
          const res = await deleteSubscription(subscriberToAction.id);
          if (res.status === 1) {
            // Update the subscriber in the state with new status
            fetchSubscribers();
            setShowConfirmModal(false);
            setSubscriberToAction(null);
            notifyOnSuccess(
              res.message || "Subscriber unsubscribed successfully"
            );
          }
        } else if (modalAction === "reactivate") {
          const res = await reactivateSubscription(subscriberToAction.id);
          if (res.status === 1) {
            // Update the subscriber in the state with new status
            fetchSubscribers();
            setShowConfirmModal(false);
            setSubscriberToAction(null);
            notifyOnSuccess(
              res.message || "Subscriber reactivated successfully"
            );
          }
        }
      }
    } catch (error) {
      console.error(
        `Error ${
          modalAction === "unsubscribe" ? "unsubscribing" : "reactivating"
        } subscriber:`,
        error
      );
      notifyOnFail(
        `Error ${
          modalAction === "unsubscribe" ? "unsubscribing" : "reactivating"
        } subscriber: ` + (error.response?.data?.message || error.message)
      );
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Excel Export Function
  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = subscribers.map((subscriber, index) => ({
        "S.No": index + 1,
        Email: subscriber.email,
        Status: subscriber.status === "active" ? "Subscribed" : "Unsubscribed",
        "Date Subscribed": formatDate(subscriber.created_at),
        "Date Unsubscribed":
          subscriber.status === "unsubscribed"
            ? formatDate(subscriber.unsubscribed_at)
            : "N/A",
      }));

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Subscribers");

      // Generate Excel file
      XLSX.writeFile(workbook, "Email_Subscribers.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      notifyOnFail("Failed to export subscribers to Excel");
    }
  };

  // Get counts for stats display
  const activeCount = useMemo(
    () => subscribers.filter((sub) => sub.status === "active").length,
    [subscribers]
  );

  const unsubscribedCount = useMemo(
    () => subscribers.filter((sub) => sub.status === "unsubscribed").length,
    [subscribers]
  );

  // Define columns for react-table
  const columns = useMemo(
    () => [
      {
        Header: "S.No",
        accessor: (row, index) => index + 1,
        disableFilters: true,
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              value === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {value === "active" ? "Subscribed" : "Unsubscribed"}
          </span>
        ),
      },
      {
        Header: "Date Subscribed",
        accessor: "created_at",
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: "Date Unsubscribed",
        accessor: "unsubscribed_at",
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: "Actions",
        accessor: "actions",
        disableFilters: true,
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            {row.original.status === "active" ? (
              <button
                onClick={() => handleActionClick(row.original, "unsubscribe")}
                className="text-orange-600 hover:text-orange-800 hover:underline"
              >
                Unsubscribe
              </button>
            ) : (
              <button
                onClick={() => handleActionClick(row.original, "reactivate")}
                className="text-green-600 hover:text-green-800 hover:underline"
              >
                Reactivate
              </button>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const data = useMemo(() => subscribers, [subscribers]);

  // Setup React Table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
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
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    usePagination
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setGlobalFilter(e.target.value || undefined);
  };

  // Filter options
  const [statusFilter, setStatusFilter] = useState("all");

  // Apply filters
  const filteredData = useMemo(() => {
    let filtered = [...subscribers];

    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    return filtered;
  }, [subscribers, statusFilter]);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-lg md:text-2xl font-bold text-[#333843] mb-4">
        Email Subscribers Management
      </h1>

      {/* Search, stats, and export area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0 space-y-1">
          <p className="text-sm text-gray-600">
            Total Subscribers:{" "}
            <span className="font-semibold">{subscribers.length}</span>
          </p>
          <p className="text-sm text-gray-600">
            Active:{" "}
            <span className="font-semibold text-green-600">{activeCount}</span>
          </p>
          <p className="text-sm text-gray-600">
            Unsubscribed:{" "}
            <span className="font-semibold text-red-600">
              {unsubscribedCount}
            </span>
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by email..."
              value={globalFilter || ""}
              onChange={handleSearchChange}
              className="w-full md:w-64 px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
          >
            <option value="all">All Status</option>
            <option value="active">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
            disabled={subscribers.length === 0}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              ></path>
            </svg>
            Export to Excel
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-[#F47954] border-r-[#F47954] border-b-transparent border-l-transparent"></div>
            <p className="mt-2 text-gray-600">Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No subscribers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table {...getTableProps()} className="min-w-full bg-white">
              <thead className="bg-gray-100">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps()}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.render("Header")}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody
                {...getTableBodyProps()}
                className="divide-y divide-gray-200"
              >
                {page.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No matching subscribers found
                    </td>
                  </tr>
                ) : (
                  page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} className="hover:bg-gray-50">
                        {row.cells.map((cell) => (
                          <td
                            {...cell.getCellProps()}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && subscribers.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="mb-4 md:mb-0">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#F47954]"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
            <span className="ml-3 text-sm text-gray-600">
              Page {pageIndex + 1} of {pageOptions.length}
            </span>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
              className={`px-3 py-1 text-sm border rounded-md ${
                !canPreviousPage
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {"<<"}
            </button>
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className={`px-3 py-1 text-sm border rounded-md ${
                !canPreviousPage
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {"<"}
            </button>
            {Array.from({ length: Math.min(5, pageOptions.length) }, (_, i) => {
              let pageNum;
              if (pageOptions.length <= 5) {
                pageNum = i;
              } else if (pageIndex <= 2) {
                pageNum = i;
              } else if (pageIndex >= pageOptions.length - 3) {
                pageNum = pageOptions.length - 5 + i;
              } else {
                pageNum = pageIndex - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => gotoPage(pageNum)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    pageIndex === pageNum
                      ? "bg-[#F47954] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className={`px-3 py-1 text-sm border rounded-md ${
                !canNextPage
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {">"}
            </button>
            <button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
              className={`px-3 py-1 text-sm border rounded-md ${
                !canNextPage
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {">>"}
            </button>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Confirm{" "}
              {modalAction === "unsubscribe" ? "Unsubscribe" : "Reactivate"}
            </h3>
            <p className="mb-6">
              Are you sure you want to{" "}
              {modalAction === "unsubscribe" ? "unsubscribe" : "reactivate"} the
              subscriber with email "{subscriberToAction?.email}"?
              {modalAction === "unsubscribe"
                ? " This will mark the subscriber as unsubscribed but keep their record in the database."
                : " This will mark the subscriber as active again."}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSubscriberToAction(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-white rounded-md ${
                  modalAction === "unsubscribe"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {modalAction === "unsubscribe" ? "Unsubscribe" : "Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
