import React, { useState, useEffect, useMemo } from "react";
import { useTable, usePagination, useGlobalFilter } from "react-table";
import {
  getAllSizes,
  addSize,
  updateSize,
  deleteSize,
} from "../../../services/api.size";
import {
  getAllColors,
  addColor,
  updateColor,
  deleteColor,
} from "../../../services/api.color";
import {
  getCategories,
  getSubCategories,
  getInnerSubCategories,
} from "../../../services/api.category";
import { notifyOnFail } from "../../../utils/notification/toast";

export default function SizeColorManagement() {
  // State variables
  const [activeTab, setActiveTab] = useState("sizes");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [innerSubCategories, setInnerSubCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [currentSize, setCurrentSize] = useState({
    id: null,
    name: "",
    categoryIds: [],
    subCategoryIds: [],
    innerSubCategoryIds: [],
    selectedLevel: "category",
  });
  const [currentColor, setCurrentColor] = useState({
    id: null,
    name: "",
    code: "#000000",
  });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch data on component mount and tab change
  useEffect(() => {
    if (activeTab === "sizes") {
      fetchSizes();
      fetchCategories();
      fetchSubCategories();
      fetchInnerSubCategories();
    } else {
      fetchColors();
    }
  }, [activeTab]);

  // Fetch sizes
  const fetchSizes = async () => {
    try {
      setIsLoading(true);
      const response = await getAllSizes();
      if (response?.status === 1 && response?.data) {
        setSizes(response.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching sizes:", error);
      setIsLoading(false);
      notifyOnFail("Failed to fetch sizes");
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response?.status === 1 && response?.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      notifyOnFail("Failed to fetch categories");
    }
  };

  // Fetch subcategories
  const fetchSubCategories = async () => {
    try {
      const response = await getSubCategories();
      if (response?.status === 1 && response?.data) {
        setSubCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      notifyOnFail("Failed to fetch subcategories");
    }
  };

  // Fetch inner subcategories
  const fetchInnerSubCategories = async () => {
    try {
      const response = await getInnerSubCategories();
      if (response?.status === 1 && response?.data) {
        setInnerSubCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching inner subcategories:", error);
      notifyOnFail("Failed to fetch inner subcategories");
    }
  };

  // Fetch colors
  const fetchColors = async () => {
    try {
      setIsLoading(true);
      const response = await getAllColors();
      if (response?.status === 1 && response?.data) {
        setColors(response.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching colors:", error);
      setIsLoading(false);
      notifyOnFail("Failed to fetch colors");
    }
  };

  // Size modal handlers
  const openAddSizeModal = () => {
    setCurrentSize({
      id: null,
      name: "",
      categoryIds: [],
      subCategoryIds: [],
      innerSubCategoryIds: [],
      selectedLevel: "category",
    });
    setIsEditing(false);
    setShowSizeModal(true);
  };

  const openEditSizeModal = (size) => {
    setCurrentSize({
      id: size.id,
      name: size.name,
      categoryIds: size.cat_id ? [size.cat_id] : [],
      subCategoryIds: size.sub_cat_id ? [size.sub_cat_id] : [],
      innerSubCategoryIds: size.inner_sub_cat_id ? [size.inner_sub_cat_id] : [],
      selectedLevel: size.inner_sub_cat_id
        ? "innerSubCategory"
        : size.sub_cat_id
        ? "subCategory"
        : "category",
    });
    setIsEditing(true);
    setShowSizeModal(true);
  };

  // Color modal handlers
  const openAddColorModal = () => {
    setCurrentColor({ id: null, name: "", code: "#000000" });
    setIsEditing(false);
    setShowColorModal(true);
  };

  const openEditColorModal = (color) => {
    setCurrentColor({ ...color });
    setIsEditing(true);
    setShowColorModal(true);
  };

  // Delete confirmation handlers
  const openDeleteConfirm = (item, type) => {
    setItemToDelete({ ...item, type });
    setShowDeleteConfirm(true);
  };

  // Form handlers for Size
  const handleSizeChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setCurrentSize((prev) => {
        const newIds = checked
          ? [...prev[name], parseInt(value)]
          : prev[name].filter((id) => id !== parseInt(value));
        return { ...prev, [name]: newIds };
      });
    } else if (name === "selectedLevel") {
      setCurrentSize((prev) => ({
        ...prev,
        selectedLevel: value,
        categoryIds: [],
        subCategoryIds: [],
        innerSubCategoryIds: [],
      }));
    } else {
      setCurrentSize((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Form handlers for Color
  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setCurrentColor({ ...currentColor, [name]: value });
  };

  // Submit handlers
  const handleSizeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateSize(currentSize.id, {
          name: currentSize.name,
          categoryId:
            currentSize.selectedLevel === "category" &&
            currentSize.categoryIds[0]
              ? currentSize.categoryIds[0]
              : null,
          subCategoryId:
            currentSize.selectedLevel === "subCategory" &&
            currentSize.subCategoryIds[0]
              ? currentSize.subCategoryIds[0]
              : null,
          innerSubCategoryId:
            currentSize.selectedLevel === "innerSubCategory" &&
            currentSize.innerSubCategoryIds[0]
              ? currentSize.innerSubCategoryIds[0]
              : null,
        });
      } else {
        // Prepare combinations for bulk creation
        const sizeNames = currentSize.name
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean);

        const combinations = [];
        sizeNames.forEach((name) => {
          if (currentSize.selectedLevel === "category") {
            if (currentSize.categoryIds.length === 0) {
              combinations.push({ name });
            } else {
              currentSize.categoryIds.forEach((catId) => {
                combinations.push({ name, categoryId: catId });
              });
            }
          } else if (currentSize.selectedLevel === "subCategory") {
            if (currentSize.subCategoryIds.length === 0) {
              combinations.push({ name });
            } else {
              currentSize.subCategoryIds.forEach((subCatId) => {
                const subCat = subCategories.find((sc) => sc.id === subCatId);
                combinations.push({
                  name,
                  categoryId: subCat?.cat_id || null,
                  subCategoryId: subCatId,
                });
              });
            }
          } else if (currentSize.selectedLevel === "innerSubCategory") {
            if (currentSize.innerSubCategoryIds.length === 0) {
              combinations.push({ name });
            } else {
              currentSize.innerSubCategoryIds.forEach((innerSubCatId) => {
                const innerSubCat = innerSubCategories.find(
                  (isc) => isc.id === innerSubCatId
                );
                const subCat = subCategories.find(
                  (sc) => sc.id === innerSubCat?.sub_cat_id
                );
                combinations.push({
                  name,
                  categoryId: subCat?.cat_id || null,
                  subCategoryId: innerSubCat?.sub_cat_id || null,
                  innerSubCategoryId: innerSubCatId,
                });
              });
            }
          } else {
            combinations.push({ name });
          }
        });

        await addSize(combinations);
      }
      setShowSizeModal(false);
      fetchSizes();
    } catch (error) {
      console.error("Error submitting size:", error);
      notifyOnFail("Failed to submit size");
    }
  };

  const handleColorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateColor(currentColor.id, {
          name: currentColor.name,
          code: currentColor.code,
        });
      } else {
        await addColor({
          name: currentColor.name,
          code: currentColor.code,
        });
      }
      setShowColorModal(false);
      fetchColors();
    } catch (error) {
      console.error("Error submitting color:", error);
      notifyOnFail("Failed to submit color");
    }
  };

  // Delete handler
  const handleDelete = async () => {
    try {
      if (itemToDelete) {
        if (itemToDelete.type === "size") {
          await deleteSize(itemToDelete.id);
          fetchSizes();
        } else if (itemToDelete.type === "color") {
          await deleteColor(itemToDelete.id);
          fetchColors();
        }
        setShowDeleteConfirm(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      notifyOnFail("Failed to delete item");
    }
  };

  // Filter subcategories based on selected categories
  const filteredSubCategories = useMemo(() => {
    return subCategories;
  }, [subCategories]);

  // Filter inner subcategories based on selected subcategories
  const filteredInnerSubCategories = useMemo(() => {
    return innerSubCategories;
  }, [innerSubCategories]);

  // Define columns for react-table (Sizes)
  const sizeColumns = useMemo(
    () => [
      {
        Header: "#",
        accessor: (row, index) => index + 1,
        disableFilters: true,
        width: "60px",
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Category",
        accessor: "category.title",
        Cell: ({ value }) => value || "N/A",
      },
      {
        Header: "SubCategory",
        accessor: "subCategory.title",
        Cell: ({ value }) => value || "N/A",
      },
      {
        Header: "Inner SubCategory",
        accessor: "innerSubCategory.title",
        Cell: ({ value }) => value || "N/A",
      },
      {
        Header: "Actions",
        accessor: "actions",
        disableFilters: true,
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => openEditSizeModal(row.original)}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => openDeleteConfirm(row.original, "size")}
              className="text-red-600 hover:text-red-800 hover:underline"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Define columns for react-table (Colors)
  const colorColumns = useMemo(
    () => [
      {
        Header: "#",
        accessor: (row, index) => index + 1,
        disableFilters: true,
        width: "60px",
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Color",
        accessor: "code",
        Cell: ({ value }) => (
          <div className="flex items-center">
            <div
              className="w-6 h-6 mr-2 rounded-full border border-gray-300"
              style={{ backgroundColor: value }}
            ></div>
            <span>{value}</span>
          </div>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        disableFilters: true,
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => openEditColorModal(row.original)}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => openDeleteConfirm(row.original, "color")}
              className="text-red-600 hover:text-red-800 hover:underline"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Setup react-table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
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
      columns: activeTab === "sizes" ? sizeColumns : colorColumns,
      data: activeTab === "sizes" ? sizes : colors,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    usePagination
  );

  // Search handler
  const handleSearchChange = (e) => {
    setGlobalFilter(e.target.value || undefined);
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-lg md:text-2xl font-bold text-[#333843] mb-4">
        Size & Color Management
      </h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === "sizes"
                  ? "text-[#F47954] border-b-2 border-[#F47954]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("sizes")}
            >
              Sizes
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === "colors"
                  ? "text-[#F47954] border-b-2 border-[#F47954]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("colors")}
            >
              Colors
            </button>
          </li>
        </ul>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-gray-600">
            Total {activeTab === "sizes" ? "Sizes" : "Colors"}:{" "}
            <span className="font-semibold">
              {activeTab === "sizes" ? sizes.length : colors.length}
            </span>
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search by ${
                activeTab === "sizes" ? "size name" : "color name"
              }...`}
              value={globalFilter || ""}
              onChange={handleSearchChange}
              className="w-full md:w-64 px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <button
            onClick={
              activeTab === "sizes" ? openAddSizeModal : openAddColorModal
            }
            className="px-4 py-2 bg-[#F47954] text-white rounded-md hover:bg-[#e46944] flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Add {activeTab === "sizes" ? "Size" : "Color"}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-[#F47954] border-r-[#F47954] border-b-transparent border-l-transparent"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        ) : (activeTab === "sizes" && sizes.length === 0) ||
          (activeTab === "colors" && colors.length === 0) ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              No {activeTab === "sizes" ? "sizes" : "colors"} found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table {...getTableProps()} className="min-w-full bg-white">
              <thead className="bg-gray-100">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps()}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.render("Header")}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody
                {...getTableBodyProps()}
                className="divide-y divide-gray-200"
              >
                {page.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        activeTab === "sizes"
                          ? sizeColumns.length
                          : colorColumns.length
                      }
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No matching records found
                    </td>
                  </tr>
                ) : (
                  page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} className="hover:bg-gray-50">
                        {row.cells.map((cell) => (
                          <td
                            {...cell.getCellProps()}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading &&
        ((activeTab === "sizes" && sizes.length > 0) ||
          (activeTab === "colors" && colors.length > 0)) && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="mb-4 md:mb-0">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#F47954]"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
              <span className="ml-3 text-sm text-gray-600">
                Page {pageIndex + 1} of {pageOptions.length}
              </span>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className={`px-3 py-1 text-sm border rounded-md ${
                  !canPreviousPage
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {"<<"}
              </button>
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className={`px-3 py-1 text-sm border rounded-md ${
                  !canPreviousPage
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {"<"}
              </button>
              {Array.from(
                { length: Math.min(5, pageOptions.length) },
                (_, i) => {
                  let pageNum;
                  if (pageOptions.length <= 5) {
                    pageNum = i;
                  } else if (pageIndex <= 2) {
                    pageNum = i;
                  } else if (pageIndex >= pageOptions.length - 3) {
                    pageNum = pageOptions.length - 5 + i;
                  } else {
                    pageNum = pageIndex - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => gotoPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        pageIndex === pageNum
                          ? "bg-[#F47954] text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                }
              )}
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className={`px-3 py-1 text-sm border rounded-md ${
                  !canNextPage
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {">"}
              </button>
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                className={`px-3 py-1 text-sm border rounded-md ${
                  !canNextPage
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {">>"}
              </button>
            </div>
          </div>
        )}

      {/* Size Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Size" : "Add New Size"}
            </h3>
            <form onSubmit={handleSizeSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Size Name(s)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentSize.name}
                  onChange={handleSizeChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
                  placeholder="e.g. S, M, L, XL, 42, 44 (comma-separated for multiple sizes)"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="selectedLevel"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Category Level
                </label>
                <select
                  id="selectedLevel"
                  name="selectedLevel"
                  value={currentSize.selectedLevel}
                  onChange={handleSizeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
                >
                  <option value="category">Categories</option>
                  <option value="subCategory">SubCategories</option>
                  <option value="innerSubCategory">Inner SubCategories</option>
                </select>
              </div>
              {currentSize.selectedLevel === "category" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories (Optional)
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`category-${cat.id}`}
                          name="categoryIds"
                          value={cat.id}
                          checked={currentSize.categoryIds.includes(cat.id)}
                          onChange={handleSizeChange}
                          className="mr-2 h-4 w-4 text-[#F47954] focus:ring-[#F47954] border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`category-${cat.id}`}
                          className="text-sm text-gray-700"
                        >
                          {cat.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {currentSize.selectedLevel === "subCategory" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SubCategories (Optional)
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {filteredSubCategories.map((subCat) => (
                      <div key={subCat.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`subCategory-${subCat.id}`}
                          name="subCategoryIds"
                          value={subCat.id}
                          checked={currentSize.subCategoryIds.includes(
                            subCat.id
                          )}
                          onChange={handleSizeChange}
                          className="mr-2 h-4 w-4 text-[#F47954] focus:ring-[#F47954] border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`subCategory-${subCat.id}`}
                          className="text-sm text-gray-700"
                        >
                          {subCat.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {currentSize.selectedLevel === "innerSubCategory" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inner SubCategories (Optional)
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {filteredInnerSubCategories.map((innerSubCat) => (
                      <div
                        key={innerSubCat.id}
                        className="flex items-center mb-2"
                      >
                        <input
                          type="checkbox"
                          id={`innerSubCategory-${innerSubCat.id}`}
                          name="innerSubCategoryIds"
                          value={innerSubCat.id}
                          checked={currentSize.innerSubCategoryIds.includes(
                            innerSubCat.id
                          )}
                          onChange={handleSizeChange}
                          className="mr-2 h-4 w-4 text-[#F47954] focus:ring-[#F47954] border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`innerSubCategory-${innerSubCat.id}`}
                          className="text-sm text-gray-700"
                        >
                          {innerSubCat.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSizeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F47954] text-white rounded-md hover:bg-[#e46944]"
                >
                  {isEditing ? "Update" : "Add"} Size
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Color Modal */}
      {showColorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Color" : "Add New Color"}
            </h3>
            <form onSubmit={handleColorSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Color Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentColor.name}
                  onChange={handleColorChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
                  placeholder="Add color name."
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Color Code
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="code"
                    name="code"
                    value={currentColor.code}
                    onChange={handleColorChange}
                    className="p-1 border border-gray-300 rounded h-10 w-10"
                  />
                  <input
                    type="text"
                    name="code"
                    value={currentColor.code}
                    onChange={handleColorChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowColorModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F47954] text-white rounded-md hover:bg-[#e46944]"
                >
                  {isEditing ? "Update" : "Add"} Color
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete the{" "}
              {itemToDelete?.type === "size" ? "size" : "color"} "
              {itemToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
