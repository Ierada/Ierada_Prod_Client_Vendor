import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  User,
  MapPin,
  Bell,
} from "lucide-react";

// Mock data for demonstration
const mockCategories = [
  {
    id: 1,
    title: "Electronics",
    slug: "electronics",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
    subcategory: [
      {
        name: "Smartphones",
        slug: "smartphones",
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
        innersubcategory: [
          { name: "iPhone", slug: "iphone" },
          { name: "Samsung", slug: "samsung" },
          { name: "OnePlus", slug: "oneplus" },
          { name: "Xiaomi", slug: "xiaomi" },
        ],
      },
      {
        name: "Laptops",
        slug: "laptops",
        image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
        innersubcategory: [
          { name: "MacBook", slug: "macbook" },
          { name: "Dell", slug: "dell" },
          { name: "HP", slug: "hp" },
          { name: "Lenovo", slug: "lenovo" },
        ],
      },
      {
        name: "Tablets",
        slug: "tablets",
        image:
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
        innersubcategory: [
          { name: "iPad", slug: "ipad" },
          { name: "Samsung Tab", slug: "samsung-tab" },
          { name: "Surface", slug: "surface" },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Fashion",
    slug: "fashion",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    subcategory: [
      {
        name: "Men's Wear",
        slug: "mens-wear",
        image:
          "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400&h=300&fit=crop",
        innersubcategory: [
          { name: "Shirts", slug: "shirts" },
          { name: "T-Shirts", slug: "t-shirts" },
          { name: "Jeans", slug: "jeans" },
          { name: "Formal Wear", slug: "formal-wear" },
          { name: "Casual Wear", slug: "casual-wear" },
          { name: "Ethnic Wear", slug: "ethnic-wear" },
        ],
      },
      {
        name: "Women's Wear",
        slug: "womens-wear",
        image:
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop",
        innersubcategory: [
          { name: "Dresses", slug: "dresses" },
          { name: "Tops", slug: "tops" },
          { name: "Sarees", slug: "sarees" },
          { name: "Kurti", slug: "kurti" },
          { name: "Western Wear", slug: "western-wear" },
          { name: "Traditional", slug: "traditional" },
        ],
      },
      {
        name: "Footwear",
        slug: "footwear",
        image:
          "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=300&fit=crop",
        innersubcategory: [
          { name: "Sneakers", slug: "sneakers" },
          { name: "Formal Shoes", slug: "formal-shoes" },
          { name: "Sandals", slug: "sandals" },
          { name: "Boots", slug: "boots" },
        ],
      },
    ],
  },
];

// Updated CategoryDropdown Component with positioning from HeaderCopy and items from new Header
const CategoryDropdown = ({
  category,
  baseUrl,
  hoveredSubcategory,
  hoveredInnerSubcategory,
  setHoveredSubcategory,
  setHoveredInnerSubcategory,
}) => {
  if (!category) return null;

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 top-full bg-white text-gray-800 shadow-2xl z-50 border border-gray-200 rounded-lg w-[90vw] max-w-[1000px] max-h-[90vh] overflow-hidden">
      <div className="flex h-full">
        {/* Categories List - Scrollable with proper styling */}
        <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="p-6">
            {/* Horizontal layout like the new header */}
            <div className="flex flex-row flex-wrap gap-8">
              {Array.isArray(category.subcategory) &&
                category.subcategory.map((sub, subIndex) => (
                  <div
                    key={`sub-${subIndex}`}
                    className="min-w-[200px] border-b border-gray-100 pb-4 last:border-b-0"
                    onMouseEnter={() => setHoveredSubcategory(sub)}
                    onMouseLeave={() => setHoveredSubcategory(null)}
                  >
                    {/* Main Subcategory Title */}
                    <Link
                      to={`${baseUrl}/collection/subcategory/${
                        sub.slug || sub.name
                      }`}
                      className="font-semibold text-base font-Lato hover:text-olive-600 block mb-3 transition-colors duration-200"
                    >
                      {sub.name || sub.title}
                    </Link>

                    {/* Inner Subcategories */}
                    {Array.isArray(sub.innersubcategory) &&
                      sub.innersubcategory.length > 0 && (
                        <ul className="space-y-2">
                          {sub.innersubcategory.map((innerSub, innerIndex) => (
                            <li
                              key={`inner-${innerIndex}`}
                              onMouseEnter={() =>
                                setHoveredInnerSubcategory(innerSub)
                              }
                              onMouseLeave={() =>
                                setHoveredInnerSubcategory(null)
                              }
                            >
                              <Link
                                to={`${baseUrl}/collection/innersubcategory/${
                                  innerSub.slug || innerSub.name
                                }`}
                                className="font-Lato text-sm text-gray-600 hover:text-black hover:font-medium transition-all duration-200 py-1 leading-relaxed block"
                              >
                                {innerSub.name || innerSub.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Image Preview - Fixed on right side */}
        <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50 hidden lg:block">
          {(hoveredInnerSubcategory?.image ||
            hoveredSubcategory?.image ||
            category?.image) && (
            <div className="sticky top-0 p-6 h-full flex flex-col justify-center">
              <img
                src={
                  hoveredInnerSubcategory?.image ||
                  hoveredSubcategory?.image ||
                  category?.image ||
                  "https://via.placeholder.com/400x300?text=No+Image"
                }
                alt="Category Preview"
                className="w-full h-64 object-cover rounded-lg shadow-md transition-all duration-300"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
              {(hoveredInnerSubcategory?.name ||
                hoveredSubcategory?.name ||
                category?.title) && (
                <p className="text-center text-sm text-gray-700 mt-4 font-medium">
                  {hoveredInnerSubcategory?.name ||
                    hoveredSubcategory?.name ||
                    category?.title}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// SearchResults Component
const SearchResults = ({ results, onSelect }) => {
  if (!results?.length) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-md mt-1 max-h-64 overflow-y-auto z-50">
      {results.map((product) => (
        <div
          key={product.id}
          onClick={() => onSelect(product)}
          className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
        >
          <div>
            <p className="font-semibold text-gray-800">{product.name}</p>
            <p>
              <span className="font-semibold">
                {product.discounted_price ? `₹${product.discounted_price}` : ``}
              </span>
              <span className="text-gray-600 ml-2 line-through">
                {product.original_price ? `₹${product.original_price}` : ``}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Header Component
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [hoveredInnerSubcategory, setHoveredInnerSubcategory] = useState(null);
  const [headerCounts, setHeaderCounts] = useState({
    cartCount: 3,
    wishlistCount: 5,
    notificationsCount: 2,
  });

  const searchRef = useRef(null);
  const categoryTimeoutRef = useRef(null);
  const baseUrl = "";

  // location model functionality
  const [currentLocation, setCurrentLocation] = useState("Mumbai, Maharashtra");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Mock user
  const user = { id: 1, name: "Test User" };

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock search handler
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      // Mock search results
      const mockResults = [
        {
          id: 1,
          name: `${query} Product 1`,
          discounted_price: 999,
          original_price: 1299,
          slug: "product-1",
        },
        {
          id: 2,
          name: `${query} Product 2`,
          discounted_price: 1499,
          original_price: 1899,
          slug: "product-2",
        },
      ];
      setSearchResults(mockResults);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchSelect = (product) => {
    console.log("Navigate to:", `${baseUrl}/product/${product.slug}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Search for:", searchQuery);
      setShowSearchResults(false);
    }
  };

  const handleButtonClick = (route) => {
    console.log("Navigate to:", route);
  };

  // Enhanced hover handlers for category dropdown (from HeaderCopy)
  const handleCategoryMouseEnter = (category) => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
    }
    setHoveredCategory(category);
  };

  const handleCategoryMouseLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setHoveredSubcategory(null);
      setHoveredInnerSubcategory(null);
    }, 100);
  };

  const handleDropdownMouseEnter = () => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setHoveredSubcategory(null);
      setHoveredInnerSubcategory(null);
    }, 100);
  };

  const openLocationModal = () => {
    setIsLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black font-poppins">
      <nav className="border-b border-gray-800 py-4 px-4">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center">
            <a href={baseUrl} className="flex-shrink-0 bg-white rounded-lg p-3">
              <div className="h-6 w-12 bg-gray-800 rounded flex items-center justify-center text-white text-xs font-bold">
                LOGO
              </div>
            </a>
            <>
              {/* Button UI */}
              <button
                className="text-white flex gap-1 items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={openLocationModal}
              >
                <MapPin className="h-5 w-5" />
                <span className="hidden md:inline text-sm whitespace-nowrap overflow-hidden overflow-ellipsis max-w-xs">
                  {currentLocation}
                </span>
              </button>
            </>
          </div>

          {/* Search Bar */}
          <div
            ref={searchRef}
            className="relative hidden md:block flex-grow max-w-2xl"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-md px-4 py-2"
            >
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-transparent text-white placeholder-gray-400 flex-grow outline-none border-none ring-0 focus:ring-0 px-3 py-1 text-sm"
              />
            </form>
            {showSearchResults && (
              <SearchResults
                results={searchResults}
                onSelect={handleSearchSelect}
              />
            )}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {[
              { icon: Heart, route: "wishlist", countKey: "wishlistCount" },
              { icon: ShoppingCart, route: "cart", countKey: "cartCount" },
              {
                icon: Bell,
                route: "notifications",
                countKey: "notificationsCount",
              },
              { icon: User, route: "profile" },
            ].map(({ icon: Icon, route, countKey }) => (
              <button
                key={route}
                onClick={() => handleButtonClick(route)}
                className="relative text-white hover:text-gray-200 flex flex-col items-center text-xs"
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="capitalize">{route}</span>
                {user && headerCounts[countKey] > 0 && route !== "profile" ? (
                  <span className="absolute -top-2 -right-2 bg-white text-[#6b705c] text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {headerCounts[countKey] || 0}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white z-40 mt-16 overflow-y-auto">
            <div className="container px-4 py-6">
              <div className="relative mb-6">
                <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                  <Search className="h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search for products, brands and more"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchSubmit(e)
                    }
                    className="bg-transparent flex-grow outline-none border-none ring-0 focus:ring-0 px-3 py-1 text-sm"
                  />
                </div>
                {showSearchResults && (
                  <SearchResults
                    results={searchResults}
                    onSelect={handleSearchSelect}
                  />
                )}
              </div>

              <div className="space-y-1 mb-6">
                <a
                  href={`${baseUrl}/collection/all`}
                  className="block py-3 px-2 text-gray-800 hover:bg-gray-100 rounded-md font-medium"
                >
                  Shop All
                </a>

                {categories?.map((category) => (
                  <a
                    key={category.id}
                    href={`${baseUrl}/collection/category/${
                      category.slug || category.title.toLowerCase()
                    }`}
                    className="block py-3 px-2 text-gray-800 hover:bg-gray-100 rounded-md font-medium"
                  >
                    {category.title}
                  </a>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { icon: Heart, route: "wishlist", label: "Wishlist" },
                    { icon: ShoppingCart, route: "cart", label: "Cart" },
                    {
                      icon: Bell,
                      route: "notifications",
                      label: "Notifications",
                    },
                    { icon: User, route: "profile", label: "Profile" },
                  ].map(({ icon: Icon, route, label }) => (
                    <button
                      key={route}
                      onClick={() => handleButtonClick(route)}
                      className="flex flex-col items-center text-gray-600"
                    >
                      <div className="relative">
                        <Icon className="h-6 w-6 mb-1" />
                        {user &&
                        headerCounts[`${route}Count`] > 0 &&
                        route !== "profile" ? (
                          <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                            {headerCounts[`${route}Count`] || 0}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation Bar (Categories) - Using HeaderCopy positioning */}
      <div className="bg-white hidden md:block shadow-sm relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-start space-x-8">
            <a
              href={`${baseUrl}/collection/all`}
              className="py-3 text-black hover:text-olive-600 font-medium text-sm uppercase tracking-wide"
            >
              Shop
            </a>
            {categories?.map((category) => (
              <div
                key={category.id}
                className="relative group"
                onMouseEnter={() => handleCategoryMouseEnter(category)}
                onMouseLeave={handleCategoryMouseLeave}
              >
                <a
                  href={`${baseUrl}/collection/category/${
                    category.slug || category.title.toLowerCase()
                  }`}
                  className="py-3 text-black hover:text-olive-600 font-medium text-sm uppercase tracking-wide"
                >
                  {category.title}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Category Dropdown */}
        {hoveredCategory && (
          <div
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
            <CategoryDropdown
              category={hoveredCategory}
              baseUrl={baseUrl}
              hoveredSubcategory={hoveredSubcategory}
              hoveredInnerSubcategory={hoveredInnerSubcategory}
              setHoveredSubcategory={setHoveredSubcategory}
              setHoveredInnerSubcategory={setHoveredInnerSubcategory}
            />
          </div>
        )}
      </div>

      {/* Location Modal Placeholder */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Location</h3>
            <p className="text-gray-600 mb-4">
              Location modal content goes here
            </p>
            <button
              onClick={closeLocationModal}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Login Modal Placeholder */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Sign In</h3>
            <p className="text-gray-600 mb-4">Login modal content goes here</p>
            <button
              onClick={() => setShowLoginModal(false)}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 0.25rem;
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
      `}</style>
    </header>
  );
};

export default Header;
