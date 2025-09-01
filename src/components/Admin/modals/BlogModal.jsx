import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  updateBlog,
  getAllBlogCategories,
  getBlogBySlug,
} from "../../../services/api.blogs";

const BlogModal = ({ isOpen, onClose, mode, blog, categories }) => {
  const navigate = useNavigate();
  const { blogId } = useParams();

  // const [formData, setFormData] = useState({
  //   title: '',
  //   content: '',
  //   featured_image: null,
  //   category: '',
  //   meta_title: '',
  //   meta_description: '',

  //   status: 'draft',
  // });

  // const [imageFile, setImageFile] = useState({
  //   file: null,
  //   preview: null,
  // });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const [imageFile, setImageFile] = useState({
    file: null,
    preview: null,
  });

  // Fetch categories on component mount
  useEffect(() => {
    if (blog && mode !== "add") {
      // Populate form with blog data
      reset({
        title: blog.title || "",
        category: blog.category || "",
        metaTitle: blog.meta_title || "",
        metaDescription: blog.meta_description || "",
        status: blog.status || "draft",
      });

      setImageFile({
        file: null,
        preview: blog.featured_image || null,
      });
    }
  }, [blog, mode, reset]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      setImageFile({
        file: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const removeImage = () => {
    setImageFile({
      file: null,
      preview: null,
    });
  };

  const onSubmit = async (data) => {
    try {
      const formDataToSend = new FormData();
      Object.keys(data).forEach((key) => {
        formDataToSend.append(key, data[key]);
      });
      if (imageFile.file) {
        formDataToSend.append("featured_image", imageFile.file);
      }

      await updateBlog(blogId, formDataToSend);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl text-black font-semibold mb-6">
          {mode === "view"
            ? "View Blog"
            : mode === "edit"
            ? "Edit Blog"
            : "Add Blog"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            {mode === "view" ? (
              <p className="mt-1 text-sm text-gray-600">{blog.title}</p>
            ) : (
              <input
                type="text"
                id="title"
                className={`mt-1 block w-full rounded-md border  px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black`}
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters",
                  },
                })}
              />
            )}
          </div>

          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            {mode === "view" ? (
              <p className="mt-1 text-sm text-gray-600">
                {blog.category?.title}
              </p>
            ) : (
              <select
                id="category_id"
                className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                {...register("category_id", {
                  required: "Category is required",
                })}
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            )}
            {errors.category_id && (
              <p className="text-red-500 text-sm">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            {mode === "view" ? (
              <p className="mt-1 text-sm text-gray-600">{blog.content}</p>
            ) : (
              <div className="mt-1">
                <CKEditor
                  editor={ClassicEditor}
                  data={blog?.content || ""}
                  onChange={(event, editor) => {
                    setContent(editor.getData());
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "blockQuote",
                      "insertTable",
                      "|",
                      "undo",
                      "redo",
                    ],
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="featured_image"
              className="block text-sm font-medium text-gray-700"
            >
              Featured Image
            </label>
            {mode === "view" ? (
              <img
                src={blog.featured_image}
                alt="Featured"
                className="rounded-lg"
              />
            ) : (
              <div>
                <input
                  type="file"
                  id="featured_image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-500"
                />
                {imageFile.preview && (
                  <div className="mt-2">
                    <img
                      src={imageFile.preview}
                      alt="Preview"
                      className="w-full max-w-md h-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="mt-2 text-sm text-red-500 hover:underline"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="metaTitle"
              className="block text-sm font-medium text-gray-700"
            >
              Meta Title
            </label>
            {mode === "view" ? (
              <p className="mt-1 text-sm text-gray-600">{blog.metaTitle}</p>
            ) : (
              <input
                type="text"
                id="metaTitle"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                {...register("metaTitle")}
                placeholder="SEO Meta Title"
              />
            )}
          </div>

          <div>
            <label
              htmlFor="metaDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Meta Description
            </label>
            {mode === "view" ? (
              <p className="mt-1 text-sm text-gray-600">
                {blog.metaDescription}
              </p>
            ) : (
              <input
                type="text"
                id="metaDescription"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                {...register("metaDescription")}
                placeholder="SEO Meta Description"
              />
            )}
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            {mode === "view" ? (
              <p className="mt-1 text-sm text-gray-600">{blog.status}</p>
            ) : (
              <select
                id="status"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                {...register("status")}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            {mode !== "view" && (
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Update Blog
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogModal;
