import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Eye,
  ChevronsRight,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  formatCurrency,
  formatDate,
  formatTime,
} from "../../../utils/date&Time/dateAndTimeFormatter";
import { getFinancialDashboard } from "../../../services/api.finance";

// Financial metric card component
const FinancialMetricCard = ({ icon, title, value, change }) => {
  const isPositive = (change || 0) >= 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <div
          className={`p-3 rounded-full ${
            isPositive ? "bg-green-50" : "bg-red-50"
          }`}
        >
          {icon}
        </div>
        <div
          className={`flex items-center ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {/* {isPositive ? (
            <TrendingUp className="mr-1" size={16} />
          ) : (
            <TrendingDown className="mr-1" size={16} />
          )} */}
          {/* <span className="text-sm">{Math.abs(change)}%</span> */}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <div className="flex items-center">
        <span className="text-xl font-bold text-gray-800">{value}</span>
      </div>
    </div>
  );
};

// Top Products/Vendors Table Component
const TopDataTable = ({ data, title, columns }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((col, index) => (
              <th key={index} className="text-left text-sm text-gray-600 pb-2">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr
              key={index}
              className="border-b last:border-b-0 hover:bg-gray-50"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="py-2 text-sm text-gray-700">
                  {item[col.toLowerCase().replace(/\s+/g, "_")]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function FinanceDashboard() {
  const [financialData, setFinancialData] = useState({
    financialMetrics: {},
    revenueBreakdown: [],
    topProducts: [],
    topVendors: [],
    transactions: [],
    pagination: { page: 1, totalPages: 1 },
  });
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Clear date range filter
  const clearDateRange = () => {
    setFilters({
      startDate: null,
      endDate: null,
    });
  };

  // Fetch financial dashboard data
  const fetchFinancialData = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await getFinancialDashboard({
        startDate: filters.startDate ? filters.startDate.toISOString() : "",
        endDate: filters.endDate ? filters.endDate.toISOString() : "",
        page,
        limit: 10,
      });

      setFinancialData({
        financialMetrics: response.financialMetrics || {},
        revenueBreakdown: response.revenueBreakdown || [],
        topProducts: response.topProducts || [],
        topVendors: response.topVendors || [],
        transactions: response.transactions || [],
        pagination: response.pagination,
      });
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFinancialData();
  }, [filters.startDate, filters.endDate]);

  // Export transactions to Excel
  const exportToExcel = () => {
    const exportData = financialData.transactions.map((transaction) => ({
      "Order ID": transaction.id,
      "Order Number": transaction.order_number,
      "Product Name": transaction.Product?.name || "N/A",
      "Vendor Email": transaction.vendor?.email || "N/A",
      "Order Total": formatCurrency(transaction.order_total),
      "Order Date": formatDate(transaction.created_at),
      "Payment Type": transaction.payment_type,
      "Order Status": transaction.order_status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(
      workbook,
      `financial_transactions_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Transactions Table Columns
  const transactionColumns = useMemo(
    () => [
      {
        header: "Order ID",
        accessorKey: "order_number",
        cell: ({ row }) => row.original.order_number || "N/A",
      },
      {
        header: "Product",
        accessorKey: "product_name",
        cell: ({ row }) => row.original.Product?.name || "N/A",
      },
      {
        header: "Vendor",
        accessorKey: "vendor_email",
        cell: ({ row }) => row.original.vendor?.email || "N/A",
      },
      {
        header: "Total Amount",
        accessorKey: "order_total",
        cell: ({ row }) => formatCurrency(row.original.order_total),
      },
      {
        header: "Date",
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
        cell: ({ row }) => row.original.payment_type || "N/A",
      },
      {
        header: "Status",
        accessorKey: "order_status",
        cell: ({ row }) => row.original.order_status || "N/A",
      },
      // {
      //   header: "Actions",
      //   cell: ({ row }) => (
      //     <div className="flex items-center space-x-2">
      //       <button className="text-blue-500 hover:scale-105">
      //         <Eye size={18} />
      //       </button>
      //     </div>
      //   ),
      // },
    ],
    []
  );

  // Table instance for transactions
  const table = useReactTable({
    data: financialData.transactions,
    columns: transactionColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Financial metrics to display
  const financialMetricCards = [
    {
      icon: <DollarSign className="text-green-600" />,
      title: "Total Revenue",
      value: formatCurrency(financialData.financialMetrics.total_revenue || 0),
      change: 12.5,
    },
    {
      icon: <ShoppingCart className="text-blue-600" />,
      title: "Total Orders",
      value: financialData.financialMetrics.total_orders || 0,
      change: 8.3,
    },
    {
      icon: <Package className="text-purple-600" />,
      title: "Avg Order Value",
      value: formatCurrency(
        financialData.financialMetrics.avg_order_value || 0
      ),
      change: 5.2,
    },
    {
      icon: <Users className="text-teal-600" />,
      title: "Total Discount",
      value: formatCurrency(
        financialData.financialMetrics.total_discounts || 0
      ),
      change: -3.7,
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Financial Dashboard
        </h1>
        <div className="flex space-x-4">
          {/* Date Range Picker */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <DatePicker
                selectsStart
                selected={filters.startDate}
                onChange={(date) =>
                  setFilters((prev) => ({ ...prev, startDate: date }))
                }
                startDate={filters.startDate}
                endDate={filters.endDate}
                placeholderText="Start Date"
                className="px-4 py-2 border rounded-md w-36"
              />
            </div>
            <div className="relative">
              <DatePicker
                selectsEnd
                selected={filters.endDate}
                onChange={(date) =>
                  setFilters((prev) => ({ ...prev, endDate: date }))
                }
                startDate={filters.startDate}
                endDate={filters.endDate}
                minDate={filters.startDate}
                placeholderText="End Date"
                className="px-4 py-2 border rounded-md w-36"
              />
            </div>

            {/* Clear Button - Only show if either start or end date is set */}
            {(filters.startDate || filters.endDate) && (
              <button
                onClick={clearDateRange}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition ml-2"
                title="Clear Date Range"
              >
                <X size={20} className="text-gray-600" />
              </button>
            )}
          </div>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
          >
            Export Transactions
          </button>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {financialMetricCards.map((card, index) => (
          <FinancialMetricCard key={index} {...card} />
        ))}
      </div>

      {/* Revenue Breakdown and Top Data */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"> */}
      {/* Revenue Breakdown */}
      {/* <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Revenue Breakdown
          </h2>
          <div className="space-y-2">
            {financialData.revenueBreakdown.map((breakdown, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700 capitalize">
                  {breakdown.payment_type}
                </span>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">
                    {formatCurrency(breakdown.type_revenue)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({breakdown.type_order_count} orders)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div> */}

      {/* Top Vendors */}
      {/* <TopDataTable
          title="Top Vendors"
          data={financialData.topVendors}
          columns={["Vendor.email", "Total Revenue", "Order Count"]}
        /> */}
      {/* </div> */}

      {/* Top Products */}
      {/* <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Top Selling Products
        </h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left text-sm text-gray-600 pb-2">Product</th>
              <th className="text-left text-sm text-gray-600 pb-2">
                Quantity Sold
              </th>
              <th className="text-left text-sm text-gray-600 pb-2">
                Total Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {financialData.topProducts.map((product, index) => (
              <tr
                key={index}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <td className="py-2 text-sm text-gray-700">
                  {product.Product?.name || "N/A"}
                </td>
                <td className="py-2 text-sm text-gray-700">
                  {product.total_quantity}
                </td>
                <td className="py-2 text-sm text-gray-700">
                  {formatCurrency(product.total_product_revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Transactions
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                {table.getFlatHeaders().map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.column.columnDef.header}
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
                      className="px-4 py-3 text-sm text-gray-700"
                    >
                      {cell.column.columnDef.cell
                        ? cell.column.columnDef.cell({ row })
                        : cell.getValue()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-4">
          <div className="text-sm text-gray-700">
            Page {financialData.pagination.page} of{" "}
            {financialData.pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                fetchFinancialData(financialData.pagination.page - 1)
              }
              disabled={financialData.pagination.page <= 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() =>
                fetchFinancialData(financialData.pagination.page + 1)
              }
              disabled={
                financialData.pagination.page >=
                financialData.pagination.totalPages
              }
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
