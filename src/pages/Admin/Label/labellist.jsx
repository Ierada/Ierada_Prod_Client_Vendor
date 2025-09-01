import React, { useState, useEffect, useMemo } from "react";
import { useTable, usePagination, useSortBy, useGlobalFilter } from "react-table";
import { Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus } from "lucide-react";
import { notifyOnFail, notifyOnSuccess } from "../../../utils/notification/toast";
import LabelModal from "../../../components/Admin/modals/LabelModal";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import { getAllLabels, deleteLabel, updateLabel } from "../../../services/api.label";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";


const LabelList = () => {
  const navigate = useNavigate();
  const [labels, setLabels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingLabel, setIsDeletingLabel] = useState(false);
  

  const fetchLabels = async () => {
    try {
      const response = await getAllLabels();
      setLabels(response.data || []);
    } catch (error) {
      notifyOnFail("Failed to fetch labels.");
      setLabels([]);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "SL",
        accessor: (row, index) => index + 1,
        disableSortBy: true,
      },
      {
        Header: "Label Image",
        accessor: "image",
        Cell: ({ value }) => (
          <img src={value || "/default-label.png"} alt="Label" className="w-16 h-16 object-cover rounded" />
        ),
      },
      {
        Header: "Vendor ID",
        accessor: "Vendor_id",
        Cell: ({ value }) => <span className="text-sm">{value || "N/A"}</span>,
      },
      {
        Header: "Actions",
        accessor: "actions",
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
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable(
    {
      columns,
      data: labels || [],
      initialState: { pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

 

  const openModal = (label, mode) => {
    setSelectedLabel(label);
    setModalMode(mode);
    setShowModal(true);
  };

  const closeModal = async() => {
    setShowModal(false);
    setSelectedLabel(null);
    await fetchLabels();
  };

  const openDeleteModal = (label) => {
    setSelectedLabel(label);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedLabel) return;
    setIsDeletingLabel(true);
    try {
     const res =  await deleteLabel(selectedLabel.id);
     if(res.status === 1){
      notifyOnSuccess("Label deleted successfully.");
      setLabels((prev) => prev.filter((l) => l.id !== selectedLabel.id));
      setIsDeleteModalOpen(false);
      await fetchLabels();
     }
    } catch (error) {
      notifyOnFail("Failed to delete label.");
    } finally {
      setIsDeletingLabel(false);
      setIsDeleteModalOpen(false);
    }
  };

  

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800">All Labels</h2>
        <button
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-lg transition-colors"
          onClick={() => navigate(`${config.VITE_BASE_ADMIN_URL}/labels/add`)}
          >
          <Plus /> Add Label
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#F8F8F8] p-4 rounded-lg mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Vendor_id..."
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full bg-white rounded-lg pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-x-auto shadow-sm border border-gray-200">
        <table {...getTableProps()} className="w-full">
          <thead className="bg-[#F8F8F8]">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-4 py-4 text-left text-sm font-semibold text-gray-700 border-b"
                  >
                    <div className="flex items-center space-x-1">
                      {column.render("Header")}
                      <span>{column.isSorted ? (column.isSortedDesc ? " ↓" : " ↑") : ""}</span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="hover:bg-gray-100">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="px-4 py-4 text-sm text-gray-800 border-b">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {page.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600">No labels found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
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
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="p-2 disabled:opacity-50">
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button onClick={() => previousPage()} disabled={!canPreviousPage} className="p-2 disabled:opacity-50">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">
            Page <span className="font-medium">{pageIndex + 1}</span> of{" "}
            <span className="font-medium">{pageOptions.length}</span>
          </span>
          <button onClick={() => nextPage()} disabled={!canNextPage} className="p-2 disabled:opacity-50">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="p-2 disabled:opacity-50">
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <LabelModal
          isOpen={showModal}
          onClose={closeModal}
          mode={modalMode}
          label={selectedLabel}
         
        />
      )}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          isDeleting={isDeletingLabel}
          title="Delete Slider"
          message="Are you sure you want to delete this slider? This action cannot be undone."
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default LabelList;
