import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { createBlog, updateBlog, getAllBlogCategories, getBlogById } from '../../../services/api.blogs';
import { useAppContext } from '../../../context/AppContext';

const BlogForm = () => {
  const navigate = useNavigate();
  const { blogId } = useParams();
  const { user } = useAppContext();
  
  // States
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      status: 'draft'
    }
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllBlogCategories();        
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch blog data if editing
  useEffect(() => {
    const fetchBlogData = async () => {
      if (!blogId) return;
      
      setIsLoading(true);
      try {
        const response = await getBlogById(blogId);
        const blog = response.data;
        
        // Set form values
        Object.keys(blog).forEach(key => {
          setValue(key, blog[key]);
        });
        setContent(blog.content);
        if (blog.featured_image) {
          setImagePreview(blog.featured_image);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogData();
  }, [blogId, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key !== 'featured_image') {
          formData.append(key, data[key]);
        }
      });
      
      formData.append('content', content);
      console.log(typeof(content));
      
      if (featuredImage) {
        formData.append('featured_image', featuredImage);
      }      

      const response = blogId 
        ? await updateBlog(blogId, formData)
        : await createBlog(user.id, formData);        

      if (response) {
        navigate('/admin/blogs');
      }
    } catch (error) {
      console.error('Error submitting blog:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {blogId ? 'Edit Blog' : 'Create New Blog'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details below to {blogId ? 'update' : 'create'} your blog post
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              className={`mt-1 block w-full rounded-md border ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black`}
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' }
              })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              {...register('category_id', { required: 'Category is required' })}
            >
              <option value="" disabled selected>Select Category</option>
              {categories?.map(category => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <div className="mt-1">
              <CKEditor
                editor={ClassicEditor}
                data={content}
                onChange={(event, editor) => {
                  setContent(editor.getData());
                }}
                config={{
                  toolbar: [
                    'heading',
                    '|',
                    'bold',
                    'italic',
                    'link',
                    'bulletedList',
                    'numberedList',
                    '|',
                    'blockQuote',
                    'insertTable',
                    '|',
                    'undo',
                    'redo'
                  ]
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700">
              Featured Image
            </label>
            <input
              type="file"
              id="featured_image"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-w-md h-auto rounded-lg"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
              Meta Title
            </label>
            <input
              type="text"
              id="metaTitle"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              {...register('metaTitle')}
              placeholder="SEO Meta Title"
            />
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
              Meta Description
            </label>
            <input
              type="text"
              id="metaDescription"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              {...register('metaDescription')}
              placeholder="SEO Meta Description"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              {...register('status')}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/blogs')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  {blogId ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                blogId ? 'Update Blog' : 'Create Blog'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;