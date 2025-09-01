import React, { useState, useMemo, useEffect } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
  useRowSelect,
} from "react-table";
import {
  getAllvendors,
  updateVendorStatus,
  updateVendorActive,
} from "../../../services/api.vendor";
import { notifyOnFail } from "../../../utils/notification/toast";
import { getProductsByVendorId } from "../../../services/api.product";
import VendorDetails from "./VendorDetails";
import DefaultProfile from "/assets/user/person-circle.png";
import { format } from "date-fns";

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
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
      </div>
    </div>
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ isActive, onChange, disabled }) => {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isActive ? "bg-green-500" : "bg-gray-300"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isActive ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
};

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          bg: "bg-green-100",
          text: "text-green-600",
          label: "Approved",
        };
      case "pending":
        return { bg: "bg-blue-100", text: "text-blue-600", label: "Pending" };
      case "rejected":
        return { bg: "bg-red-100", text: "text-red-600", label: "Rejected" };
      case "blocked":
        return { bg: "bg-red-100", text: "text-red-600", label: "Blocked" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600", label: status };
    }
  };

  const config = getStatusConfig();
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

// Custom checkbox component for row selection
const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <input
        type="checkbox"
        ref={resolvedRef}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        {...rest}
      />
    );
  }
);

// Function to export table data to CSV
const exportToCSV = (data) => {
  if (!data || data.length === 0) return;

  // Define CSV header
  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Shop Name",
    "Status",
    "Active",
    "City",
    "State",
    "Country",
    "Zip Code",
    "PAN Number",
    "Aadhar Number",
    "Created At",
  ];

  // Format data rows
  const rows = data.map((vendor) => [
    vendor.id,
    `${vendor.first_name || ""} ${vendor.last_name || ""}`,
    vendor.email,
    vendor.phone,
    vendor.shop_name,
    vendor.status,
    vendor.is_active ? "Yes" : "No",
    vendor.shop_city || "",
    vendor.shop_state || "",
    vendor.shop_country || "",
    vendor.shop_zip_code || "",
    vendor.pan_number || "",
    vendor.adhaar_number || "",
    vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : "",
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
  link.setAttribute("download", `vendors_${new Date().toISOString()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const VendorManagement = () => {
  const [activeTab, setActiveTab] = useState("sellers_request");
  const [vendorsData, setVendorsData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    states: [],
    cities: [],
  });
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    vendor: null,
    action: "",
    status: "",
  });
  const [filters, setFilters] = useState({
    search: "",
    shop_state: "",
    shop_city: "",
    created_at: "",
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await getAllvendors();
      if (response.status === 1) {
        setVendorsData(response.data || []);
        if (response.filters) {
          setFilterOptions({
            states: response.filters.states || [],
            cities: response.filters.cities || [],
          });
        }
      }
    } catch (error) {
      notifyOnFail("Failed to fetch vendors.");
      setVendorsData([]);
    }
  };

  const tabs = [
    {
      id: "listed_sellers",
      label: "Listed Sellers",
      filter: (v) => v.status === "approved" && v.is_active,
    },
    {
      id: "sellers_request",
      label: "Sellers Request",
      filter: (v) => v.status === "pending",
    },
    { id: "inactive", label: "Inactive", filter: (v) => !v.is_active },
    {
      id: "blocked",
      label: "Blocked",
      filter: (v) => v.status === "blocked" || v.status === "rejected",
    },
  ];

  const handleChangeStatus = async (vendor, status) => {
    try {
      if (status === "blocked" || status === "rejected") {
        const response = await updateVendorStatus(vendor.id, { status });
        if (response.status === 1) {
          fetchVendors();
        } else {
          console.error("API Error:", response.message);
        }
      } else {
        const response = await updateVendorStatus(vendor.id, { status });
        if (response.status === 1) {
          const updatedActiveState = status === "approved" ? true : false;
          await updateVendorActive(vendor.id, updatedActiveState);
          fetchVendors();
        } else {
          console.error("API Error:", response.message);
        }
      }
    } catch (error) {
      console.error("Failed to update vendor status:", error);
    }
  };

  const handleToggleActive = async (vendor) => {
    try {
      const newIsActive = !vendor.is_active;
      const response = await updateVendorActive(vendor.id, newIsActive);

      if (response.status === 1) {
        fetchVendors();
      }
    } catch (error) {
      console.error("Failed to update vendor active status:", error);
    }
  };

  const confirmAction = (vendor, action, status = "") => {
    setConfirmationData({ vendor, action, status });
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    const { vendor, action, status } = confirmationData;

    if (action === "changeStatus") {
      await handleChangeStatus(vendor, status);
    } else if (action === "toggleActive") {
      await handleToggleActive(vendor);
    }

    setShowConfirmation(false);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      shop_state: "",
      shop_city: "",
      created_at: "",
    });
  };

  // Filter vendors based on active tab and filter criteria
  const filteredVendors = useMemo(() => {
    let filtered = vendorsData;

    // Filter based on the active tab filter
    const activeTabFilter = tabs.find((t) => t.id === activeTab)?.filter;
    if (activeTabFilter) {
      filtered = filtered.filter(activeTabFilter);
    }

    // Filter by search query
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.shop_name?.toLowerCase().includes(searchLower) ||
          v.first_name?.toLowerCase().includes(searchLower) ||
          v.last_name?.toLowerCase().includes(searchLower) ||
          v.email?.toLowerCase().includes(searchLower) ||
          v.phone?.includes(filters.search)
      );
    }

    // Filter by shop_state
    if (filters.shop_state) {
      filtered = filtered.filter(
        (v) => v.shop_state?.toLowerCase() === filters.shop_state?.toLowerCase()
      );
    }

    // Filter by shop_city
    if (filters.shop_city) {
      filtered = filtered.filter(
        (v) => v.shop_city?.toLowerCase() === filters.shop_city?.toLowerCase()
      );
    }

    // Filter by created_at date
    if (filters.created_at) {
      filtered = filtered.filter((v) => {
        if (!v.created_at) return false;
        const createdAtDate = new Date(v.created_at)
          .toISOString()
          .split("T")[0];
        return createdAtDate === filters.created_at;
      });
    }

    return filtered;
  }, [activeTab, filters, vendorsData]);

  // Define table columns
  const columns = useMemo(
    () => [
      {
        Header: "Vendor",
        accessor: "vendor_details",
        Cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={row.original.avatar || DefaultProfile}
                alt={row.original.shop_name}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{row.original.vendor_id}</span>
              <span className="font-medium">{row.original.shop_name}</span>
              <span className="text-sm text-gray-500">
                {row.original.first_name} {row.original.last_name}
              </span>
            </div>
          </div>
        ),
      },
      {
        Header: "Contact",
        accessor: "contact",
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm">{row.original.email}</span>
            <span className="text-sm text-gray-500">{row.original.phone}</span>
          </div>
        ),
      },
      {
        Header: "Location",
        accessor: "location",
        Cell: ({ row }) => (
          <div className="flex flex-col text-sm">
            <span>
              {[
                row.original.shop_city,
                row.original.shop_state,
                row.original.shop_country,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
            {row.original.shop_zip_code && (
              <span className="text-gray-500">
                ZIP: {row.original.shop_zip_code}
              </span>
            )}
          </div>
        ),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => <StatusBadge status={value} />,
      },
      {
        Header: "Active",
        accessor: "is_active",
        Cell: ({ row }) => (
          <ToggleSwitch
            isActive={row.original.is_active}
            onChange={() => confirmAction(row.original, "toggleActive")}
            disabled={
              row.original.status === "blocked" ||
              row.original.status === "rejected"
            }
          />
        ),
      },
      {
        Header: "Created",
        accessor: "created_at",
        Cell: ({ value }) => (
          <span className="text-sm">
            {value ? format(new Date(value), "PP") : "N/A"}
          </span>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => {
          const vendor = row.original;
          const showAcceptButton = vendor.status === "pending";
          const showBlockButton =
            vendor.status !== "blocked" &&
            vendor.status !== "rejected" &&
            vendor.is_active &&
            vendor.status !== "pending";
          const showRejectButton = vendor.status === "pending";

          return (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedVendor(vendor)}
                className="p-1 text-blue-600 hover:text-blue-800"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>

              {showBlockButton && (
                <button
                  onClick={() =>
                    confirmAction(vendor, "changeStatus", "blocked")
                  }
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Block Vendor"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}

              {showRejectButton && (
                <button
                  onClick={() =>
                    confirmAction(vendor, "changeStatus", "rejected")
                  }
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Reject Request"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}

              {showAcceptButton && (
                <button
                  onClick={() =>
                    confirmAction(vendor, "changeStatus", "approved")
                  }
                  className="p-1 text-green-600 hover:text-green-800"
                  title="Approve Request"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  // Set up react-table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    setPageSize,
    selectedFlatRows,
  } = useTable(
    {
      columns,
      data: filteredVendors,
      initialState: { pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          ),
        },
        ...columns,
      ]);
    }
  );

  const { pageIndex, pageSize } = state;

  // Handle exporting selected vendors or all filtered vendors
  const handleExport = () => {
    const dataToExport =
      selectedFlatRows.length > 0
        ? selectedFlatRows.map((row) => row.original)
        : filteredVendors;

    exportToCSV(dataToExport);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl text-gray-800 font-semibold">
            Vendors Management
          </h1>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export{" "}
            {selectedFlatRows.length > 0 ? `(${selectedFlatRows.length})` : ""}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Tabs */}
          <div className="flex border-b px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 relative ${
                  activeTab === tab.id
                    ? "text-blue-600 font-medium border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="p-6 border-b grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>

            <select
              value={filters.shop_state}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  shop_state: e.target.value,
                  shop_city: "",
                }))
              }
              className="border rounded-lg px-4 py-2"
            >
              <option value="">All States</option>
              {filterOptions?.states?.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <select
              value={filters.shop_city}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, shop_city: e.target.value }))
              }
              className="border rounded-lg px-4 py-2"
              disabled={!filters.shop_state}
            >
              <option value="">All Cities</option>
              {filterOptions?.cities
                ?.filter(
                  (city) =>
                    !filters.shop_state ||
                    vendorsData.some(
                      (v) =>
                        v.shop_state === filters.shop_state &&
                        v.shop_city === city
                    )
                )
                ?.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.created_at}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    created_at: e.target.value,
                  }))
                }
                className="border rounded-lg px-4 py-2 flex-grow"
              />
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Table */}
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
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
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
                            ) : column.id !== "selection" &&
                              column.id !== "actions" ? (
                              <ArrowUpDown className="h-4 w-4 opacity-50" />
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
                {page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="hover:bg-gray-50">
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
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{pageIndex * pageSize + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min((pageIndex + 1) * pageSize, filteredVendors.length)}
                </span>{" "}
                of <span className="font-medium">{filteredVendors.length}</span>{" "}
                results
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border rounded-md text-sm px-2 py-1"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => gotoPage(0)}
                  disabled={!canPreviousPage}
                  className={`px-3 py-1 rounded-md ${
                    !canPreviousPage
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {"<<"}
                </button>
                <button
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                  className={`px-3 py-1 rounded-md ${
                    !canPreviousPage
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {"<"}
                </button>
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium">{pageIndex + 1}</span> of{" "}
                  <span className="font-medium">{pageOptions.length}</span>
                </span>
                <button
                  onClick={() => nextPage()}
                  disabled={!canNextPage}
                  className={`px-3 py-1 rounded-md ${
                    !canNextPage
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {">"}
                </button>
                <button
                  onClick={() => gotoPage(pageOptions.length - 1)}
                  disabled={!canNextPage}
                  className={`px-3 py-1 rounded-md ${
                    !canNextPage
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {">>"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Details Drawer */}
        {selectedVendor && (
          <VendorDetails
            vendorId={selectedVendor.id}
            onClose={() => setSelectedVendor(null)}
            changeStatus={fetchVendors}
            fetchVendors={fetchVendors}
          />
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmAction}
          title={
            confirmationData.action === "changeStatus"
              ? `Confirm Status Change`
              : `Confirm ${
                  confirmationData.vendor?.is_active ? "Deactivate" : "Activate"
                } Vendor`
          }
          message={
            confirmationData.action === "changeStatus"
              ? `Are you sure you want to ${confirmationData.status} this vendor?`
              : `Are you sure you want to ${
                  confirmationData.vendor?.is_active ? "deactivate" : "activate"
                } this vendor?`
          }
        />
      </div>
    </div>
  );
};

export default VendorManagement;
