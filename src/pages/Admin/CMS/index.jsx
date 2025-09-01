import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  getPolicy,
  updatePolicy,
  getTermConditions,
  updateTermConditions,
} from "../../../services/api.page";
import { notifyOnFail } from "../../../utils/notification/toast";

export default function CMS() {
  const [activeTab, setActiveTab] = useState("Pages");
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    meta_title: "",
    meta_description: "",
    status: "published",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // System pages
  const systemPages = ["Privacy Policy", "Terms & Condition"];

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const response = await getAllPages();
      if (response?.status === 1 && response?.data) {
        setPages(response.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching pages:", error);
      setIsLoading(false);
      notifyOnFail("Failed to fetch pages");
    }
  };

  const fetchSystemPageContent = async () => {
    try {
      setIsLoading(true);
      let res;

      if (activeTab === "Privacy Policy") {
        res = await getPolicy();
        if (res?.data) {
          setFormData({
            title: "Privacy Policy",
            content: res.data,
            meta_title: "Privacy Policy",
            meta_description: "Our privacy policy",
          });
          setIsLoading(false);
          return;
        }
      } else if (activeTab === "Terms & Condition") {
        res = await getTermConditions();
        if (res?.data) {
          setFormData({
            title: "Terms & Condition",
            content: res.data,
            meta_title: "Terms & Condition",
            meta_description: "Our terms and conditions",
          });
          setIsLoading(false);
          return;
        }
      }

      setFormData({
        title: activeTab,
        content: "No data found",
        meta_title: "",
        meta_description: "",
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching system page content:", error);
      setIsLoading(false);
      notifyOnFail("Failed to fetch content");
    }
  };

  const fetchPageById = async (id) => {
    try {
      setIsLoading(true);
      const response = await getPageById(id);
      if (response?.status === 1 && response?.data) {
        setCurrentPage(response.data);
        setFormData({
          title: response.data.title,
          content: response.data.content || "",
          meta_title: response.data.meta_title || "",
          meta_description: response.data.meta_description || "",
          status: response.data.status,
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching page:", error);
      setIsLoading(false);
      notifyOnFail("Failed to fetch page");
    }
  };

  useEffect(() => {
    if (activeTab === "Pages") {
      fetchPages();
      setCurrentPage(null);
      setIsEditing(false);
      setIsCreating(false);
    } else if (systemPages.includes(activeTab)) {
      fetchSystemPageContent();
      setCurrentPage(null);
      setIsEditing(false);
      setIsCreating(false);
    }
  }, [activeTab]);

  const handlePageClick = async (page) => {
    setCurrentPage(page);
    await fetchPageById(page.id);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreateNewPage = () => {
    setCurrentPage(null);
    setFormData({
      title: "",
      content: "",
      meta_title: "",
      meta_description: "",
      status: "published",
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (activeTab === "Privacy Policy") {
        const res = await updatePolicy(formData.content);
      } else if (activeTab === "Terms & Condition") {
        await updateTermConditions(formData.content);
      } else if (isCreating) {
        if (!formData.title) {
          notifyOnFail("Title is required");
          return;
        }
        const res = await createPage(formData);
        if (res.status === 1) {
          fetchPages();
          setIsCreating(false);
        }
      } else if (currentPage) {
        if (!formData.title) {
          notifyOnFail("Title is required");
          return;
        }
        const res = await updatePage(currentPage.id, formData);
        if (res.status === 1) {
          fetchPageById(currentPage.id);
          fetchPages();
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error("Error saving data:", error);
      notifyOnFail(
        "Error saving data: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (isCreating) {
      setIsCreating(false);
    } else if (isEditing) {
      if (currentPage) {
        fetchPageById(currentPage.id);
      }
      setIsEditing(false);
    } else if (systemPages.includes(activeTab)) {
      fetchSystemPageContent();
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (currentPage) {
        const res = await deletePage(currentPage.id);
        if (res.status === 1) {
          fetchPages();
          setCurrentPage(null);
          setShowDeleteConfirm(false);
        }
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      notifyOnFail(
        "Error deleting page: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleBackToList = () => {
    setCurrentPage(null);
    setIsCreating(false);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-lg md:text-2xl font-bold text-[#333843] mb-4">
        CMS Management
      </h1>

      {/* Pages List View */}
      {!currentPage && !isCreating && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Pages</h2>
            <button
              onClick={handleCreateNewPage}
              className="bg-[#F47954] border rounded-lg text-sm text-white px-4 py-2 font-medium"
            >
              Create New Page
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System Page
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pages.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-4 text-center text-sm text-gray-500"
                      >
                        No pages found. Create your first page!
                      </td>
                    </tr>
                  ) : (
                    pages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{page.title}</td>
                        <td className="px-4 py-2 text-sm">{page.slug}</td>
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              page.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {page.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {page.is_system_page ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() => handlePageClick(page)}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Single Page Edit/View */}
      {(currentPage || isCreating) && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isCreating
                ? "Create New Page"
                : `Edit Page: ${currentPage?.title}`}
            </h2>
            <div className="flex gap-2">
              {!isEditing && !isCreating && (
                <>
                  <button
                    onClick={handleEdit}
                    className="bg-blue-500 border rounded-lg text-sm text-white px-4 py-2 font-medium"
                  >
                    Edit
                  </button>
                  {!currentPage?.is_system_page && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-500 border rounded-lg text-sm text-white px-4 py-2 font-medium"
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
              <button
                onClick={handleBackToList}
                className="bg-gray-500 border rounded-lg text-sm text-white px-4 py-2 font-medium"
              >
                Back to List
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="title"
                  >
                    Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={!isEditing && !isCreating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="status"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={!isEditing && !isCreating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="meta_title"
                  >
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    disabled={!isEditing && !isCreating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="meta_description"
                  >
                    Meta Description
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    disabled={!isEditing && !isCreating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47954]"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                {isEditing || isCreating ? (
                  <CKEditor
                    editor={ClassicEditor}
                    data={formData.content}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setFormData((prev) => ({
                        ...prev,
                        content: data,
                      }));
                    }}
                    config={{
                      placeholder: "Enter content...",
                    }}
                  />
                ) : (
                  <div
                    className="w-full p-4 border border-gray-300 rounded-md min-h-[200px] bg-gray-50"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                )}
              </div>

              {/* Action Buttons */}
              {(isEditing || isCreating) && (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancel}
                    className="text-[#F47954] border border-[#F47954] rounded-lg text-sm px-10 py-2 font-medium hover:bg-[#FFF1ED]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-[#F47954] border rounded-lg text-sm text-white px-10 py-2 font-medium hover:bg-[#E56944]"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                <p className="mb-6">
                  Are you sure you want to delete "{currentPage?.title}"? This
                  action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
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
      )}

      <style jsx global>{`
        .ck-editor__editable {
          min-height: 250px;
        }
      `}</style>
    </div>
  );
}
