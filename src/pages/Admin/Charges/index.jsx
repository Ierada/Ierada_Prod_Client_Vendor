import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit, Trash2 } from "lucide-react";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import ChargesModal from "../../../components/Admin/modals/ChargesModal";
import { getAllCharges, deleteCharge } from "../../../services/api.charges";
import { notifyOnFail, notifyOnSuccess } from "../../../utils/notification/toast";

const Charges = () => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [charges, setCharges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingCharge, setIsDeletingCharge] = useState(false);
  const fetchCharges = () => {
    try {
      const response = getAllCharges();
      setCharges(response || []);
    } catch (error) {
      notifyOnFail("Failed to fetch Vendor Performance.");
      setCharges([]);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  const [formData, setFormData] = useState({
    charge_name: "",
    charge_type: "",
    hsn_code: "",
    charges_price: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    if (
      formData.charge_name &&
      formData.charge_type &&
      formData.hsn_code &&
      formData.charges_price &&
      formData.description
    ) {
      console.log("Form Data Submitted:", formData);
      console.log("Data saved successfully!");
    } else {
      console.log("Please fill out all fields!");
    }
  };


  const openModal = (charge, mode) => {
    setSelectedCharge(charge);
    setModalMode(mode);
    setShowModal(true);
  };

  const closeModal = async () => {
    setShowModal(false);
    setSelectedCharge(null);
    await fetchCharges();
  };

  const openDeleteModal = (charge) => {
    setSelectedCharge(charge);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCharge) return;
    setIsDeletingCharge(true);
    try {
      const res = await deleteCharge(selectedCharge.id);
      if (res.status === 1) {
        notifyOnSuccess("Charge deleted successfully.");
        await fetchCharges();
      }
    } catch (error) {
      notifyOnFail("Failed to delete charge.");
    } finally {
      setIsDeletingCharge(false);
      setIsDeleteModalOpen(false);
      setSelectedCharge(null);
    }
  };

  const columns = [
    {
      header: "SL",
      cell: ({ row }) => row.index + 1,
      disableSortBy: true,
    },
    {
      accessorKey: "charge_name",
      header: "Charge Name",
      cell: ({ row }) => row.original.charge_name,
    },
    {
      accessorKey: "charge_type",
      header: "Charge Type",
      cell: ({ row }) => row.original.charge_type,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description,
    },
    {
      accessorKey: "hsn_code",
      header: "HSN Code",
      cell: ({ row }) => row.original.hsn_code,
    },
    {
      accessorKey: "charges_price",
      header: "Charges",
      cell: ({ row }) => row.original.charges_price,
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
  ];

  const table = useReactTable({
    data: charges,
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
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Charges</h1>

        <div className="bg-white p-4 rounded-md mb-6 shadow-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
            <div className="col-span-1">
              <label htmlFor="chargeName" className="block text-gray-700 mb-2">
                Charge Name
              </label>
              <input
                type="text"
                id="charge_name"
                name="charge_name"
                placeholder="Charge Name"
                value={formData.charge_name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="chargeType" className="block text-gray-700 mb-2">
                Charge Type
              </label>
              <input
                type="text"
                id="charge_type"
                name="charge_type"
                placeholder="Charge Type"
                value={formData.charge_type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="hsnCode" className="block text-gray-700 mb-2">
                HSN Code
              </label>
              <input
                type="text"
                id="hsn_code"
                name="hsn_code"
                placeholder="HSN Code"
                value={formData.hsn_code}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="hsnCode" className="block text-gray-700 mb-2">
                Charges Price
              </label>
              <input
                type="text"
                id="charges_price"
                name="charges_price"
                placeholder="Charges Price"
                value={formData.charges_price}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="description" className="block text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-4">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
              onClick={() => alert("CSV Import functionality not implemented yet.")}
            >
              Import CSV
            </button>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-md" onClick={handleSave}>
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
                      className="bg-white px-6 py-4 text-left text-sm font-medium text-gray-500"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
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
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="flex items-center gap-2">
              {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((pageNumber) => (
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
          <ChargesModal isOpen={showModal} onClose={closeModal} mode={modalMode} charge={selectedCharge} />
        )}

        {isDeleteModalOpen && (
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            isDeleting={isDeletingCharge}
            title="Delete Charges Data"
            message="Are you sure you want to delete this charges data? This action cannot be undone."
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default Charges;
