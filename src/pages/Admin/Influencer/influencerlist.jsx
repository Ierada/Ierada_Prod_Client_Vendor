import React, { useState, useMemo, useEffect } from "react";
import { useTable, usePagination, useSortBy, useGlobalFilter } from "react-table";
import { Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus } from "lucide-react";
import { MdToggleOff, MdToggleOn } from "react-icons/md";
import InfluencerModal from "../../../components/Admin/Modals/InfluencerModal";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import { notifyOnFail, notifyOnSuccess } from "../../../utils/notification/toast";
import {getAllInfluencers, deleteInfluencer } from "../../../services/api.influencer";
import { useNavigate } from "react-router-dom";

import config from "../../../config/config";


const InfluencerList = () => {
  const navigate = useNavigate();

  const [influencer, setInfluencer] = useState([])
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingInfluencer, setIsDeletingInfluencer] = useState(false);

  const fetchInfluencers = async () => {
  try {
    const response = await getAllInfluencers();
    setInfluencer(response.data || [])
    console.log(response, "Influencer");
    
  } catch (error) {
    notifyOnFail("Failed to fetch banners.");
      setBanners([]);
  }
  };

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "SL",
        accessor: (row, index) => index + 1,
        disableSortBy: true,
      },
      {
        Header: "Influencer Details",
        accessor: "first_name",
        Cell: ({ row }) => (
          <div className="flex items-center space-x-4">
            <img
              src={row.original.avatar || "/default-avatar.png"}
              alt={row.original.first_name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold text-[15px] text-[#2D3954]">
                {row.original.first_name} {row.original.last_name}
              </h3>
              <p className="text-sm text-gray-600">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        Header: "Phone",
        accessor: "phone",
        Cell: ({ value }) => <span className="text-sm">{value}</span>,
      },
      {
        Header: "Followers",
        accessor: "followers",
        Cell: ({ value }) => <span className="text-sm">{value}</span>,
      },
      {
        Header: "Popular",
        accessor: "is_popular",
        Cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <button onClick={() => handleTogglePopularity(row.original.id)} className="focus:outline-none">
              {row.original.is_popular ? (
                <MdToggleOn className="text-green-600 w-8 h-8" />
              ) : (
                <MdToggleOff className="text-gray-400 w-8 h-8" />
              )}
            </button>
            <span className={`text-sm ${row.original.is_popular ? "text-green-600" : "text-gray-500"}`}>
              {row.original.is_popular ? "Yes" : "No"}
            </span>
          </div>
        ),
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
      data: influencer,
      initialState: { pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const handleTogglePopularity = async (id) => {
    const influencer = influencer.find((d) => d.id === id);
    const newStatus = !influencer.is_popular;

    


    try {
      // Implement API call to toggle popularity
      notifyOnSuccess(`Popularity updated successfully.`);
      await fetchInfluencers();
    } catch (error) {
      notifyOnFail("Failed to update popularity status.");
    }
  };

 

  const openModal = (influencer, mode) => {
    setSelectedInfluencer(influencer);
    setModalMode(mode);
    setShowModal(true);
  };

  const closeModal = async() => {
    setShowModal(false);
    setSelectedInfluencer(null);
    await fetchInfluencers();
  };

  

  const openDeleteModal = (influencer) => {
    setSelectedInfluencer(influencer

    );
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedInfluencer) return;
    setIsDeletingInfluencer(true);
    try {
      const res = await deleteInfluencer(selectedInfluencer.id);
      if (res.status === 1) {
        notifyOnSuccess("Influencer deleted successfully.")
        setInfluencer((prev)=> prev.filter((b) => b.id !== selectedInfluencer));
        setIsDeleteModalOpen(false);
        await fetchInfluencers();
      }
    } catch (error) {
      notifyOnFail("Failed to delete Influencer.");
    } finally {
      setIsDeletingInfluencer(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 font-satoshi">All Influencers</h2>
        <button
          className=" flex items-center bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-lg transition-colors"
          onClick={() => navigate(`${config.VITE_BASE_ADMIN_URL}/influencers/add`)}
          >
          <Plus/> Add Influencer
        </button>
      </div>

      <div className="bg-[#F8F8F8] p-4 rounded-lg mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email..."
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full bg-white rounded-lg pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

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
            <p className="text-gray-600">No Influencers found.</p>
          </div>
        )}
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
        <InfluencerModal
          isOpen={showModal}
          onClose={closeModal}
          mode={modalMode}
          influencer={selectedInfluencer}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          isDeleting={isDeletingInfluencer}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default InfluencerList;
