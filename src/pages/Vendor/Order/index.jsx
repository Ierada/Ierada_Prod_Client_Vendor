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
  icons,
} from "lucide-react";
import { CiImport } from "react-icons/ci";
import jsPDF from "jspdf";
import "jspdf-autotable";
import OrderModal from "../../../components/Vendor/Models/OrderModal";
import { useAppContext } from "../../../context/AppContext";
import { getOrdersByVendorId } from "../../../services/api.order";
import {
  formatDate,
  formatTime,
} from "../../../utils/date&Time/dateAndTimeFormatter";
import { FaFilePdf } from "react-icons/fa";
import { IoPrintOutline } from "react-icons/io5";
import EmptyImg from "/assets/skeleton/empty-orders.svg";

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(9)].map((_, index) => (
      <td key={index} className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </td>
    ))}
  </tr>
);

const Order = () => {
  const { user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayedData, setDisplayedData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [orderStats, setOrderStats] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    orderType: "",
    orderStatus: "",
    startDate: "",
    endDate: "",
  });

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await getOrdersByVendorId(user?.id);
      setOrders(res?.data?.orders || []);
      setDisplayedData(res?.data?.orders || []);
      setOrderStats({
        totalOrders: res?.data?.totalOrders,
        completedOrders: res?.data?.completedOrders,
        returnedOrders: res?.data?.returnedOrders,
        replacedOrders: res?.data?.replacedOrders,
        canceledOrders: res?.data?.canceledOrders,
        damagedOrders: res?.data?.damagedOrders,
        instantReturn: res?.data?.instantReturn,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns = useMemo(
    () => [
      // {
      //   id: "select",
      //   header: ({ table }) => (
      //     <input
      //       type="checkbox"
      //       checked={table.getIsAllRowsSelected()}
      //       onChange={table.getToggleAllRowsSelectedHandler()}
      //       className="border-gray-300 border-2 rounded-sm"
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <input
      //       type="checkbox"
      //       checked={row.getIsSelected()}
      //       onChange={row.getToggleSelectedHandler()}
      //       className="border-gray-300 border-2 rounded-sm"
      //     />
      //   ),
      // },
      {
        header: "Order ID",
        accessorKey: "order_number",
        cell: ({ row }) => <p>{row.original?.order_number}</p>,
      },
      {
        header: "Order Date",
        accessorKey: "created_at", // Correct the accessorKey to point to `created_at`
        cell: ({ row }) => (
          <div>
            {formatDate(row.original?.created_at)}
            <br />
            {formatTime(row.original?.created_at)}
          </div>
        ),
      },
      {
        header: "Order Type",
        accessorKey: "payment_type",
        cell: ({ row }) => (
          <div>{row.original?.payment_type === "cod" ? "COD" : "Prepaid"}</div>
        ),
      },
      {
        header: "Return Type",
        accessorKey: "payment_type",
        cell: ({ row }) => (
          <div>
            {row.original?.instant_return_checked
              ? "Instant Return"
              : "Normal Return"}
          </div>
        ),
      },
      {
        header: "Seller",
        accessorKey: "vendor",
        cell: ({ row }) => (
          <div>
            {row.original?.vendor?.vendorDetails
              ? row.original?.vendor?.vendorDetails?.first_name +
                " " +
                row.original.vendor?.vendorDetails?.last_name
              : "N/A"}
          </div>
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
        accessorKey: "discount_amount",
        cell: ({ row }) => (
          <div>{row.original?.product_discount_amount || "N/A"}</div>
        ),
      },
      {
        header: "Order Total",
        accessorKey: "order_total",
        cell: ({ row }) => <div>{row.original?.order_total}</div>,
      },
      {
        header: "Order Status",
        accessorKey: "order_status",
        cell: ({ row }) => (
          <span className="flex items-center">
            <span
              className={`w-2 h-2 mr-2 rounded-full ${
                row.original?.order_status === "placed"
                  ? "bg-yellow-500"
                  : row.original?.order_status === "delivered"
                  ? "bg-green-500"
                  : row.original?.order_status === "shipped"
                  ? "bg-blue-400"
                  : row.original?.order_status === "cancelled"
                  ? "bg-red-500"
                  : "bg-gray-500"
              }`}
            ></span>
            <span>{row.original?.order_status}</span>
          </span>
        ),
      },
      {
        header: "Bill PDF",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              className="p-2"
              onClick={() => {
                downloadInvoicePDF(row.original);
              }}
            >
              <FaFilePdf className="w-6 h-6 text-red-600" />
            </button>
          </div>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              className="p-2"
              onClick={() => openModal(row.original, "view")}
            >
              <Eye className="w-6 h-6 text-blue-500" />
            </button>
            <button className="p-2" onClick={() => printOrderPDF(row.original)}>
              <IoPrintOutline className="w-6 h-6 text-[#DF4C4C]" />
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

    enableRowSelection: true,
    getRowSelection: (row) => row.getIsSelected(),
  });

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      orderType: "",
      orderStatus: "",
      startDate: "",
      endDate: "",
    });
    setDisplayedData(orders);
  };

  const applyFilters = () => {
    if (!orders || orders?.length === 0) {
      return [];
    }

    let filteredOrders = [...orders];

    if (filters.orderType) {
      filteredOrders = filteredOrders?.filter(
        (order) => order?.order_type === filters?.orderType
      );
    }
    if (filters.orderStatus) {
      filteredOrders = filteredOrders.filter(
        (order) => order?.order_status === filters?.orderStatus
      );
    }
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate + "T00:00:00Z");
      const end = new Date(filters.endDate + "T23:59:59Z");

      filteredOrders = filteredOrders.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= start && orderDate <= end;
      });
    }

    return filteredOrders;
  };

  const openModal = (order) => {
    setModalData(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalData(null);
    setIsModalOpen(false);
  };

  const handleShowData = () => {
    const filteredData = applyFilters();
    setDisplayedData(filteredData);
  };

  const downloadInvoicePDF = (order) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Invoice Details - ${order.orderId}`, 20, 20);
    doc.setFontSize(12);
    const details = [
      ["Order ID:", order.id],
      ["Order Date:", formatDate(order.created_at)],
      ["Order Time:", formatTime(order.created_at)],
      ["Product:", order.product?.name || "N/A"],
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
      ["Size:", order.product?.variations?.size || "N/A"],
      ["Color:", order.product?.variations?.color_name || "N/A"],
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
    console.log("jjnjjjjj", order);
    doc.save(`order-${order.id}.pdf`);
  };

  const printOrderPDF = (order) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Order Details - ${order.order_number}`, 20, 20);

    doc.setFontSize(12);
    const details = [
      ["Order ID:", order.id],
      ["Order Date:", formatDate(order.created_at)],
      ["Order Time:", formatTime(order.created_at)],
      ["Product:", order.product?.name || "N/A"], // Handle null product gracefully
      ["Customer:", `${order.Address.first_name} ${order.Address.last_name}`], // Concatenate first and last name
      ["Phone:", order.Address.phone],
      ["Email:", order.Address.email],
      [
        "Address:",
        `${order.Address.street_address || "N/A"}, ${
          order.Address.city || ""
        }, ${order.Address.state || ""} ${order.Address.zip || ""}`.trim(), // Concatenate address parts
      ],
      ["Quantity:", order.qty.toString()],
      ["Size:", order.product?.variations?.size || "N/A"], // Handle missing variation gracefully
      ["Color:", order.product?.variations?.color_name || "N/A"],
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
        1: { cellsWidth: 100 },
      },
    });

    window.open(doc.output("bloburl"), "_blank");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const selectedRows =
      Object.keys(table.getSelectedRowModel().rows).length > 0
        ? Object.values(table.getSelectedRowModel().rows).map(
            (row) => row.original
          )
        : orders.map((order) => order.original || order);

    const tableRows = selectedRows.map((order) => [
      order.id,
      order.order_number || "N/A",
      `${formatDate(order.created_at)} ${formatTime(order.created_at)}`, // Combined Date and Time
      `${order.Address?.first_name || ""} ${
        order.Address?.last_name || ""
      }`.trim(),
      order.product?.name || "N/A",
      order.product?.variations?.size || "N/A", // Product size
      order.product?.variations?.color_name || "N/A", // Product color
      order.Address?.phone || "N/A", // Phone number
      order.Address?.email || "N/A", // Email
      `${order.Address?.street_address || ""}, ${order.Address?.city || ""}, ${
        order.Address?.state || ""
      } ${order.Address?.zip || ""}`.trim(), // Full address
      order.coupon_id || "",
      order.qty || "N/A",
      order.order_total || "N/A", // Order amount
      order.order_status || "N/A", // Status
    ]);

    doc.autoTable({
      head: [
        [
          "Order ID",
          "Order Number",
          "Order Date & Time", // Combined column
          "Customer Name",
          "Product Name",
          "Product Size",
          "Product Color",
          "Phone No.",
          "Email",
          "Address",
          "Coupon",
          "Quantity",
          "Order Amount",
          "Status",
        ],
      ],
      body: tableRows,
      headStyles: { fontSize: 6 },
      styles: { fontSize: 6 },
      columnStyles: {
        0: { cellWidth: "auto" }, // Order ID column width
        1: { cellWidth: "auto" }, // Order Number column width
        2: { cellWidth: "auto" }, // Order Date & Time column width
        3: { cellWidth: "auto" }, // Customer Name column width
        4: { cellWidth: "auto" }, // Product Name column width
        5: { cellWidth: "auto" }, // Product Size column width
        6: { cellWidth: "auto" }, // Product Color column width
        7: { cellWidth: "auto" }, // Phone No. column width
        8: { cellWidth: "auto" }, // Email column width
        9: { cellWidth: "auto" }, // Address column width
        10: { cellWidth: "auto" }, // Quantity column width
        11: { cellWidth: "auto" }, // Order Amount column width
        12: { cellWidth: "auto" }, // Status column width
      },
    });

    doc.save("orders.pdf");
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen p-6">
        <h1 className="text-3xl font-semibold text-txtPage font-satoshi mb-6">
          Order
        </h1>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F8F8]">
                <tr>
                  {[...Array(9)].map((_, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left text-sm font-semibold text-[#2D3954] border-b border-[#F8F8F8]"
                    >
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-txtPage mb-4">
            No Orders Found
          </h1>
          <p className="text-gray-500 mb-6">
            There are currently no orders in the system.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Refresh Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <h1 className="text-3xl font-semibold text-txtPage font-satoshi mb-6">
        Order
      </h1>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-md px-3 py-4 mb-6 ">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 items-center">
          <FilterSelect
            label="Order Status"
            options={["processing", "delivered", "confirmed", "cancelled"]}
            value={filters.orderStatus}
            onChange={(e) => handleFilterChange("orderStatus", e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-txtPage">
              Start Date
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-txtPage">End Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>
          <div className="flex  col-span-2 justify-end gap-2 md:mt-5">
            <button
              className="px-6 py-2 bg-gray-300 text-[#4C4C1F] text-sm font-medium rounded-2xl"
              onClick={clearFilters}
            >
              Clear
            </button>
            <button
              className="px-8 py-3 bg-[#0164CE] text-sm font-medium text-white rounded-2xl"
              onClick={() => handleShowData()}
            >
              Show Data
            </button>
          </div>
        </div>
      </div>

      {/* Search and Export Section */}
      <div className="flex flex-wrap items-center justify-between mb-5 gap-4">
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
          onClick={() => exportToPDF()}
          className="w-full sm:w-auto px-4 py-2 bg-[#0164CE] text-white rounded-md flex items-center justify-center"
        >
          <CiImport className="mr-2" size={20} />
          Export Data
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
      </div>

      <div className="px-6 py-4 flex items-center justify-between border-t">
        <div className="flex items-center gap-2">
          {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => table.setPageIndex(pageNumber - 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  table.getState().pagination.pageIndex === pageNumber - 1
                    ? "bg-[#0164CE] text-white"
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

      <OrderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        order={modalData}
        onOrderUpdate={() => fetchOrders()}
      />
    </div>
  );
};

const FilterSelect = ({ label, options, value, onChange }) => (
  <div>
    <label className="text-sm font-medium text-txtPage">{label}</label>
    <div className="relative">
      <select
        className="w-full p-2  border rounded-md appearance-none bg-white"
        value={value}
        onChange={onChange}
      >
        <option value="" disabled>
          {label}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default Order;
