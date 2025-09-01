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
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
} from "lucide-react";
import { getAllVendorPerformance } from "../../../services/api.report";

const VendorPerformance = () => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [vendorPerformance, setVendorPerformance] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);

  const [filters, setFilters] = useState({
    vendor_id: "",
    from_date: "",
    to_date: "",
  });

  const clearFilters = () => {
    setFilters({
      vendor_id: "",
      from_date: "",
      to_date: "",
    });
    setDisplayedData(vendorPerformance);
  };

  const applyFilters = () => {
    if (!vendorPerformance || vendorPerformance.length === 0) {
      return [];
    }

    let filteredData = [...vendorPerformance];

    // Filter by vendor_id
    if (filters.vendor_id) {
      filteredData = filteredData.filter(
        (item) => item.vendor_id?.id === filters.vendor_id
      );
    }

    // Filter by date range
    if (filters.from_date || filters.to_date) {
      const fromDate = filters.from_date ? new Date(filters.from_date) : null;
      const toDate = filters.to_date ? new Date(filters.to_date) : null;

      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.created_at);

        if (fromDate && toDate) {
          return itemDate >= fromDate && itemDate <= toDate;
        } else if (fromDate) {
          return itemDate >= fromDate;
        } else if (toDate) {
          return itemDate <= toDate;
        }
        return true;
      });
    }

    return filteredData;
  };

  const handleShowData = () => {
    const filteredData = applyFilters();
    setDisplayedData(filteredData);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const fetchVendorPerformance = async () => {
    try {
      const response = await getAllVendorPerformance();
      setVendorPerformance(response.data || []);
      setDisplayedData(response.data || []);
    } catch (error) {
      notifyOnFail("Failed to fetch Vendor Performance.");
      setVendorPerformance([]);
      setDisplayedData([]);
    }
  };

  useEffect(() => {
    fetchVendorPerformance();
  }, []);

  // CSV Export function
  const exportToCSV = () => {
    // Only export currently displayed/filtered data
    const dataToExport = displayedData;

    if (!dataToExport || dataToExport.length === 0) {
      alert("No data to export");
      return;
    }

    // Define headers
    const headers = [
      "Vendor ID",
      "Vendor Name",
      "Total Orders",
      "Total Sales",
      "Commission Earned",
      "Joined Date",
    ];

    // Format data for CSV
    const csvData = dataToExport.map((item) => {
      return [
        item.vendor_id?.id || "",
        `${item.vendor_id?.first_name || ""} ${
          item.vendor_id?.last_name || ""
        }`,
        item.total_orders || 0,
        item.total_sale || "0.00",
        item.commission || "0.00",
        item.created_at || "",
      ];
    });

    // Add headers as the first row
    csvData.unshift(headers);

    // Convert to CSV string
    const csvContent = csvData.map((row) => row.join(",")).join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `vendor_performance_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: "Vendor ID",
      accessorKey: "vendor_id.id",
      cell: ({ row }) => row.original?.vendor_id?.id,
    },
    {
      accessorKey: "vendor_id.first_name",
      header: "Vendor Name",
      cell: ({ row }) => {
        const { first_name, last_name } = row.original.vendor_id || {};
        return `${first_name || ""} ${last_name || ""}`;
      },
    },
    {
      accessorKey: "total_orders",
      header: "Total Orders",
    },
    {
      accessorKey: "total_sale",
      header: "Total Sales",
    },
    {
      accessorKey: "commission",
      header: "Commission Earned",
    },
    {
      accessorKey: "created_at",
      header: "Joined Date",
    },
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

  // Get unique vendors for filter dropdown
  const uniqueVendors = vendorPerformance.reduce((acc, item) => {
    if (item.vendor_id && item.vendor_id.id) {
      const existing = acc.find((v) => v.id === item.vendor_id.id);
      if (!existing) {
        acc.push({
          id: item.vendor_id.id,
          name: `${item.vendor_id.first_name} ${item.vendor_id.last_name}`,
        });
      }
    }
    return acc;
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Vendor Performance
        </h1>
        <div className="bg-white p-4 rounded-md mb-6">
          <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-6 items-center">
            <div className="flex flex-col md:flex-row gap-3">
              {/* From Date Filter */}
              <div>
                <label className="text-sm font-medium text-txtPage">
                  From Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={filters.from_date}
                  onChange={(e) =>
                    handleFilterChange("from_date", e.target.value)
                  }
                />
              </div>

              {/* To Date Filter */}
              <div>
                <label className="text-sm font-medium text-txtPage">
                  To Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={filters.to_date}
                  onChange={(e) =>
                    handleFilterChange("to_date", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 col-span-1 md:col-span-3 md:flex-row md:justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear
              </button>
              <button
                onClick={handleShowData}
                className="px-4 py-2 bg-[#F47954] text-white rounded-md hover:bg-blue-700"
              >
                Show Data
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {table.getFlatHeaders().map((header) => (
                    <th
                      key={header.id}
                      className=" px-6 py-4 text-left text-sm font-medium text-[#333843]"
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
                      <td key={cell.id} className="px-6 py-4 text-sm">
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
      </div>
    </div>
  );
};

export default VendorPerformance;
