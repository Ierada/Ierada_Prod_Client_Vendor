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
} from "lucide-react";
import { getVendorTransactions } from "../../../services/api.vendor";
import { set } from "date-fns";
const VendorTransaction = () => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [vendorTransactions, setVendorTransactions] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);

  const [filters, setFilters] = useState({
    transaction_number: "",
    bank_name: "",
    transaction_date: "",
  });

  const clearFilters = () => {
    setFilters({
      transaction_number: "",
      bank_name: "",
      transaction_date: "",
    });
    setDisplayedData(vendorTransactions);
  };

  const applyFilters = () => {
    if (!vendorTransactions || vendorTransactions.length === 0) {
      return [];
    }

    let filteredData = [...vendorTransactions];

    if (filters.transaction_number) {
      filteredData = filteredData.filter(
        (item) => item.transaction_number === filters.transaction_number
      );
    }

    if (filters.bank_name) {
      filteredData = filteredData.filter(
        (item) => item.vendor_data.bank_name === filters.bank_name
      );
    }

    if (filters.transaction_date) {
      const filterDate = new Date(filters.transaction_date);

      filteredData = filteredData.filter((item) => {
        const transactionDate = new Date(item.transaction_date);
        return transactionDate.toDateString() === filterDate.toDateString();
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

  const fetchVendorTransactions = () => {
    try {
      const response = getVendorTransactions();
      setVendorTransactions(response || []);
      setDisplayedData(response || []);
    } catch (error) {
      notifyOnFail("Failed to fetch Vendor Transaction.");
      setVendorTransactions([]);
      setDisplayedData([]);
    }
  };

  useEffect(() => {
    fetchVendorTransactions();
  }, []);

  const columns = [
    {
      header: "SL",
      cell: ({ row }) => row.index + 1,
      disableSortBy: true,
    },
    {
      accessorKey: "transaction_number",
      header: "Transaction Number",
      cell: ({ row }) => row.original.transaction_number,
    },
    {
      accessorKey: "transaction_date",
      header: "Transaction Date",
      cell: ({ row }) => row.original.transaction_date,
    },
    {
      accessorKey: "vendor_data",
      header: "Paymnet To",
      cell: ({ row }) => row.original.vendor_data.company_name,
    },
    {
      accessorKey: "vendor_data",
      header: "Account Number",
      cell: ({ row }) => row.original.vendor_data.account_number,
    },
    {
      accessorKey: "vendor_data ",
      header: "IFSC",
      cell: ({ row }) => row.original.vendor_data.ifsc_code,
    },
    {
      accessorKey: "vendor_data",
      header: "Bank Name",
      cell: ({ row }) => row.original.vendor_data.bank_name,
    },
    {
      accessorKey: "",
      header: "Payment Method",
      cell: ({ row }) => row.original.payment_method,
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Vendor Transaction
        </h1>

        <div className="bg-white p-4 rounded-md mb-6 shadow-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            <FilterSelect
              label="Tr Number"
              options={[
                ...new Set(
                  vendorTransactions?.map((item) => item.transaction_number)
                ),
              ]}
              value={filters.transaction_number}
              onChange={(e) =>
                setFilters({ ...filters, transaction_number: e.target.value })
              }
            />
            <FilterSelect
              label="Bank Name"
              options={[
                ...new Set(
                  vendorTransactions?.map((item) => item.vendor_data.bank_name)
                ),
              ]}
              value={filters.bank_name}
              onChange={(e) =>
                setFilters({ ...filters, bank_name: e.target.value })
              }
            />
            <div>
              <label className="text-sm font-medium text-txtPage">
                Transaction Date
              </label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={filters.transaction_date}
                onChange={(e) =>
                  handleFilterChange("transaction_date", e.target.value)
                }
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear
              </button>
              <button
                onClick={() => handleShowData()}
                className="px-4 py-2 bg-[#F47954] text-white rounded-md hover:bg-blue-700"
              >
                Show Data
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {table?.getFlatHeaders()?.map((header, index) => (
                    <th
                      key={index}
                      className="bg-white px-6 py-4 text-left text-sm font-medium text-gray-500"
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
                {table?.getRowModel()?.rows?.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    {row?.getVisibleCells()?.map((cell, index) => (
                      <td key={index} className="px-6 py-4">
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
              {Array?.from(
                { length: table?.getPageCount() },
                (_, i) => i + 1
              )?.map((pageNumber, index) => (
                <button
                  key={index}
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
                onClick={() => table?.previousPage()}
                disabled={!table?.getCanPreviousPage()}
                className="flex items-center gap-2 text-gray-600 hover:text-[#F47954] disabled:opacity-50 disabled:hover:text-gray-600"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => table?.nextPage()}
                disabled={!table?.getCanNextPage()}
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

const FilterSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <label className="text-sm font-medium text-txtPage">{label}</label>
      <div
        className="w-full p-2 border rounded-md bg-white flex justify-between items-center cursor-pointer border-gray-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || label}
        <svg
          className={`w-5 h-5 transition-transform ${
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
          {options?.map((option, index) => (
            <div
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange({ target: { value: option } });
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorTransaction;
