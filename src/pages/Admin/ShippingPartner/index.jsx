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
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import ShippingPartnerModal from "../../../components/Admin/modals/ShippingPartnerModal";
import {
  getAllShippingPartners,
  updateShippingPartnerStatus,
  deleteShippingPartner,
  createShippingPartner,
} from "../../../services/api.shippingpartner";
import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";
import { set } from "date-fns";

const ShippingPartner = () => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [shippingPartner, setShippingPartner] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedShippingPartner, setSelectedShippingPartner] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingShippingPartner, setIsDeletingShippingPartner] =
    useState(false);

  const fetchShippingPartner = async () => {
    try {
      const response = await getAllShippingPartners();
      console.log("API Response:", response);
      setShippingPartner(response?.data || []);
    } catch (error) {
      console.error("API Error:", error);
      notifyOnFail("Failed to fetch Shipping Partner.");
      setShippingPartner([]);
    }
  };

  useEffect(() => {
    fetchShippingPartner();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    api_url: "",
    api_key: "",
    tracking_url: "",
    status: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.api_url ||
      !formData.api_key ||
      !formData.tracking_url
    ) {
      console.log("Please fill out all fields!");
      notifyOnFail("Please fill out all fields!");
      return;
    }

    try {
      const response = await createShippingPartner(formData);
      console.log("Shipping Partner Created:", response);

      if (response?.status) {
        notifyOnSuccess("Shipping Partner created successfully!");
        fetchShippingPartner(); // Refresh the list after adding
        setShowModal(false); // Close the modal if applicable
        setFormData({
          name: "",
          api_url: "",
          api_key: "",
          tracking_url: "",
          status: "", // Reset form
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      notifyOnFail("Failed to create Shipping Partner.");
    }
  };

  const openModal = (partner) => {
    setSelectedShippingPartner(partner);

    setShowModal(true);
  };

  const closeModal = async () => {
    setShowModal(false);
    await fetchShippingPartner();
  };

  const openDeleteModal = (partner) => {
    setSelectedShippingPartner(partner);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedShippingPartner) return;
    setIsDeletingShippingPartner(true);
    try {
      setIsDeleteModalOpen(false);
      await deleteShippingPartner(selectedShippingPartner.id);

      notifyOnSuccess("ShippingPartner deleted successfully.");
    } catch (error) {
      notifyOnFail("Failed to delete ShippingPartner.");
    } finally {
      setIsDeletingShippingPartner(false);
    }
  };

  const toggleStatus = async (id) => {
    const partner = shippingPartner.find((p) => p.id === id);
    const newStatus = !partner.active;

    const res = await updateShippingPartnerStatus(id, { active: newStatus });

    if (res && res.status === 1) {
      notifyOnSuccess(`Status changed to ${newStatus ? "True" : "False"}`);
      await fetchShippingPartner();
    } else {
      notifyOnFail("Unable to change the status");
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "SL",
        cell: ({ row }) => row.index + 1,
        disableSortBy: true,
      },
      {
        accessorKey: "name",
        header: "Shipping Vendor Name",
        cell: ({ row }) => row.original.name,
      },

      {
        accessorKey: "api_url",
        header: "API URL",
        cell: ({ row }) => row.original.api_url,
      },

      {
        accessorKey: "tracking_url",
        header: "Tracking URL",
        cell: ({ row }) => row.original.tracking_url,
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={row.original.active}
              onChange={() => toggleStatus(row.original.id)}
            />
            <div
              className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-500 
                           peer-focus:ring-2 peer-focus:ring-blue-500 transition-all duration-200"
            >
              <div
                className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-md 
                              transform transition-transform duration-200 peer-checked:translate-x-5"
              ></div>
            </div>
          </label>
        ),
      },
      {
        accessorKey: "actions",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex gap-2">
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
    [shippingPartner]
  );

  const table = useReactTable({
    data: shippingPartner,
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
          Shipping Partner
        </h1>

        <div className="bg-white p-4 rounded-md mb-6 shadow-card">
          <h2 className="text-gray-900 text-xl mb-4 mt-2 font-normal">
            Create New Shipping Partner
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            <div className="col-span-1">
              <label htmlFor="First Name" className="block text-gray-700 mb-2">
                Vendor Name
              </label>
              <input
                type="text"
                id=""
                name="name"
                placeholder="Vendor Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="chargeName" className="block text-gray-700 mb-2">
                API URL
              </label>
              <input
                type="text"
                id=""
                name="api_url"
                placeholder="API URL"
                value={formData.api_url}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="chargeType" className="block text-gray-700 mb-2">
                API KEY
              </label>
              <input
                type="text"
                id=""
                name="api_key"
                placeholder="API KEY"
                value={formData.api_key}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="hsnCode" className="block text-gray-700 mb-2">
                Tracking URL
              </label>
              <input
                type="text"
                id=""
                name="tracking_url"
                placeholder="Tracking URL"
                value={formData.tracking_url}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              className="px-4 py-2 bg-[#F47954] text-white rounded-md"
              onClick={handleSave}
            >
              Save
            </button>
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

        {showModal && (
          <ShippingPartnerModal
            isOpen={showModal}
            onClose={closeModal}
            shippingPartner={selectedShippingPartner}
          />
        )}

        {isDeleteModalOpen && (
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            isDeleting={isDeletingShippingPartner}
            title="Delete ShippingPartner Data"
            message="Are you sure you want to delete this ShippingPartner data? This action cannot be undone."
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default ShippingPartner;
