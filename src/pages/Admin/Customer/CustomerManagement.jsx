import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Calendar,
  Package,
  Clock,
  User,
  Mail,
  Phone,
  X,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Check,
  Ban,
} from "lucide-react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
  useRowSelect,
} from "react-table";
import {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
} from "../../../services/api.customer";
import CustomerDetails from "./CustomerDetails";

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        >
          <h3 className="text-lg font-medium mb-4">{message}</h3>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Table Component
const CustomerTable = ({ customers, onView, onStatusToggle, loading }) => {
  const columns = useMemo(
    () => [
      {
        Header: "Customer",
        accessor: "name",
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-medium">
              {row.original.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-sm text-gray-500">{row.original.email}</div>
            </div>
          </div>
        ),
      },
      {
        Header: "Phone",
        accessor: "phone",
      },
      {
        Header: "Otp",
        accessor: "otp",
      },
      {
        Header: "Birthday",
        accessor: "birthday",
        Cell: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "-",
      },
      {
        Header: "Orders",
        accessor: (row) => row.orders?.total || 0,
        id: "orders",
      },
      {
        Header: "Balance",
        accessor: "balance",
        Cell: ({ value }) => `₹${value || 0}`,
      },
      {
        Header: "Last Transaction",
        accessor: "lastTransaction",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Status",
        accessor: "is_active",
        Cell: ({ value }) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {value ? "Active" : "Blocked"}
          </span>
        ),
      },
      {
        Header: "Actions",
        id: "actions",
        Cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onView(row.original)}
              className="p-1 text-gray-500 hover:text-blue-600 rounded"
            >
              <User size={16} />
            </button>
            <button
              onClick={() => onStatusToggle(row.original)}
              className="p-1 text-gray-500 hover:text-blue-600 rounded"
            >
              {row.original.is_active ? <Ban size={16} /> : <Check size={16} />}
            </button>
          </div>
        ),
      },
    ],
    [onView, onStatusToggle]
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
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: customers,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  );

  return (
    <div className="overflow-x-auto">
      <table
        {...getTableProps()}
        className="min-w-full divide-y divide-gray-200"
      >
        <thead className="bg-gray-50">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.render("Header")}</span>
                    <span>
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          {...getTableBodyProps()}
          className="bg-white divide-y divide-gray-200"
        >
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center">
                <div className="flex justify-center items-center h-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                </div>
              </td>
            </tr>
          ) : page.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center">
                <div className="text-gray-500">No customers found</div>
              </td>
            </tr>
          ) : (
            page.map((row) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className="px-6 py-4 whitespace-nowrap"
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

      {/* Pagination */}
      <div className="py-3 px-6 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="flex gap-x-2 items-center">
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{pageIndex + 1}</span> of{" "}
              <span className="font-medium">{pageOptions.length}</span>
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border-gray-300 rounded-md text-gray-700 text-sm"
            >
              {[5, 10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">First</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Last</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export Utility Function
const exportToCSV = (customers) => {
  if (!customers || customers.length === 0) return;

  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Status",
    "Birthday",
    "Total Orders",
    "Returned Orders",
    "Canceled Orders",
    "Replaced Orders",
    "Balance",
    "Last Transaction",
  ];

  const csvRows = [
    headers.join(","),
    ...customers.map((customer) =>
      [
        customer.id,
        `"${customer.name}"`,
        `"${customer.email}"`,
        customer.phone,
        customer.is_active ? "Active" : "Blocked",
        customer.birthday
          ? new Date(customer.birthday).toLocaleDateString()
          : "",
        customer.orders?.total || 0,
        customer.orders?.returned || 0,
        customer.orders?.canceled || 0,
        customer.orders?.replaced || 0,
        customer.balance || 0,
        customer.lastTransaction || "",
      ].join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `customers_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const CustomerManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
  });
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    customerToUpdate: null,
    loading: false,
  });

  useEffect(() => {
    fetchCustomers();
  }, [activeTab]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await getAllCustomers({
        is_active:
          activeTab === "active"
            ? true
            : activeTab === "blocked"
            ? false
            : undefined,
        search: filters.search,
      });

      if (response?.data) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = (customer) => {
    setModalState({
      isOpen: true,
      customerToUpdate: customer,
      loading: false,
    });
  };

  const handleStatusChange = async () => {
    if (!modalState.customerToUpdate) return;

    setModalState((prev) => ({ ...prev, loading: true }));
    try {
      const newStatus = !modalState.customerToUpdate.is_active;
      await updateCustomerStatus(modalState.customerToUpdate.id, newStatus);

      // Update local state
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.id === modalState.customerToUpdate.id
            ? { ...customer, is_active: newStatus }
            : customer
        )
      );

      // Close modal
      setModalState({
        isOpen: false,
        customerToUpdate: null,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to update customer status:", error);
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      customerToUpdate: null,
      loading: false,
    });
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "blocked", label: "Blocked" },
  ];

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    if (filters.search) {
      const searchLower = filters.search?.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase()?.includes(searchLower) ||
          c.email?.toLowerCase()?.includes(searchLower) ||
          c.phone?.toLowerCase()?.includes(searchLower)
      );
    }

    return filtered;
  }, [customers, filters]);

  const handleCustomerView = async (customer) => {
    try {
      const response = await getCustomerById(customer.id);
      setSelectedCustomer(response.data);
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
    });
  };

  const handleExport = () => {
    exportToCSV(filteredCustomers);
  };

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-gray-900"
          >
            Customers
          </motion.h1>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex space-x-8 px-6 pt-6 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative"
              >
                <div
                  className={`pb-4 px-2 ${
                    activeTab === tab.id
                      ? "text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 p-6 pb-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone"
                value={filters.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <CustomerTable
            customers={filteredCustomers}
            onView={handleCustomerView}
            onStatusToggle={handleStatusToggle}
            loading={loading}
          />
        </div>

        <AnimatePresence>
          {selectedCustomer && (
            <CustomerDetails
              customer={selectedCustomer}
              onClose={() => setSelectedCustomer(null)}
            />
          )}
        </AnimatePresence>

        <ConfirmationModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onConfirm={handleStatusChange}
          message={`Are you sure you want to ${
            modalState.customerToUpdate?.is_active ? "block" : "activate"
          } this customer?`}
        />
      </div>
    </div>
  );
};

export default CustomerManagement;
