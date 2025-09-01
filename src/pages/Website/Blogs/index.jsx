import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllBlogs, getAllBlogCategories } from '../../../services/api.blogs';
import config from '../../../config/config';

const BlogPage = () => {
  const navigate = useNavigate();
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // State for data
  const [isLoading, setIsLoading] = useState(false);
  const [allBlogs, setAllBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  
  const blogsPerPage = 8;

  // Fetch all blogs
  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await getAllBlogs();
      console.log(response);
      
      setAllBlogs(response.data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await getAllBlogCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...allBlogs];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(blog => 
        blog.category_id.toString() === selectedCategory
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm?.toLowerCase();
      filtered = filtered.filter(blog =>
        blog?.title?.toLowerCase()?.includes(searchLower) ||
        blog?.meta_description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBlogs(filtered);
    setTotalPages(Math.ceil(filtered.length / blogsPerPage));
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [allBlogs, selectedCategory, searchTerm]);

  // Get current page blogs
  const getCurrentPageBlogs = () => {
    const startIndex = (currentPage - 1) * blogsPerPage;
    const endIndex = startIndex + blogsPerPage;
    return filteredBlogs.slice(startIndex, endIndex);
  };

  // Create pairs of blogs for layout
  const blogPairs = [];
  const currentBlogs = getCurrentPageBlogs();
  for (let i = 0; i < currentBlogs.length; i += 2) {
    blogPairs.push(currentBlogs.slice(i, i + 2));
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Section */}
      <div className="relative h-[400px] bg-gray-900">
        {/* <img
          src="/api/placeholder/1920/400"
          alt="Blog Banner"
          className="w-full h-full object-cover opacity-50"
        /> */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-italiana mb-4">Read Our Blogs</h1>
            <p className="text-xl max-w-2xl mx-auto px-4">
              Discover the latest trends, insights, and stories from our fashion experts
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search blogs..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B1F40] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          
          {/* Category Dropdown */}
          <div className="relative w-full md:w-[200px]">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B1F40] text-left flex justify-between items-center"
            >
              <span>
                {selectedCategory === 'all' 
                  ? 'All Categories' 
                  : categories?.find(c => c.id.toString() === selectedCategory)?.title || 'Select Category'}
              </span>
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    All Categories
                  </button>
                  {categories?.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id.toString());
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Blog Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B1F40]"></div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">No blogs found matching your criteria</h3>
          </div>
        ) : (
          <div className="flex flex-col space-y-20">
            {blogPairs?.map((pair, pairIndex) => (
              <div key={pairIndex} className="grid md:grid-cols-2 gap-8 lg:gap-16">
                {pair?.map((blog) => (
                  <div 
                    key={blog.id}
                    className="flex flex-col md:flex-row gap-6 items-start"
                  >
                    <div className={`flex ${pairIndex % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} gap-6 w-full`}>
                      <div className="w-1/2">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={blog.featured_image || '/api/placeholder/400/500'}
                            alt={blog.title}
                            className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      </div>
                      <div className="w-1/2 flex flex-col items-start">
                        <span className="text-sm text-[#6B1F40] mb-2">
                          {categories?.find(c => c.id === blog.category_id)?.title}
                        </span>
                        <h3 className="text-2xl font-light mb-4">{blog.title}</h3>
                        <p className="text-gray-600 mb-6 text-sm line-clamp-4">
                          {blog.meta_description}
                        </p>
                        <button 
                          onClick={() => navigate(`${config.VITE_BASE_WEBSITE_URL}/blogs/${blog.slug}`)}
                          className="px-6 py-2 bg-[#6B1F40] text-white hover:bg-[#5a1935] transition-colors"
                        >
                          Read More
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center space-x-4 mt-16">
            <div className="flex items-center space-x-6">
              {currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="text-[#6B1F40] hover:text-[#5a1935]"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  className={`text-xl ${
                    currentPage === number
                      ? 'text-[#6B1F40] font-medium'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  onClick={() => setCurrentPage(number)}
                >
                  {number.toString().padStart(2, '0')}
                </button>
              ))}
              {currentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="text-[#6B1F40] hover:text-[#5a1935]"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;