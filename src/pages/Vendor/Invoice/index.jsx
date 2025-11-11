import React, { useState, useMemo, useEffect } from "react";
import {
  useTable,
  usePagination,
  useSortBy,
  useGlobalFilter,
} from "react-table";
import { Eye, X, ChevronDown, ChevronUp } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import jsPDF from "jspdf";
import "jspdf-autotable";
import InvoiceModal from "../../../components/Vendor/Models/InvoiceModal";
import {
  formatDate,
  formatTime,
  formatMonthYear,
} from "../../../utils/date&Time/dateAndTimeFormatter";
import { getAllBillsByVendor, submitBill } from "../../../services/api.invoice";
import { toast } from "react-toastify";
import { useAppContext } from "../../../context/AppContext";

// Form initial state
const initialFormState = {
  bill_date_from: "",
  bill_date_to: "",
  sold_products: "",
  return_products: "",
  cancelled_products: "",
  total_with_gst: "",
  total_without_gst: "",
  bill_document: null,
};

// Validation function
const validateForm = (data) => {
  const errors = {};
  if (!data.bill_date_from) errors.bill_date_from = "Start date is required";
  if (!data.bill_date_to) errors.bill_date_to = "End date is required";
  if (
    !data.sold_products ||
    isNaN(data.sold_products) ||
    data.sold_products === ""
  )
    errors.sold_products = "Sold products must be a valid number";
  if (
    !data.return_products ||
    isNaN(data.return_products) ||
    data.return_products === ""
  )
    errors.return_products = "Return products must be a valid number";
  if (
    !data.cancelled_products ||
    isNaN(data.cancelled_products) ||
    data.cancelled_products === ""
  )
    errors.cancelled_products = "Cancelled products must be a valid number";
  if (
    !data.total_with_gst ||
    isNaN(data.total_with_gst) ||
    data.total_with_gst === ""
  )
    errors.total_with_gst = "Total with GST must be a valid number";
  if (
    !data.total_without_gst ||
    isNaN(data.total_without_gst) ||
    data.total_without_gst === ""
  )
    errors.total_without_gst = "Total without GST must be a valid number";
  if (!data.bill_document) errors.bill_document = "Bill document is required";
  return errors;
};

// Skeleton loader component
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(9)].map((_, index) => (
      <td key={index} className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded-md w-full transform transition-all duration-300 ease-in-out"></div>
      </td>
    ))}
  </tr>
);

// Empty state component
const EmptyState = ({ onRefresh }) => (
  <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg space-y-4">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
      <IoCloudUploadOutline className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900">No Invoices Found</h3>
    <p className="text-sm text-gray-500 text-center max-w-sm">
      There are currently no invoices in the system. Click the "Submit New Bill"
      button above to get started.
    </p>
    <button
      onClick={onRefresh}
      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
    >
      Refresh List
    </button>
  </div>
);

// Submit Bill Form Component
const SubmitBillForm = ({ onSubmit, onClose, isSubmitting }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "bill_document") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    console.log("Validation Errors:", validationErrors);
    console.log("Form Data before submission:", formData);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Submit New Bill
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bill Date From
              </label>
              <input
                type="date"
                name="bill_date_from"
                value={formData.bill_date_from}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.bill_date_from ? "border-red-500" : ""
                }`}
              />
              {errors.bill_date_from && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.bill_date_from}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bill Date To
              </label>
              <input
                type="date"
                name="bill_date_to"
                value={formData.bill_date_to}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.bill_date_to ? "border-red-500" : ""
                }`}
              />
              {errors.bill_date_to && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.bill_date_to}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sold Products
              </label>
              <input
                type="number"
                name="sold_products"
                value={formData.sold_products}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.sold_products ? "border-red-500" : ""
                }`}
                placeholder="Enter number of products"
              />
              {errors.sold_products && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.sold_products}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Return Products
              </label>
              <input
                type="number"
                name="return_products"
                value={formData.return_products}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.return_products ? "border-red-500" : ""
                }`}
                placeholder="Enter number of products"
              />
              {errors.return_products && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.return_products}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cancelled Products
              </label>
              <input
                type="number"
                name="cancelled_products"
                value={formData.cancelled_products}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.cancelled_products ? "border-red-500" : ""
                }`}
                placeholder="Enter number of products"
              />
              {errors.cancelled_products && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.cancelled_products}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total With GST
              </label>
              <input
                type="number"
                name="total_with_gst"
                value={formData.total_with_gst}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.total_with_gst ? "border-red-500" : ""
                }`}
                placeholder="Enter amount"
              />
              {errors.total_with_gst && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.total_with_gst}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Without GST
              </label>
              <input
                type="number"
                name="total_without_gst"
                value={formData.total_without_gst}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.total_without_gst ? "border-red-500" : ""
                }`}
                placeholder="Enter amount"
              />
              {errors.total_without_gst && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.total_without_gst}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Bill
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <IoCloudUploadOutline className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="bill-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="bill-upload"
                        name="bill_document"
                        type="file"
                        className="sr-only"
                        onChange={handleInputChange}
                        accept=".pdf,.doc,.docx"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                </div>
              </div>
              {errors.bill_document && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.bill_document}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Bill"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Invoice Component
const Invoice = () => {
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [showSubmitBill, setShowSubmitBill] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch invoices
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        toast.error("Vendor authentication required");
        return;
      }
      const data = await getAllBillsByVendor(user.id);
      setInvoices(data);
    } catch (error) {
      toast.error("Failed to fetch invoices");
      console.error("Error fetching invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Handle bill submission
  const handleSubmitBill = async (formData) => {
    console.log("handleSubmitBill received:", formData);
    setIsSubmitting(true);
    try {
      if (!user) return toast.error("Vendor authentication required");

      const fd = new FormData();
      fd.append("bill_date_from", formData.bill_date_from);
      fd.append("bill_date_to", formData.bill_date_to);
      fd.append("sold_products", formData.sold_products);
      fd.append("return_products", formData.return_products);
      fd.append("cancelled_products", formData.cancelled_products);
      fd.append("total_with_gst", formData.total_with_gst);
      fd.append("total_without_gst", formData.total_without_gst);
      fd.append("bill_document", formData.bill_document);

      console.log("FormData contents before submission:");
      for (let [key, value] of fd) {
        console.log(`${key}:`, value);
      }

      const response = await submitBill(user.id, fd);
      if (response) {
        toast.success("Bill submitted successfully");
        setShowSubmitBill(false);
        fetchInvoices();
      }
    } catch (error) {
      toast.error("Failed to submit bill");
      console.error("Error submitting bill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate PDF
  const downloadInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text("Invoice Details", 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(102, 102, 102);
    doc.text("Company Name", 20, 30);

    const details = [
      ["Invoice Number", invoice.invoice_number],
      ["Date From", formatDate(invoice.bill_date_from)],
      ["Date To", formatDate(invoice.bill_date_to)],
      ["Total (GST)", `₹${invoice.total_with_gst}`],
      ["Total (No GST)", `₹${invoice.total_without_gst}`],
      ["Status", invoice.invoice_status],
      ["Payment Status", invoice.payment_status],
    ];

    doc.autoTable({
      startY: 40,
      head: [["Detail", "Value"]],
      body: details,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [0, 100, 206] },
    });

    doc.save(`invoice-${invoice.invoice_number}.pdf`);
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        Header: "SL",
        accessor: (row, index) => index + 1,
        Cell: ({ value }) => (
          <span className="font-medium text-gray-900">{value}</span>
        ),
      },
      {
        Header: "Bill Number",
        accessor: "invoice_number",
        Cell: ({ value }) => (
          <span className="font-medium text-blue-600">{value}</span>
        ),
      },
      {
        Header: "From Month",
        accessor: "bill_date_from",
        Cell: ({ value }) => (
          <span className="text-gray-900">{formatMonthYear(value)}</span>
        ),
      },
      {
        Header: "To Month",
        accessor: "bill_date_to",
        Cell: ({ value }) => (
          <span className="text-gray-900">{formatMonthYear(value)}</span>
        ),
      },
      {
        Header: "Total With GST",
        accessor: "total_with_gst",
        Cell: ({ value }) => (
          <span className="text-gray-900">
            ₹{parseFloat(value).toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        Header: "Bill Status",
        accessor: "invoice_status",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
            <span
              className={`w-2 h-2 mr-2 rounded-full ${
                value === "Processing"
                  ? "bg-yellow-400"
                  : value === "Delivered"
                  ? "bg-green-400"
                  : value === "Confirmed"
                  ? "bg-blue-400"
                  : "bg-red-400"
              }`}
            ></span>
            {value}
          </span>
        ),
      },
      {
        Header: "Payment Status",
        accessor: "payment_status",
        Cell: ({ value }) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
              value === "Paid"
                ? "bg-green-100 text-green-800"
                : value === "Pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: "Bill PDF",
        Cell: ({ row }) => (
          <button
            onClick={() => downloadInvoicePDF(row.original)}
            className="group p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
            title="Download PDF"
          >
            <FaFilePdf className="w-5 h-5 text-red-500 group-hover:text-red-600" />
          </button>
        ),
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedInvoice(row.original);
                setIsModalOpen(true);
              }}
              className="p-2 rounded-full hover:bg-blue-50 transition-colors duration-200"
              title="View Details"
            >
              <Eye className="w-5 h-5 text-blue-500" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: invoices,
      initialState: { pageSize: 10 },
      autoResetPage: false,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // Search functionality
  const handleSearch = (e) => {
    const value = e.target.value || "";
    setGlobalFilter(value);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-semibold text-gray-900">
          Invoice Management
        </h1>
        <button
          onClick={() => setShowSubmitBill(!showSubmitBill)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {showSubmitBill ? (
            <ChevronUp className="w-5 h-5 mr-2" />
          ) : (
            <IoCloudUploadOutline className="w-5 h-5 mr-2" />
          )}
          Submit New Bill
        </button>
      </div>

      {/* Submit Bill Form Section - Animated */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showSubmitBill ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <SubmitBillForm
          onSubmit={handleSubmitBill}
          onClose={() => setShowSubmitBill(false)}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Search and Filter Section - Show only when there's data */}
      {!isLoading && invoices.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-md">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Search invoices..."
                value={globalFilter || ""}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState onRefresh={fetchInvoices} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table
                {...getTableProps()}
                className="min-w-full divide-y divide-gray-200"
              >
                <thead className="bg-gray-50">
                  {headerGroups?.map((headerGroup) => (
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
                            <span className="text-gray-400">
                              {column.isSorted
                                ? column.isSortedDesc
                                  ? "↓"
                                  : "↑"
                                : ""}
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
                      <tr
                        {...row.getRowProps()}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        {row.cells.map((cell) => (
                          <td
                            {...cell.getCellProps()}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
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
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => nextPage()}
                  disabled={!canNextPage}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {pageIndex * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min((pageIndex + 1) * pageSize, invoices.length)}
                    </span>{" "}
                    of <span className="font-medium">{invoices.length}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => gotoPage(0)}
                      disabled={!canPreviousPage}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">First</span>
                      {"<<"}
                    </button>
                    <button
                      onClick={() => previousPage()}
                      disabled={!canPreviousPage}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Previous</span>
                      {"<"}
                    </button>
                    <button
                      onClick={() => nextPage()}
                      disabled={!canNextPage}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Next</span>
                      {">"}
                    </button>
                    <button
                      onClick={() => gotoPage(pageCount - 1)}
                      disabled={!canNextPage}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Last</span>
                      {">>"}
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invoice Details Modal */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default Invoice;
