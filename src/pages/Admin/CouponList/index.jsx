import React, { useEffect, useMemo, useState } from "react";
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
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  editCoupon,
  deleteCoupon,
  getAllCouponsAdmin,
  updateStatus,
} from "../../../services/api.coupon";

import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";
import EditCouponModal from "../../../components/Admin/modals/EditCouponModal";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import config from "../../../config/config";

const CouponList = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [modalMode, setModalMode] = useState("view");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingCoupon, setIsDeletingCoupon] = useState(false);

  const [formData, setFormData] = useState({
    coupon_name: "",
    type: "",
    discount_value: "",
    max_discount_amount: "",
    quantity: "",
    max_usage_per_user: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    status: "",
  });
  console.log(coupons);
  const fetchAllCoupons = async () => {
    try {
      const response = await getAllCouponsAdmin(1);

      const data = Array.isArray(response) ? response : response?.data || [];

      console.log("Extracted Data:", data);
      setCoupons(data);
      console.log("State Updated with Coupons:", data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  useEffect(() => {
    fetchAllCoupons();
  }, []);

  const columns = useMemo(
    () => [
      {
        header: "SL",
        accessorKey: "id",
      },
      { header: "Coupon Name", accessorKey: "coupon_name" },
      { header: "Type", accessorKey: "type" },
      { header: "Discount Type", accessorKey: "rate_type" },
      { header: "Discount Value", accessorKey: "discount_value" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <button
            onClick={() => handleStatusToggle(row.original.id)}
            className={`px-2 py-1 text-sm font-medium rounded
              ${
                row.original.status === "active"
                  ? "bg-green-100 text-green-600"
                  : row.original.status === "inactive"
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600"
              }`}
          >
            {row.original.status === "active"
              ? "Active"
              : row.original.status === "inactive"
              ? "Inactive"
              : "Unknown"}
          </button>
        ),
      },

      { header: "Start Date", accessorKey: "start_date" },
      { header: "End Date", accessorKey: "end_date" },
      {
        accessorKey: "actions",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => openModal(row.original, "view")}
              className="p-2 rounded-full text-green-500 hover:bg-green-600 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => openModal(row.original, "edit")}
              className="p-2 rounded-full text-blue-500 hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="p-2 rounded-full text-red-500 hover:bg-red-600 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [coupons]
  );

  const handleStatusToggle = async (id) => {
    try {
      const coupon = coupons.find((c) => c.id === id);
      const updatedStatus = coupon.status === "active" ? "inactive" : "active";

      const response = await updateStatus(id, {
        status: updatedStatus,
      });

      if (response.status === 1) {
        // notifyOnSuccess(`Status updated to ${updatedStatus}`);
        fetchAllCoupons();
      } else {
        notifyOnFail(response.message || "Failed to update the status.");
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      notifyOnFail("Something went wrong. Please try again.");
    }
  };

  const table = useReactTable({
    data: coupons,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openModal = (coupon, mode) => {
    setSelectedCoupon(coupon);
    setModalMode(mode);

    setFormData({
      coupon_name: coupon.coupon_name || "",
      type: coupon.type || "",
      rate_type: coupon.rate_type || "",
      discount_value: coupon.discount_value || "",
      min_purchase_amount: coupon.min_purchase_amount || "",
      max_discount_amount: coupon.max_discount_amount || "",
      quantity: coupon.quantity || "",
      max_usage_per_user: coupon.max_usage_per_user || "",
      start_date: coupon.start_date || "",
      end_date: coupon.end_date || "",
      status: coupon.status || "",
    });

    setShowModal(true);
  };
  const closeModal = async () => {
    setShowModal(false);
    await fetchAllCoupons();
  };

  const openDeleteModal = (coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteModalOpen(true);
  };
  const handleDelete = async () => {
    if (!selectedCoupon) return;
    setIsDeletingCoupon(true);

    try {
      setIsDeleteModalOpen(false);

      await deleteCoupon(selectedCoupon.id);

      await fetchAllCoupons();
    } catch (error) {
      console.error("Error deleting product:", error);
      notifyOnFail("Unable to delete the product");
    } finally {
      setIsDeletingCoupon(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 font-satoshi text-center sm:text-left">
          Coupon List
        </h2>
        <button
          className="bg-[#F47954] text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg hover:bg-gray-800 text-sm sm:text-lg transition-colors w-full sm:w-auto"
          onClick={() => navigate(`${config.VITE_BASE_ADMIN_URL}/coupons/add`)}
        >
          + Add Coupon
        </button>
      </div>

      <div className=" md:p-4 rounded-lg mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:w-auto border-gray-100 border py-3 px-10 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-400"
          />
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 text-lg" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                {table.getFlatHeaders().map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-sm font-semibold text-[#333843]"
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
              <div></div>
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

        {/* Pagination */}
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
      <EditCouponModal
        isOpen={showModal}
        onClose={closeModal}
        mode={modalMode}
        coupon={selectedCoupon}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        isDeleting={isDeletingCoupon}
      />
    </div>
  );
};

export default CouponList;
