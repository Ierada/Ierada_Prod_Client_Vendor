import React, { useEffect, useMemo, useState } from "react";
import {
  useTable,
  usePagination,
  useSortBy,
  useGlobalFilter,
} from "react-table";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  deleteFabric,
  updateStatus,
  getAllFabrics,
} from "../../../services/api.fabric";
import FabricModal from "../../../components/Admin/modals/FabricModal";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import {
  notifyOnSuccess,
  notifyOnFail,
} from "../../../utils/notification/toast";
import config from "../../../config/config";

const FabricList = () => {
  const [fabrics, setFabric] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingFabric, setIsDeletingFabric] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    image: "",
    slug: "",
    status: "true",
    categoryId: "",
  });

  const fetchAllFabric = async () => {
    try {
      setIsLoading(true);
      const response = await getAllFabrics();
      console.log("API Response:", response);
      setFabric(response || []);
    } catch (error) {
      console.error("Error fetching fabrics:", error);
      setFabric([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFabric();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Type",
        accessor: "type",
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Category",
        accessor: "category.title",
        Cell: ({ value }) => value || "No Category",
      },
      {
        Header: "Image",
        accessor: "image",
        Cell: ({ value }) => (
          <img src={value} alt="fabric" className="w-20 h-20 object-cover" />
        ),
      },
      {
        Header: "Slug",
        accessor: "slug",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ row }) => (
          <button
            onClick={() => handleStatusToggle(row.original.id)}
            className={`px-2 py-1 text-sm font-medium ${
              row.original.status
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            } rounded`}
          >
            {row.original.status ? "Active" : "Inactive"}
          </button>
        ),
      },
      {
        Header: "Action",
        accessor: "action",
        disableSortBy: true,
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => openModal(row.original, "view")}
              className="p-2 rounded-full text-green-500 hover:bg-green-600 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => openModal(row.original, "edit")}
              className="p-2 rounded-full text-[#5897F7] hover:bg-[#5897F7] hover:text-white transition-colors"
            >
              <Edit className="w-4 h-4" />
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

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
    gotoPage,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    pageOptions,
    pageCount,
    setPageSize,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable(
    {
      columns,
      data: fabrics,
      initialState: { pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const handleStatusToggle = async (id) => {
    try {
      setFabric((prevFabrics) => {
        const fabricToUpdate = prevFabrics.find((f) => f.id === id);

        if (!fabricToUpdate) {
          notifyOnFail("Fabric not found");
          return prevFabrics;
        }

        const newStatus = !fabricToUpdate.status;

        const updatedFabrics = prevFabrics.map((fabric) =>
          fabric.id === id ? { ...fabric, status: newStatus } : fabric
        );

        updateStatus(id, { status: newStatus })
          .then((response) => {
            if (response.status !== 1) {
              notifyOnFail("Unable to change the status");
              return prevFabrics;
            }
            notifyOnSuccess(
              `Status updated to ${newStatus ? "Active" : "Inactive"}`
            );
          })
          .catch((error) => {
            console.error("Error toggling status:", error);
            notifyOnFail("An error occurred while updating status");
            return prevFabrics;
          });

        return updatedFabrics;
      });
    } catch (error) {
      console.error("Error in status toggle:", error);
      notifyOnFail("An error occurred");
    }
  };

  const openModal = (fabric, mode) => {
    setSelectedFabric(fabric);
    setModalMode(mode);

    setFormData({
      type: fabric.type || "",
      name: fabric.name || "",
      image: fabric.image || "",
      slug: fabric.slug || "",
      status: fabric.status || "",
      categoryId: fabric.categoryId || "",
    });

    setShowModal(true);
  };

  const closeModal = async () => {
    setShowModal(false);
    await fetchAllFabric();
  };

  const openDeleteModal = (fabric) => {
    setSelectedFabric(fabric);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedFabric) return;
    setIsDeletingFabric(true);

    try {
      await deleteFabric(selectedFabric.id);
      notifyOnSuccess("Fabric deleted successfully");
      await fetchAllFabric();
    } catch (error) {
      console.error("Error deleting fabric:", error);
      notifyOnFail("Unable to delete the fabric");
    } finally {
      setIsDeletingFabric(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 font-satoshi">
          Fabric List
        </h2>
        <button
          className="bg-orange-500 text-white px-6 py-2 rounded text-lg transition-colors"
          onClick={() => navigate(`${config.VITE_BASE_ADMIN_URL}/fabrics/add`)}
        >
          + Add Fabric
        </button>
      </div>
      <div className="p-4 rounded-lg mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by type, name, category..."
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full bg-white rounded-lg pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-x-auto shadow-sm border border-gray-200">
        <table {...getTableProps()} className="min-w-full">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="bg-gray-100"
              >
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-4 py-4 text-left text-sm font-semibold text-gray-700"
                  >
                    <div className="flex items-center space-x-1">
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " ↓"
                            : " ↑"
                          : ""}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="px-4 py-2">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {[8, 10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className="p-2 disabled:opacity-50"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="p-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">
            Page <span className="font-medium">{pageIndex + 1}</span> of{" "}
            <span className="font-medium">{pageOptions.length}</span>
          </span>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="p-2 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className="p-2 disabled:opacity-50"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <FabricModal
        isOpen={showModal}
        onClose={closeModal}
        mode={modalMode}
        fabric={selectedFabric}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Fabric"
        message="Are you sure you want to delete this fabric? This action cannot be undone."
        isDeleting={isDeletingFabric}
      />
    </div>
  );
};

export default FabricList;
