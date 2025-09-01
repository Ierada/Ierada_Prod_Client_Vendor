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
  PackageOpen,
  CheckCircle2,
  XCircle,
  RefreshCw,
  RotateCcw,
  ShoppingBasket,
  Truck,
} from "lucide-react";
import * as XLSX from "xlsx";

import CardDataStatus from "../../../components/Vendor/Tables/CardDataStatus";
import { CiImport } from "react-icons/ci";
import { getAllOrder } from "../../../services/api.order";
import { FaFilePdf } from "react-icons/fa";
import { FaCopy } from "react-icons/fa";
import OrderModal from "../../../components/Admin/modals/OrderModal";
import jsPDF from "jspdf";
import "jspdf-autotable";
import EmptyImg from "/assets/skeleton/empty-orders.svg";
import {
  formatDate,
  formatTime,
} from "../../../utils/date&Time/dateAndTimeFormatter";
import { getAllvendors } from "../../../services/api.vendor";

const FilterSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <label className="text-sm font-medium text-txtPage">{label}</label>
      <div
        className="w-full p-2 text-xs border rounded-md bg-white flex justify-between items-center cursor-pointer border-gray-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || label}
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute w-full mt-1 bg-white border rounded-md shadow-md z-10 max-h-32 overflow-y-auto">
          {Array.isArray(options) &&
            options.map((option, index) => {
              const optionValue =
                typeof option === "object" ? option.name : option;
              return (
                <div
                  key={index}
                  className="p-1 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onChange({ target: { value: optionValue, id: option.id } });
                    setIsOpen(false);
                  }}
                >
                  {optionValue}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [orderSummary, setOrderSummary] = useState({});
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [modalMode, setModalMode] = useState("");
  const [displayedData, setDisplayedData] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    vendor: "",
    startDate: "",
    endDate: "",
  });
  const [vendors, setVendors] = useState([]);
  const [serverPagination, setServerPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const MAJOR_ORDER_STATUSES = [
    {
      status: "total",
      label: "Total Orders",
      icon: <ShoppingBasket className="w-6 h-6" />,
      bgColor: "bg-[#F6DDA391]",
      textColor: "text-[#FFDB89]",
    },
    {
      status: "placed",
      label: "Placed Orders",
      icon: <PackageOpen className="w-6 h-6" />,
      bgColor: "bg-[#FFE3D0]",
      textColor: "text-[#F48031]",
    },
    {
      status: "shipped",
      label: "Shipped Orders",
      icon: <Truck className="w-6 h-6" />,
      bgColor: "bg-[#CED6FF]",
      textColor: "text-[#3A5BFF]",
    },
    {
      status: "delivered",
      label: "Delivered Orders",
      icon: <CheckCircle2 className="w-6 h-6" />,
      bgColor: "bg-[#D1FFE1]",
      textColor: "text-[#39C568]",
    },
    {
      status: "cancelled",
      label: "Cancelled Orders",
      icon: <XCircle className="w-6 h-6" />,
      bgColor: "bg-[#FFDEDE]",
      textColor: "text-[#DF4C4C]",
    },
    {
      status: "return initiated",
      label: "Return Initiated",
      icon: <RefreshCw className="w-6 h-6" />,
      bgColor: "bg-[#EBEBFF]",
      textColor: "text-[#C2C0FF]",
    },
    {
      status: "returned",
      label: "Returned Orders",
      icon: <RotateCcw className="w-6 h-6" />,
      bgColor: "bg-[#E1D9FF]",
      textColor: "text-[#7C6ABB]",
    },
    {
      status: "intransit",
      label: "In Transit",
      icon: <Truck className="w-6 h-6" />,
      bgColor: "bg-[#DEFDFF]",
      textColor: "text-[#51D3DB]",
    },
  ];

  const fetchOrderData = async (filter = "all", status = "") => {
    try {
      const params = {
        filter: timeFilter === "all" ? undefined : timeFilter,
        status: status || undefined,
        page: serverPagination.page, // Use server pagination state
        limit: serverPagination.limit, // Use server pagination state
        order_number: filters.order_number || undefined,
        vendor_id: filters.vendor_id || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        search: globalFilter || undefined,
      };

      const response = await getAllOrder(params);
      setOrders(response.orders || []);
      setDisplayedData(response.orders || []);
      setOrderSummary({
        totalOrders: response?.totalOrders || 0,
        placedOrders: response?.placedOrders || 0,
        shippedOrders: response?.shippedOrders || 0,
        deliveredOrders: response?.deliveredOrders || 0,
        cancelledOrders: response?.cancelledOrders || 0,
        returnInitiatedOrders: response?.returnInitiatedOrders || 0,
        returnedOrders: response?.returnedOrders || 0,
        inTransitOrders: response?.inTransitOrders || 0,
      });

      // Update server pagination from API response
      if (response.pagination) {
        setServerPagination({
          total: response.pagination.total,
          page: response.pagination.page,
          limit: response.pagination.limit,
          totalPages: response.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error("Error fetching order data:", error.message);
      setOrders([]);
      setDisplayedData([]);
    }
  };

  useEffect(() => {
    fetchOrderData();

    // Fetch vendors list
    const loadVendors = async () => {
      try {
        const response = await getAllvendors();
        if (response?.data) {
          setVendors(response.data);
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    loadVendors();
  }, []);

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = displayedData.map((order) => ({
      "Order ID": order.id,
      "Order Number": order.order_number,
      "Order Date": formatDate(order.created_at),
      "Order Time": formatTime(order.created_at),
      "Customer Name": `${order.Address?.first_name || ""} ${
        order.Address?.last_name || ""
      }`.trim(),
      "Product Name": order.Product?.name || "N/A",
      "Product Size": order.Product?.Variations?.size || "N/A",
      "Product Color": order.Product?.Variations?.color_name || "N/A",
      "Phone Number": order.Address?.phone || "N/A",
      Email: order.Address?.email || "N/A",
      Address: `${order.Address?.street_address || ""}, ${
        order.Address?.city || ""
      }, ${order.Address?.state || ""} ${order.Address?.zip || ""}`.trim(),
      Quantity: order.qty || "N/A",
      Price: order.price || "N/A",
      "Order Total": order.order_total || "N/A",
      "Order Status": order.order_status || "N/A",
      "Payment Type": order.payment_type || "N/A",
      "Shipping Charges": order.shipping_charges || "N/A",
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    // Export to Excel file
    XLSX.writeFile(
      workbook,
      `orders_export_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const downloadInvoicePDF = (order) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Invoice Details - ${order.order_number}`, 20, 20);
    doc.setFontSize(12);
    const details = [
      ["Order ID:", order.id],
      ["Order Date:", formatDate(order.created_at)],
      ["Order Time:", formatTime(order.created_at)],
      ["Product:", order.Product?.name || "N/A"],
      ["Customer:", `${order.Address.first_name} ${order.Address.last_name}`],
      ["Phone:", order.Address.phone],
      ["Email:", order.Address.email],
      [
        "Address:",
        `${order.Address.street_address || "N/A"}, ${
          order.Address.city || ""
        }, ${order.Address.state || ""} ${order.Address.zip || ""}`.trim(),
      ],
      ["Quantity:", order.qty.toString()],
      ["Size:", order.Product?.Variations?.size || "N/A"],
      ["Color:", order.Product?.Variations?.color_name || "N/A"],
      ["Price:", order.price],
      ["Coupon:", order.coupon_id],
      ["Order Total:", order.order_total],
      ["Discount:", order.product_discount_amount],
      ["Order Status:", order.order_status],
      [
        "Shipping Address:",
        `${order.Address.street_address || "N/A"}, ${
          order.Address.city || ""
        }, ${order.Address.state || ""} ${order.Address.zip || ""}`.trim(),
      ],
      ["shipping Charge:", order.shipping_charges],
    ];
    doc.autoTable({
      startY: 30,
      body: details,
      theme: "plain",
      styles: { fontSize: 12 },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { cellWidth: 100 },
      },
    });

    doc.save(`order-${order.order_number}.pdf`);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusFilter = (status) => {
    // If status is 'total', reset the filter
    const filterStatus = status === "total" ? "" : status;
    setFilters((prev) => ({ ...prev, status: filterStatus }));
    setTimeFilter("all"); // Reset time filter when status changes
    setServerPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      order_number: "",
      status: "",
      vendor: "",
      vendor_id: "",
      startDate: "",
      endDate: "",
    });
    setGlobalFilter("");
    setTimeFilter("all");
    setServerPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrderData("all"); // Explicitly call with cleared time filter
  };

  const handleShowData = async () => {
    try {
      const params = {
        filter: timeFilter, // Include timeFilter
        order_number: filters.order_number || undefined,
        status: filters.status || undefined,
        vendor_id: filters.vendor_id || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        search: globalFilter || undefined,
        page: 1, // Reset to first page when filters are applied
        limit: serverPagination.limit,
      };

      const response = await getAllOrder(params);
      setDisplayedData(response.orders || []);

      if (response) {
        setOrderSummary({
          totalOrders: response.totalOrders || 0,
          placedOrders: response.placedOrders || 0,
          shippedOrders: response.shippedOrders || 0,
          deliveredOrders: response.deliveredOrders || 0,
          cancelledOrders: response.cancelledOrders || 0,
          returnInitiatedOrders: response.returnInitiatedOrders || 0,
          returnedOrders: response.returnedOrders || 0,
          inTransitOrders: response.inTransitOrders || 0,
        });

        if (response.pagination) {
          setServerPagination({
            total: response.pagination.total,
            page: response.pagination.page,
            limit: response.pagination.limit,
            totalPages: response.pagination.totalPages,
          });
        }
      }
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const openModal = (order, mode) => {
    setSelectedRowData(order);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRowData(null);
    setModalMode("");
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="border-gray-300 border-2 rounded-sm"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="border-gray-300 border-2 rounded-sm"
          />
        ),
      },

      {
        header: "Order ID",
        accessorKey: "order_number",
        cell: ({ row }) => <p>{row.original.order_number}</p>,
      },
      {
        header: "Order Date",
        accessorKey: "created_at",
        cell: ({ row }) => (
          <div>
            {formatDate(row.original.created_at)}
            <br />
            {formatTime(row.original.created_at)}
          </div>
        ),
      },
      {
        header: "Payment Type",
        accessorKey: "payment_type",
        cell: ({ row }) => {
          const paymentType = row.original.payment_type;
          const capitalizedPaymentType =
            paymentType.charAt(0).toUpperCase() +
            paymentType.slice(1).toLowerCase();

          const getTextColorClass = (type) => {
            switch (type.toLowerCase()) {
              case "paid":
                return "text-green-500";
              case "unpaid":
                return "text-red-500";
              default:
                return "text-gray-500";
            }
          };

          return (
            <span className={` ${getTextColorClass(paymentType)}`}>
              <span className="w-2 h-2 mr-2 rounded-full" />
              <span>{capitalizedPaymentType}</span>
            </span>
          );
        },
      },

      {
        header: "Return Type",
        accessorKey: "payment_type",
        cell: ({ row }) => (
          <div>
            {row.original.instant_return_checked
              ? "Instant Return"
              : "Normal Return"}
          </div>
        ),
      },
      {
        header: "Seller",
        accessorKey: "vendor.vendorDetails.shop_name",
        cell: ({ row }) => (
          <p>{row.original.vendor?.vendorDetails?.shop_name}</p>
        ),
      },
      {
        header: "Shipping",
        accessorKey: "shipping_Partner",
        cell: ({ row }) => (
          <div>
            <p>{row.original.courier_name || "N/A"}</p>
            {row.original.tracking_id && (
              <p className="text-xs">{row.original.tracking_id || "N/A"}</p>
            )}
          </div>
        ),
      },
      {
        header: "Discount",
        accessorKey: "product_discount_amount",
        cell: ({ row }) => <p>₹{row.original.product_discount_amount}</p>,
      },
      {
        header: "Order Total",
        accessorKey: "order_total",
        cell: ({ row }) => <p>₹{row.original.order_total}</p>,
      },
      // {
      //   header: "Tracking ID",
      //   accessorKey: "shipping_details.tracking_id",
      //   cell: ({ row }) => {
      //     const trackingId = row.original.shipping_details.tracking_id || "N/A";

      //     const handleCopy = () => {
      //       navigator.clipboard.writeText(trackingId).then(() => {
      //         alert(`Copied to clipboard: ${trackingId}`);
      //       });
      //     };

      //     return (
      //       <div className="flex items-center gap-2">
      //         <span>{trackingId}</span>
      //         {trackingId !== "N/A" && (
      //           <button
      //             onClick={handleCopy}
      //             className="text-blue-500 hover:text-blue-700"
      //             title="Copy Tracking ID"
      //           >
      //             <FaCopy />
      //           </button>
      //         )}
      //       </div>
      //     );
      //   },
      // },
      {
        header: "Status",
        accessorKey: "order_status", // Ensure 'order_status' matches the data key
        cell: ({ row }) => {
          // Capitalize the first letter of order_status
          const status = row.original.order_status;
          const capitalizedStatus =
            status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

          // Determine the background color based on the status
          const getStatusColor = (status) => {
            switch (status.toLowerCase()) {
              case "delivered":
                return "bg-green-500";
              case "pending":
                return "bg-yellow-500";
              case "return initiated":
                return "bg-blue-500";
              case "cancelled":
                return "bg-red-500";
              case "rejected":
                return "bg-gray-500";
              case "returned":
                return "bg-purple-500";
              case "replaced":
                return "bg-purple-500";
              case "intransit":
                return "bg-teal-500";
              default:
                return "bg-gray-300"; // Default color if no match
            }
          };

          return (
            <span className="flex items-center justify-center text-center">
              <span
                className={`w-2 h-2 mr-2 rounded-full ${getStatusColor(
                  capitalizedStatus
                )}`}
              />
              <span className="text-gray-700">{capitalizedStatus}</span>
            </span>
          );
        },
      },

      {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <button
              className="text-blue-500 hover:scale-105"
              onClick={() => openModal(row.original, "view")}
            >
              <Eye />
            </button>
            <button
              className="text-red-500 hover:scale-105"
              onClick={() => downloadInvoicePDF(row.original, "export")}
            >
              <FaFilePdf />
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
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex: serverPagination.page - 1, // Convert to 0-based index
        pageSize: serverPagination.limit,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true, // Important for API-based pagination
    pageCount: serverPagination.totalPages,
    enableRowSelection: true,
    getRowSelection: (row) => row.getIsSelected(),
  });

  useEffect(() => {
    // Fetch data when any filter or pagination changes
    fetchOrderData(timeFilter, filters.status);
  }, [
    filters.status,
    filters.vendor_id, // Use vendor_id instead of vendor for consistency
    filters.startDate,
    filters.endDate,
    globalFilter,
    serverPagination.page,
    serverPagination.limit,
  ]);

  useEffect(() => {
    // Reset to first page when filters change
    if (
      filters.status ||
      filters.vendor ||
      filters.startDate ||
      filters.endDate ||
      globalFilter
    ) {
      setServerPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [
    filters.status,
    filters.vendor,
    filters.startDate,
    filters.endDate,
    globalFilter,
  ]);

  return (
    <div className="p-2 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
      </div>

      {/* CardDataStatus as Filterable Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4 mt-5 lg:mt-10 mb-2">
        {MAJOR_ORDER_STATUSES?.map((statusItem) => (
          <button
            key={statusItem.status}
            onClick={() => handleStatusFilter(statusItem.status)}
            className="focus:outline-none w-full"
          >
            <CardDataStatus
              icon={
                <div
                  className={`p-2 md:p-3 ${statusItem.bgColor} ${statusItem.textColor} rounded-md`}
                >
                  {statusItem.icon}
                </div>
              }
              title={statusItem.label}
              value={
                statusItem.status === "total"
                  ? orderSummary.totalOrders
                  : statusItem.status === "placed"
                  ? orderSummary.placedOrders
                  : statusItem.status === "shipped"
                  ? orderSummary.shippedOrders
                  : statusItem.status === "delivered"
                  ? orderSummary.deliveredOrders
                  : statusItem.status === "cancelled"
                  ? orderSummary.cancelledOrders
                  : statusItem.status === "return initiated"
                  ? orderSummary.returnInitiatedOrders
                  : statusItem.status === "returned"
                  ? orderSummary.returnedOrders
                  : statusItem.status === "intransit"
                  ? orderSummary.inTransitOrders
                  : 0
              }
            />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between my-5 gap-4">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search"
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:w-auto border-gray-100 border py-3 px-10 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-400"
          />
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 text-lg" />
        </div>
        <button
          onClick={exportToExcel}
          className="w-full sm:w-auto px-4 py-2 bg-[#F47954] text-white rounded-md flex items-center justify-center"
        >
          <CiImport className="mr-2" size={20} />
          Export Data
        </button>
      </div>

      <div className="bg-white rounded-md px-3 py-4">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 items-center">
          <FilterSelect
            label="Select Vendor"
            options={vendors.map((v) => ({
              id: v.id,
              name: `${v?.shop_name || ""}`.trim(),
            }))}
            value={filters.vendor}
            onChange={(e) => {
              const selectedVendor = vendors.find(
                (v) => `${v.shop_name}` === e.target.value
              );
              setFilters({
                ...filters,
                vendor: e.target.value,
                vendor_id: selectedVendor ? selectedVendor.id : undefined,
              });
            }}
          />

          <FilterSelect
            label="Order Status"
            options={[
              "placed",
              "shipped",
              "intransit",
              "delivered",
              "cancelled",
              "rejected",
              "return pending",
              "return initiated",
              "returned",
              "replacement pending",
              "replacement initiated",
              "replaced",
            ]}
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-txtPage">
              Start Date
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-md text-xs"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-txtPage">End Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md text-xs"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>

          <div className="flex gap-3 col-span-2  justify-end mt-5">
            <button
              className="px-6 py-2 bg-gray-300 text-[#4C4C1F] text-sm font-medium rounded-2xl"
              onClick={clearFilters}
            >
              Clear
            </button>
            <button
              className="px-6 py-3 bg-[#F47954] text-sm font-medium text-white rounded-2xl"
              onClick={() => handleShowData()}
            >
              Show Data
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
        <div className="overflow-x-auto">
          {table.getRowModel().rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <img
                src={EmptyImg}
                alt="No data available"
                className="w-48 h-48"
              />
              <p className="text-[black] text-base mt-4">No orders Yet?</p>
              <p className="text-[#8B8D97] text-sm mt-2">
                Add products to your store and start selling to see orders here.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {table.getFlatHeaders().map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-medium text-[#333843]"
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
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">
              Showing {displayedData.length} of {serverPagination.total} orders
              {filters.status ? ` (filtered)` : ""}
            </span>
            <div className="flex items-center ml-4">
              <span className="text-sm text-gray-600 mr-2">Show:</span>
              <select
                value={serverPagination.limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setServerPagination((prev) => ({
                    ...prev,
                    limit: newLimit,
                    page: 1, // Reset to first page when changing page size
                  }));
                }}
                className="border border-gray-300 rounded-md p-1 pr-5 text-sm"
              >
                {[10, 20, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setServerPagination((prev) => ({ ...prev, page: 1 }));
              }}
              disabled={serverPagination.page === 1}
              className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              title="First Page"
            >
              <ChevronLeft className="w-3 h-3" />
              <ChevronLeft className="w-3 h-3 -ml-1" />
            </button>
            <button
              onClick={() => {
                setServerPagination((prev) => ({
                  ...prev,
                  page: prev.page - 1,
                }));
              }}
              disabled={serverPagination.page === 1}
              className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                Page{" "}
                <strong>
                  {serverPagination.page} of {serverPagination.totalPages}
                </strong>
              </span>
            </div>

            <button
              onClick={() => {
                setServerPagination((prev) => ({
                  ...prev,
                  page: prev.page + 1,
                }));
              }}
              disabled={serverPagination.page >= serverPagination.totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setServerPagination((prev) => ({
                  ...prev,
                  page: prev.totalPages,
                }));
              }}
              disabled={serverPagination.page >= serverPagination.totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              title="Last Page"
            >
              <ChevronRight className="w-3 h-3" />
              <ChevronRight className="w-3 h-3 -ml-1" />
            </button>
          </div>
        </div>
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        order={selectedRowData}
        onOrderUpdate={() => fetchOrderData()}
      />
    </div>
  );
}
