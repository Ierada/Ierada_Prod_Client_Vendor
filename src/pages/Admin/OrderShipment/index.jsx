import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { getAllShipments } from "../../../services/api.order";

const FilterSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option) => {
    onChange({ target: { value: option } });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="text-sm font-medium text-txtPage">{label}</label>
      <div
        className="w-full p-2 border rounded-md bg-white cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || label}
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-md max-h-40 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default function OrderShipment() {
  const [filter, setFilter] = useState({
    vendor_name: "",
    shipping_id: "",
    timeline: "",
  });
  const [activeTab, setActiveTab] = useState("All");
  const [shipments, setShipments] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [displayedData, setDisplayedData] = useState([]);
  const fetchData = async () => {
    try {
      const res = await getAllShipments();
      console.log("Fetched shipments from API:", res);

      if (res?.data && Array.isArray(res.data)) {
        setShipments(res.data);
        setDisplayedData(res.data);
        console.log("Shipments data:", res.data);
      } else {
        console.error("Unexpected response format:", res);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message, error);
      setShipments([]);
      setDisplayedData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (activeTab === "All") {
      setDisplayedData(shipments);
    } else {
      setDisplayedData(
        shipments.filter((shipment) => shipment.status === activeTab)
      );
    }
  }, [activeTab, shipments]);

  const handleFilterChange = (filterKey, value) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      [filterKey]: value,
    }));
  };

  const getDateRange = (timeline) => {
    const today = new Date();
    let startDate, endDate;

    switch (timeline) {
      case "Today":
        startDate = new Date(today.setHours(0, 0, 0, 0)); // Midnight today
        endDate = new Date(today.setHours(23, 59, 59, 999)); // End of today
        break;
      case "Week":
        const dayOfWeek = today.getDay();
        startDate = new Date(today.setDate(today.getDate() - dayOfWeek)); // Start of the week (Sunday)
        endDate = new Date(today.setDate(today.getDate() + 6)); // End of the week (Saturday)
        break;
      case "Month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the current month
        break;
      case "Year":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        return { startDate: null, endDate: null };
    }

    return { startDate, endDate };
  };

  const applyFilters = () => {
    let filteredData = [...shipments];

    if (filter.timeline) {
      const { startDate, endDate } = getDateRange(filter.timeline);
      filteredData = filteredData.filter((shipment) => {
        const createdAt = new Date(shipment.created_at);
        return createdAt >= startDate && createdAt <= endDate;
      });
    }

    if (filter.vendor_name) {
      filteredData = filteredData.filter((shipment) => {
        const fullName = `${shipment.vendor_id.first_name} ${shipment.vendor_id.last_name}`;
        return fullName
          .toLowerCase()
          .includes(filter.vendor_name.toLowerCase());
      });
    }

    if (filter.shipping_id) {
      filteredData = filteredData.filter(
        (shipment) =>
          shipment.shipping_details?.partner_name === filter.shipping_id
      );
    }

    return filteredData;
  };

  const clearFilters = () => {
    setFilter({
      vendor_name: "",
      shipping_id: "",
      timeline: "",
    });

    setDisplayedData(shipments);
  };

  const handleShowData = () => {
    const filteredData = applyFilters();
    setDisplayedData(filteredData);
  };
  const columns = [
    {
      header: "SN",
      cell: ({ row, table }) => row.index + 1,
    },
    {
      accessorKey: "orderId",
      header: "Order Details",
      cell: ({ row }) => (
        <div>
          <p>Order ID: {row.original.orderId}</p>
          <p>{row.original.productqty} Products</p>
        </div>
      ),
    },
    {
      accessorKey: "customer_id.first_name.",
      header: "Customer Details",
      cell: ({ row }) => (
        <div>
          <p>
            {row.original.customer_id.first_name}{" "}
            {row.original.customer_id.last_name}
          </p>
        </div>
      ),
    },

    {
      accessorKey: "vendor_id.first_name",
      header: "Vendor",
      cell: ({ row }) => (
        <p>
          {row.original.vendor_id.first_name}
          {row.original.vendor_id.last_name}
        </p>
      ),
    },
    {
      accessorKey: "shipping_details.partner_name",
      header: "Shipping Partner",
      cell: ({ row }) => <p>{row.original.shipping_details.partner_name}</p>,
    },
    {
      accessorKey: "shipping_details.shipment_id",
      header: "Track ID",
      cell: ({ row }) => <p>{row.original.shipping_details.shipment_id}</p>,
    },
    {
      accessorKey: "shipping_amount",
      header: "Shipping Amount",
      cell: ({ row }) => <p>{row.original.shipping_amount}</p>,
    },
    {
      accessorKey: "order_status",
      header: "Shipping Status",
      cell: ({ row }) => {
        const formattedStatus =
          row.original.order_status.charAt(0).toUpperCase() +
          row.original.order_status.slice(1).toLowerCase();

        return (
          <span className="flex items-center justify-center text-center">
            <span
              className={`w-2 h-2 mr-2 rounded-full ${
                row.original.order_status === "delivered"
                  ? "bg-green-500"
                  : row.original.order_status === "pending"
                  ? "bg-blue-500"
                  : row.original.order_status === "cancelled"
                  ? "bg-red-500"
                  : row.original.order_status === "rejected"
                  ? "bg-gray-500"
                  : row.original.order_status === "returned"
                  ? "bg-purple-500"
                  : row.original.order_status === "intransit"
                  ? "bg-teal-500"
                  : "bg-gray-300"
              }`}
            />
            <span className="text-gray-700"> {formattedStatus}</span>
          </span>
        );
      },
    },

    { accessorKey: "delivery_date", header: "Delivery" },
  ];

  const table = useReactTable({
    data: displayedData,
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

  useEffect(() => {
    if (activeTab === "All") {
      setDisplayedData(shipments);
    } else {
      const filteredData = shipments.filter(
        (shipment) =>
          shipment.order_status.toLowerCase() === activeTab.toLowerCase()
      );
      setDisplayedData(filteredData);
    }
  }, [activeTab, shipments]);

  return (
    <div className="min-h-screen mx-auto p-6">
      <header>
        <h1 className="text-xl md:text-2xl text-[#333843] font-semibold">
          Order Shipment Status
        </h1>
      </header>
      <div className="flex flex-wrap sm:flex-nowrap border-b my-6">
        {["All", "Intransit", "Delivered", "Cancelled", "Returned"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab
                  ? "text-[#333843] border-b-2 border-[#333843] font-semibold"
                  : "text-gray-500"
              } sm:flex-1 text-center`}
            >
              {tab}
            </button>
          )
        )}
      </div>
      <div className="bg-white rounded-md px-3 py-4 mb-5  ">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center ">
          <FilterSelect
            label="Timeline"
            options={["Today", "Week", "Month", "Year"]}
            value={filter.timeline}
            onChange={(e) => handleFilterChange("timeline", e.target.value)}
          />
          <FilterSelect
            label="Vendor"
            options={[
              ...new Set(
                shipments
                  .map((r) =>
                    r.vendor_id
                      ? `${r.vendor_id.first_name} ${r.vendor_id.last_name}`
                      : null
                  )
                  .filter((name) => name)
              ),
            ]}
            value={filter.vendor_name}
            onChange={(e) => handleFilterChange("vendor_name", e.target.value)}
          />

          <FilterSelect
            label="Shipping Partner"
            options={[
              ...new Set(
                shipments
                  .map((r) => r.shipping_details?.partner_name)
                  .filter((partner) => partner)
              ),
            ]}
            value={filter.shipping_id}
            onChange={(e) => handleFilterChange("shipping_id", e.target.value)}
          />
        </div>

        <div className="flex gap-3 col-span-2  mt-3 md:justify-end md:-mt-11 ">
          <button
            className="px-4 py-2 md:px-6 md:py-3 bg-gray-300 text-[#4C4C1F] text-sm font-medium rounded-2xl"
            onClick={clearFilters}
          >
            Clear
          </button>
          <button
            className=" px-4 py-2 md:px-6 md:py-3 bg-[#F47954] text-sm font-medium text-white rounded-2xl"
            onClick={handleShowData}
          >
            Show Data
          </button>
        </div>
      </div>

      {/* Render table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                {table.getFlatHeaders().map((header) => (
                  <th
                    key={header.id}
                    className="bg-gray-50 px-6 py-4 text-left text-sm font-medium text-[#333843]"
                    onClick={header.column.getToggleSortingHandler()}
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
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-sm text-[#202224]"
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
    </div>
  );
}
