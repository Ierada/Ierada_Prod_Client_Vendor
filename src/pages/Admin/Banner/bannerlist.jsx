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
  Eye,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  notifyOnFail,
  notifyOnSuccess,
} from "../../../utils/notification/toast";
import BannerModal from "../../../components/Admin/modals/BannerModal";
import DeleteConfirmationModal from "../../../components/Vendor/Models/DeleteConfirmationModal";
import { getAllBanners, deleteBanner } from "../../../services/api.banner";
import {
  getCategories,
  getSubCategories,
  getInnerSubCategories,
} from "../../../services/api.category"; // Import category API
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";

const BannerList = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [innerSubCategories, setInnerSubCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [modalMode, setModalMode] = useState("view");
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingBanner, setIsDeletingBanner] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      const formattedCategory = res.data?.map((data) => ({
        id: data.id,
        name: data.title,
      }));
      setCategories(formattedCategory);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await getSubCategories();
      const formattedSubCategories = res.data?.map((data) => ({
        id: data.id,
        name: data.title,
        parentId: data.cat_id,
      }));
      setSubCategories(formattedSubCategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchInnerSubCategories = async () => {
    try {
      const res = await getInnerSubCategories();
      const formattedInnerSubCategories = res.data?.map((data) => ({
        id: data.id,
        name: data.title,
        parentId: data.subcat_id,
      }));
      setInnerSubCategories(formattedInnerSubCategories);
    } catch (error) {
      console.error("Error fetching inner subcategories:", error);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await getAllBanners();
      setBanners(response.data || []);
    } catch (error) {
      notifyOnFail("Failed to fetch banners.");
      setBanners([]);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchCategories();
    fetchSubCategories();
    fetchInnerSubCategories();
  }, []);

  const columns = useMemo(
    () => [
      {
        header: "SL",
        cell: ({ row }) => row.index + 1,
        disableSortBy: true,
      },
      {
        header: "Banner Details",
        accessorKey: "title",
        cell: ({ row }) => (
          <div className="flex items-center space-x-4">
            {row.original.file_type === "image" ? (
              <img
                src={row.original.file_url || "/default-banner.png"}
                alt={row.original.title}
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <video
                src={row.original.file_url || "/default-banner.png"}
                controls
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div>
              <h3 className="font-semibold text-[15px] text-[#2D3954]">
                {row.original.title}
              </h3>
              <p className="text-sm text-gray-600">{row.original.positions}</p>
              {row.original.cat_id && (
                <p className="text-sm text-gray-500">
                  Category:{" "}
                  {categories.find((cat) => cat.id === row.original.cat_id)
                    ?.name || "N/A"}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        header: "Link",
        accessorKey: "link",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("link") || "N/A"}</span>
        ),
      },
      {
        header: "Actions",
        accessorKey: "actions",
        disableSortBy: true,
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => openModal(row.original, "view")}
              className="p-2 rounded-full text-green-500 hover:bg-green-600 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                navigate(
                  `${config.VITE_BASE_ADMIN_URL}/banners/edit/${row.original.id}`
                )
              }
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
    [categories]
  );

  const table = useReactTable({
    data: banners || [],
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

  const openModal = (banner, mode) => {
    setSelectedBanner(banner);
    setModalMode(mode);
    setShowModal(true);
  };

  const closeModal = async () => {
    setShowModal(false);
    await fetchBanners();
  };

  const openDeleteModal = (banner) => {
    setSelectedBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedBanner) return;
    setIsDeletingBanner(true);
    try {
      const res = await deleteBanner(selectedBanner.id);
      if (res.status === 1) {
        notifyOnSuccess("Banner deleted successfully.");
        setBanners((prev) => prev.filter((b) => b.id !== selectedBanner.id));
        setIsDeleteModalOpen(false);
        await fetchBanners();
      }
    } catch (error) {
      notifyOnFail("Failed to delete banner.");
    } finally {
      setIsDeletingBanner(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 font-satoshi">
          All Banners
        </h2>
        <button
          className="flex items-center gap-2 bg-[#F47954] text-white px-4 py-2 rounded  text-lg transition-colors"
          onClick={() => navigate(`${config.VITE_BASE_ADMIN_URL}/banners/add`)}
        >
          <Plus /> Add Banner
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#F8F8F8] p-4 rounded-lg mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title, position..."
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full bg-white rounded-lg pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Table */}

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

      {showModal && (
        <BannerModal
          isOpen={showModal}
          onClose={closeModal}
          mode={modalMode}
          banner={selectedBanner}
          categories={categories}
          subcategories={subCategories}
          innerSubCategories={innerSubCategories}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          isDeleting={isDeletingBanner}
          title="Delete Banner"
          message="Are you sure you want to delete this banner? This action cannot be undone."
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default BannerList;
