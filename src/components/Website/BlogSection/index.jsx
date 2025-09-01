import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import config from '../../../config/config';

const BlogSection = ({homepageData}) => {
  const navigate = useNavigate();

  const blogData = homepageData?.blogs || [];
  
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 4;
  const totalPages = Math.ceil(blogData?.length / blogsPerPage);
  
  // Calculate blogs to display
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogData?.slice(indexOfFirstBlog, indexOfLastBlog);

  // Create pairs of blogs for layout
  const blogPairs = [];
  for (let i = 0; i < currentBlogs.length; i += 2) {
    blogPairs.push(currentBlogs.slice(i, i + 2));
  }

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;
    
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <section className="px-4 md:px-8 lg:px-16 py-20">
      {/* Section Title */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-italiana relative inline-block">
          <span className="font-light">Read our Blogs</span>
          <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-2 w-[70%] border-b-2 border-current"></span>
        </h2>
      </div>

      {/* Blog Layout */}
      <div className="flex flex-col space-y-20">
        {blogPairs.map((pair, pairIndex) => (
          <div key={pairIndex} className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {pair.map((blog, index) => (
              <div 
                key={blog.id}
                className="flex flex-col md:flex-row gap-6 items-start"
              >
                {/* Image and Content wrapper */}
                <div className={`flex ${pairIndex % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} gap-6 w-full`}>
                  {/* Image Section */}
                  <div className="w-1/2">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="w-1/2 flex flex-col items-start">
                  <span className="text-sm text-[#6B1F40] mb-2">
                          {blog?.BlogCategory?.title}
                        
                          
                        </span>
                    <h3 className="text-2xl font-light mb-4">{blog.title}</h3>
                    <p className="text-gray-600 mb-6 text-sm line-clamp-4">{blog.meta_description}</p>
                    <button
                    onClick={() => navigate(`${config.VITE_BASE_WEBSITE_URL}/blogs/${blog.slug}`)}
                    
                    className="bg-[#6B1F40] text-white px-6 py-2 text-sm hover:bg-[#5a1935] transition-colors">
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center space-x-4 mt-16">
        <div className="flex items-center space-x-6">
            {getPageNumbers()[0] > 1 && (
                <button 
                onClick={() => setCurrentPage(prev => Math.min(prev - 1, totalPages))}
                className="ml-2 text-[#6B1F40]"
                >
                <ChevronLeft className="w-6 h-6" />
                </button>
            )}
            {getPageNumbers().map((number) => (
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
            <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={`ml-2 ${currentPage < totalPages ? "cursor-pointer text-[#6B1F40]" : "cursor-default	 text-white"}`} 
            >
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;