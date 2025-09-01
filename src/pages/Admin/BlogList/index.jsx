import React, { useEffect, useMemo, useState } from 'react';
import {
  useTable,
  usePagination,
  useSortBy,
  useGlobalFilter,
} from 'react-table';
import {
  Eye,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import {
  notifyOnFail,
  notifyOnSuccess,
} from '../../../utils/notification/toast';
import {
  getAll,
  deleteBlog,
  updateStatus,
} from '../../../services/api.blogs';
import BlogModal from '../../../components/Admin/modals/BlogModal';
import DeleteConfirmationModal from '../../../components/Vendor/Models/DeleteConfirmationModal';
import config from '../../../config/config';

const BlogList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingBlog, setIsDeletingBlog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    featured_image: '',
    meta_description: '',
    status: '',
  });

  const fetchAllBlogs = async () => {
    try {
      const response = await getAll();
      setBlogs(response.data || []);
    } catch (error) {
      notifyOnFail(error.message);
    }
  };
  useEffect(() => {
    fetchAllBlogs();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id',
      },
      {
        Header: 'Title',
        accessor: 'title',
      },
      {
        Header: 'Category',
        accessor: (row) => row.BlogCategory?.title || 'No Category',
      },
      {
        Header: 'Meta Title',
        accessor: 'meta_title',
      },
      {
        Header: 'Featured Image',
        accessor: 'featured_image',
        cell: ({ value }) => (
          <img
            src={value}
            alt="featured image"
            className="w-16 h-16 object-cover rounded"
          />
        ),
      },
      {
        Header: ' Meta Description',
        accessor: 'meta_description',
      },

      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ row }) => (
          <button
            onClick={() => handleStatusToggle(row.original.id)}
            className={`px-2 py-1 text-sm font-medium ${
              row.original.status === 'published'
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            } rounded`}
          >
            {row.original.status === 'published' ? 'Active' : 'Inactive'}
          </button>
        ),
      },
      {
        Header: 'Action',
        accessor: 'action',
        disableSortBy: true,
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() =>
                navigate(
                  `${config.VITE_BASE_ADMIN_URL}/blogs/${row.original.slug}`,
                )
              }
              className="p-2 rounded-full text-green-500 hover:bg-green-600 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                navigate(`${config.VITE_BASE_ADMIN_URL}/blogs/edit/${row.original.id}`)
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
    [],
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
      data: blogs || [],
      initialState: { pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
  );

  const handleStatusToggle = async (id) => {
    try {
      const blog = blogs.find((b) => b.id === id);
      const updatedStatus = blog.status === 'active' ? 'inactive' : 'active';
      const response = await updateStatus(id, { status: updatedStatus });
      if (response.status === 1) {
        notifyOnSuccess(`Status updated to ${updatedStatus}`);
        fetchAllBlogs();
      } else {
        notifyOnFail(response.message || 'Failed to update the status.');
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      notifyOnFail(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openModal = (blog, mode) => {
    setSelectedBlog(blog);
    setModalMode(mode);
    setFormData({
      title: blog?.title || '',
      category: blog?.category || '',
      content: blog?.content || '',
      featured_image: blog?.featured_image || '',
      meta_description: blog?.meta_description || '',
      status: blog?.status || '',
    });
    setShowModal(true);
  };
  const CloseModal = async () => {
    setShowModal(false);
    await fetchAllBlogs();
  };

  const openDeleteModal = (blog) => {
    setSelectedBlog(blog);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedBlog) return;
    setIsDeleteModalOpen(false);
    try {
      setIsDeletingBlog(true);
      await deleteBlog(selectedBlog.id);
      setIsDeletingBlog(false);
      setIsDeleteModalOpen(false);
      await fetchAllBlogs();
    } catch (error) {
      notifyOnFail(error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 font-satoshi">
          Blog List
        </h2>
        <button
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 text-lg transition-colors"
          onClick={() => navigate(`${config.VITE_BASE_ADMIN_URL}/blogs/add`)}
        >
          + Add Blog
        </button>
      </div>

      <div className=" p-4 rounded-lg mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by coupon, type..."
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full bg-white rounded-lg pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* <>
        <input
          type="text"
          className="mb-4 p-2 border border-gray-300 rounded"
          placeholder="Search..."
          onChange={(e) => setGlobalFilter(e.target.value || undefined)}
        /> */}
      <div className="bg-white rounded-lg overflow-x-auto shadow-sm border border-gray-200">
        <table {...getTableProps()} className="w-full">
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
                      {column.render('Header')}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' ↓'
                            : ' ↑'
                          : ''}
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
                    <td {...cell.getCellProps()} className=" px-4 py-2">
                      {cell.column.id.includes('date')
                        ? new Date(cell.value).toLocaleDateString()
                        : cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
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
            Page <span className="font-medium">{pageIndex + 1}</span> of{' '}
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

      <BlogModal
        isOpen={showModal}
        onClose={CloseModal}
        mode={modalMode}
        blog={selectedBlog}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this blog? This action cannot be undone."
        isDeleting={isDeletingBlog}
      />
    </div>
  );
};

export default BlogList;
