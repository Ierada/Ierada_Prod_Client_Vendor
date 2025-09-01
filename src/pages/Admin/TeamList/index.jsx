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
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";
import config from "../../../config/config";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import TeamModal from "../../../components/Admin/modals/TeamModal";
import {
  getAllSubAdmin,
  deleteSubAdmin,
  updateStatus,
} from "../../../services/api.admin";

const TeamList = () => {
  const navigate = useNavigate();

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subUserIdToDelete, setSubUserIdToDelete] = useState(null);
  const [subAdmin, setSubAdmin] = useState([]);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);

  const fetchData = async () => {
    try {
      const response = await getAllSubAdmin();
      setSubAdmin(response.data);
    } catch (error) {
      console.error("Error fetching sub-admins:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => {
          const name = info.row.original.name || "N/A";
          const mobileNumber = info.row.original?.adminUser.phone || "N/A";
          return (
            <div>
              <div>{name}</div>
              <div className="text-xs text-[#202224]">{mobileNumber}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "adminUser.email",
        header: "Email",
        cell: (info) => {
          const email = info.row.original?.adminUser.email || "N/A";
          return <span className="text-blue-500">{email}</span>;
        },
      },
      {
        accessorKey: "created_at",
        header: "Adding Date",
        cell: (info) => {
          const createdAt = info.row.original.created_at;
          const date = createdAt
            ? new Date(createdAt).toLocaleDateString()
            : "N/A";
          return <span>{date}</span>;
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: (info) => {
          const isActive = info.row.original?.adminUser.is_active;
          const status = isActive ? "Active" : "Inactive";
          const statusClass = isActive
            ? "text-green-500 bg-green-100"
            : "text-red-500 bg-red-100";

          return (
            <button
              onClick={() => handleStatusToggle(info.row.original.id)}
              className={`${statusClass} font-medium px-4 py-2 rounded-md`}
            >
              {status}
            </button>
          );
        },
      },
      {
        accessorKey: "actions",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex space-x-1">
            <button
              onClick={() => openModal(row.original)}
              className="p-2 rounded-full text-green-500 hover:bg-green-600 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                navigate(
                  `${config.VITE_BASE_ADMIN_URL}/team/${row.original.id}`
                )
              }
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
      },
    ],
    [subAdmin]
  );

  const handleStatusToggle = async (id) => {
    try {
      const toggle = subAdmin.find((c) => c.id === id);
      if (!toggle) {
        console.error("User not found.");
        return;
      }

      const isActive = toggle.adminUser.is_active;
      const updatedStatus = !isActive;

      const response = await updateStatus(id, { is_active: updatedStatus });

      if (response.status === 1) {
        setSubAdmin((prev) =>
          prev.map((subAdmin) =>
            subAdmin.id === id
              ? {
                  ...subAdmin,
                  adminUser: {
                    ...subAdmin.adminUser,
                    is_active: updatedStatus,
                  },
                }
              : subAdmin
          )
        );
        fetchData();
      } else {
        console.error(response.message || "Failed to update the status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const openModal = (data) => {
    setModalData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedSubAdmin) return;

    try {
      await deleteSubAdmin(selectedSubAdmin.id);
      setSubAdmin((prevSubAdmins) =>
        prevSubAdmins.filter((subAdmin) => subAdmin.id !== selectedSubAdmin.id)
      );
      setIsDeleteModalOpen(false);
      setSelectedSubAdmin(null);
    } catch (error) {
      console.error("Error deleting sub-admin:", error);
    }
  };

  const openDeleteModal = (subUser) => {
    setSelectedSubAdmin(subUser);
    setIsDeleteModalOpen(true);
  };

  const table = useReactTable({
    data: subAdmin,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-0 text-gray-900">
            Sub Users/Team
          </h1>
          <button
            onClick={() => navigate("/admin/team/add")}
            className="mb-4 md:mb-0 bg-[#F47954] text-white px-4 py-2 rounded w-full md:w-auto"
          >
            + Add New User
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search Team..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="px-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47954] w-full md:w-auto"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {table.getFlatHeaders().map((header) => (
                    <th
                      key={header.id}
                      className="bg-gray-100 px-6 py-4 text-left text-xs font-semibold text-[#202224]"
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
                  <tr
                    key={row.id}
                    className="border-b hover:bg-gray-50 text-xs text-[#202224]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
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

      <TeamModal isOpen={isModalOpen} onClose={closeModal} data={modalData} />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete SubUser"
        message="Are you sure you want to delete this subuser? This action cannot be undone."
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default TeamList;
