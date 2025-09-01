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
} from "lucide-react";
import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  getAllBills,
  updateInvoiceStatus,
  deleteBill,
} from "../../../services/api.invoice";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import { CiImport } from "react-icons/ci";

const Modal = ({ isOpen, onClose, data, onApprove, onReject }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg">
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800">Invoice Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          {/* <p className="text-sm text-gray-600">
             <strong>Brand:</strong> {data.vendor.avatar || "N/A"} 
          </p> */}
          <p className="text-sm text-gray-600">
            <strong>Name:</strong>
            {""}
            {data.User.vendorDetails.first_name}
            {""}
            {data.User.vendorDetails.last_name}
            {/* {""}
            {data.vendor.last_name} */}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Amount Without GST:</strong>{" "}
            {data.total_without_gst || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Amount With GST:</strong> {data.total_with_gst || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Bill From:</strong> {data.bill_date_from || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Bill To:</strong> {data.bill_date_to || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Status:</strong> {data.payment_status || "N/A"}
          </p>
        </div>
        <div className="px-6 py-4 border-t flex justify-end">
          {data.invoice_status === "Pending" && (
            <button
              onClick={onApprove}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Approve
            </button>
          )}
          {data.invoice_status === "Approved" && (
            <button
              onClick={onReject}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ label, options, value, onChange, className }) => (
  <div className={className}>
    <label className="text-sm font-medium text-[#2D3954]">{label}</label>
    <div className="relative">
      <select
        className="w-full p-2 border-[#F2F2F2] rounded-md appearance-none bg-white"
        value={value}
        onChange={onChange}
      >
        <option value="" disabled>
          {label}
        </option>
        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  </div>
);
export default function BillsInvoice() {
  const [activeTab, setActiveTab] = useState("Bills");
  const [isLoading, setIsLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [displayedData, setDisplayedData] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
  const [filters, setFilters] = useState({
    vendor_name: "",
    bill_date_to: "",
    bill_date_from: "",
  });

  const fetchInvoices = async () => {
    try {
      const response = await getAllBills();
      setInvoices(response.data);
      setDisplayedData(response.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
    }
  };
  useEffect(() => {
    if (activeTab === "Bills") {
      setDisplayedData(invoices);
    } else if (activeTab === "Pending for approval") {
      const filteredData = invoices.filter(
        (invoice) => invoice.invoice_status === "Approved"
      );

      setDisplayedData(filteredData);
    }
  }, [activeTab, invoices]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openDeleteModal = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteModalOpen(true);
  };

  const handleApprove = async () => {
    const result = await updateInvoiceStatus(modalData.id, "Approved");
    if (result.invoice_status === 1) {
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.id === modalData.id
            ? { ...invoice, invoice_status: "Approved" }
            : invoice
        )
      );
    }
    setModalOpen(false);
  };

  const handleReject = async () => {
    try {
      const result = await updateInvoiceStatus(modalData.id, "Rejected");
      if (result.invoice_status === 1) {
        setInvoices((preInvoices) =>
          preInvoices.map((invoice) =>
            invoice.id === modalData.id
              ? { ...invoice, invoice_status: "Rejected" }
              : invoice
          )
        );
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Error rejecting invoice:", error);
    }
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
        header: "Seller ID",
        cell: ({ row, table }) => row.index + 1, // Computed value for row index
      },
      {
        header: "Brand",
        accessorKey: "brand", // Key from your data
        cell: ({ row }) => (
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-[10px] md:text-xs font-medium text-[#4A5154]">
                {`${row.original.User.vendorDetails.first_name || "N/A"} ${
                  row.original.User.vendorDetails.last_name || ""
                }`}
              </h3>
            </div>
          </div>
        ),
      },
      {
        header: "Amount Without GST",
        accessorKey: "total_without_gst",
        // cell: ({ value }) => (
        //   <span className="text-sm">₹ {value || "N/A"}</span>
        // ),
      },
      {
        header: "Amount With GST",
        accessorKey: "total_with_gst",
        // cell: ({ value }) => (
        //   <span className="text-sm">₹ {value || "N/A"}</span>
        // ),
      },
      {
        header: "Bill From",
        accessorKey: "bill_date_from",
        // cell: ({ value }) => <span className="text-sm">{value || "N/A"}</span>,
      },
      {
        header: "Bill To",
        accessorKey: "bill_date_to", // Fixed typo
      },
      {
        header: "Status",
        accessorKey: "invoice_status", // Fixed typo
        cell: ({ row }) => {
          const status = row.original.invoice_status; // Access the status field
          return (
            <span className="flex items-center">
              <span
                className={`w-2 h-2 mr-2 rounded-full ${
                  status === "Pending"
                    ? "bg-yellow-500"
                    : status === "Approved"
                    ? "bg-green-500"
                    : status === "Rejected"
                    ? "bg-red-500"
                    : "bg-[#0164CE]"
                }`}
              ></span>
              <span className="text-sm">{status || "N/A"}</span>
            </span>
          );
        },
      },
      {
        header: "Actions",
        accessorKey: "actions",
        cell: ({ row }) => (
          <div className="flex space-x-1">
            <button
              onClick={() => openModal(row.original, "view")}
              className="p-2 rounded-full text-[#5897F7] hover:bg-[#5897F7] hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-full text-[black] hover:bg-[#333536] hover:text-white transition-colors"
              onClick={() => downloadInvoicePDF(row.original, "export")}
            >
              <CiImport className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="p-2 rounded-full text-[#FD7777] hover:bg-[#FD7777] hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: displayedData, // Ensure this is correct
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

  // Filter functions
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      vendor_name: "",
      bill_date_from: "",
      bill_date_to: "",
    });
    setDisplayedData(invoices);
  };

  const applyFilters = () => {
    if (!invoices || invoices.length === 0) {
      return [];
    }

    let filteredInvoices = [...invoices];

    // Filter by vendor_name
    if (filters.vendor_name) {
      filteredInvoices = filteredInvoices.filter((item) => {
        const firstName = item?.User?.vendorDetails?.first_name || "";
        const lastName = item?.User?.vendorDetails?.last_name || "";
        const vendorName = `${firstName} ${lastName}`.toLowerCase();

        return vendorName.includes(filters.vendor_name.toLowerCase());
      });
    }

    // Filter by bill_date range
    if (filters.bill_date_from && filters.bill_date_to) {
      const bill_date_from = new Date(filters.bill_date_from);
      const bill_date_to = new Date(filters.bill_date_to);

      filteredInvoices = filteredInvoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.invoice_Date);

        return invoiceDate >= bill_date_from && invoiceDate <= bill_date_to;
      });
    }

    return filteredInvoices;
  };

  const handleShowData = () => {
    const filteredData = applyFilters();
    setDisplayedData(filteredData);
  };
  const handleDelete = async () => {
    if (!selectedInvoice) return;
    try {
      setIsDeletingInvoice(true);
      await deleteBill(selectedInvoice.id);

      setInvoices((prev) =>
        prev.filter((bill) => bill.id !== selectedInvoice.id)
      );
      setDisplayedData((prev) =>
        prev.filter((bill) => bill.id !== selectedInvoice.id)
      );
      setIsDeleteModalOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error("Failed to delete the bill:", error);
    } finally {
      setIsDeletingInvoice(false);
    }
  };

  const openModal = (data) => {
    setModalData(data);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalData(null);
    setModalOpen(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Extract table headers

    // Get selected rows or default to all rows
    const selectedRows =
      Object.keys(table.getSelectedRowModel().rows).length > 0
        ? Object.values(table.getSelectedRowModel().rows).map(
            (row) => row.original
          )
        : invoices.map((invoice) => invoice.original || invoice);

    // Map rows to the PDF table format
    const tableRows = selectedRows.map((invoice) => [
      invoice.invoice_number || "N/A",
      `${invoice.User.vendorDetails.first_name || ""} ${
        invoice.User.vendorDetails.last_name || ""
      }`,
      invoice.total_without_gst || "",
      invoice.total_with_gst || "",
      invoice.bill_date_from || "N/A",
      invoice.bill_date_to || "N/A",

      invoice.invoice_status || "N/A",
    ]);

    // Generate the PDF table
    doc.autoTable({
      head: [
        [
          "Seller ID",
          "Brand",
          "Amount Without GST",
          "Amount With GST",
          "Bill From",
          "Bill To",
          "Status",
        ],
      ],
      body: tableRows,
    });

    doc.save("invoices.pdf");
  };

  const downloadInvoicePDF = (invoice) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Invoice Details - ${invoice.invoice_number}`, 20, 20);
    doc.setFontSize(12);
    const details = [
      ["Seller ID:", invoice.id],
      [
        "Brand:",
        invoice.User.vendorDetails.first_name +
          invoice.User.vendorDetails.last_name,
      ],
      ["Bill From:", invoice.bill_date_from],
      ["Bill To:", invoice.bill_date_to],
      ["Amount Without GST:", invoice.total_without_gst],
      ["Amount With GST:", invoice.total_with_gst],
      ["Status:", invoice.invoice_status],
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

    doc.save(`invoice-${invoice.invoice_number}.pdf`);
  };

  return (
    <div className=" min-h-screen p-6 mx-auto">
      <div className="flex-1 flex flex-col">
        <header className="">
          <h1 className=" text-2xl md:text-3xl text-[#333843] font-poppins font-semibold">
            Bills/Invoice
          </h1>
        </header>
        <div className="flex flex-wrap sm:flex-nowrap border-b mb-6 mt-2">
          {["Bills", "Pending for approval"].map((tab) => (
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
          ))}
        </div>

        {/* Search Bar and Export Button */}
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
            onClick={exportToPDF}
            className="w-full sm:w-auto px-4 py-2 bg-[#F47954] text-white rounded-md flex items-center justify-center"
          >
            <CiImport className="mr-2" size={20} />
            Export Data
          </button>
        </div>

        <div className="bg-white rounded-md px-3 py-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
            <FilterSelect
              label="Seller"
              options={[
                ...new Set(
                  invoices.map((r) => {
                    const firstName = r?.User?.vendorDetails?.first_name || "";
                    const lastName = r?.User?.vendorDetails?.last_name || "";
                    return `${firstName} ${lastName}`.trim(); // Combine first and last names
                  })
                ),
              ]}
              value={filters.vendor_name}
              onChange={(e) =>
                handleFilterChange("vendor_name", e.target.value)
              }
            />

            <div>
              <label className="text-sm font-medium text-txtPage">
                Bill From
              </label>
              <input
                type="date"
                className="w-full p-2 border-[#F2F2F2] rounded-md"
                value={filters.bill_date_from}
                onChange={(e) =>
                  handleFilterChange("bill_date_from", e.target.value)
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-txtPage">
                Bill To
              </label>
              <input
                type="date"
                className="w-full p-2 border-[#F2F2F2] rounded-md"
                value={filters.bill_date_to}
                onChange={(e) =>
                  handleFilterChange("bill_date_to", e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex gap-3 col-span-2  mt-3 md:justify-end md:-mt-11">
            <button
              className="px-6 py-2 bg-gray-300 text-[#4C4C1F] text-sm font-medium rounded-2xl"
              onClick={clearFilters}
            >
              Clear
            </button>
            <button
              className="px-6 py-3 bg-[#F47954] text-sm font-medium text-white rounded-2xl"
              onClick={handleShowData}
            >
              Show Data
            </button>
          </div>
        </div>
        {activeTab === "Bills" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
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
            </div>
          </div>
        )}

        {activeTab === "Pending for approval" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
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
            </div>
          </div>
        )}

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
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this bill? This action cannot be undone."
        // isDeleting={isDeletingProduct}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={modalData}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
