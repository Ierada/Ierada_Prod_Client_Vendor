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
  Mic,
} from "lucide-react";
import logoWhite from "/assets/logo/logo_white.svg";
import config from "../../config/config";
import Cookies from "js-cookie";
import { searchProducts } from "../../services/api.product";
import SignInModal from "./SigninModal";
import {
  getHeaderCategories,
  getHeaderCartWishlistNotificationCount,
} from "../../services/api.header";
import LocationModal from "./LocationModal";
import { useAppContext } from "../../context/AppContext";
import EmptyImg from "/assets/bg/empty-img.svg";
import { getUserIdentifier } from "../../utils/userIdentifier";
import { jwtDecode } from "jwt-decode";
import { LiaHotjar } from "react-icons/lia";

// Reusable CategoryDropdown Component - FIXED VERSION
const CategoryDropdown = ({
  category,
  baseUrl,
  hoveredSubcategory,
  hoveredInnerSubcategory,
  setHoveredSubcategory,
  setHoveredInnerSubcategory,
}) => {
  if (!category) return null;

  const subcategories = category.subcategory || [];

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 top-full bg-white text-gray-800 shadow-2xl z-50 border border-primary-100 rounded-lg w-[90vw] max-h-[90vh] overflow-hidden">
      <div className="flex h-full">
        {/* Categories List */}
        <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="p-4">
            <div className="columns-4 gap-x-8">
              {subcategories.map((sub, subIndex) => {
                const innerSubcategories = sub.innersubcategory || [];
                const hasMoreInner = innerSubcategories.length > 7;
                const innerToShow = hasMoreInner
                  ? innerSubcategories.slice(0, 7)
                  : innerSubcategories;

                return (
                  <div
                    key={`sub-${subIndex}`}
                    className={`break-inside-avoid mb-6 ${
                      subIndex % 2 === 0
                        ? "bg-white"
                        : "bg-gradient-to-r from-[rgba(255,183,0,0.05)] to-[rgba(255,59,0,0.05)]"
                    } p-2 rounded-md`}
                    onMouseEnter={() => setHoveredSubcategory(sub)}
                    onMouseLeave={() => setHoveredSubcategory(null)}
                  >
                    {/* Subcategory Title */}
                    <Link
                      to={`${baseUrl}/collection/subcategory/${
                        sub.slug || sub.name
                      }`}
                      className="font-semibold text-sm font-Lato hover:text-olive-600 block mb-1 transition-colors duration-200"
                    >
                      {sub.name || sub.title}
                    </Link>

                    {/* Inner Subcategories */}
                    {innerSubcategories.length > 0 && (
                      <ul className="space-y-0.5">
                        {innerToShow.map((innerSub, innerIndex) => (
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
                              className="font-Lato text-xs text-gray-600 hover:text-black hover:font-medium transition-all duration-200 py-0.5 leading-tight block"
                            >
                              {innerSub.name || innerSub.title}
                            </Link>
                          </li>
                        ))}
                        {hasMoreInner && (
                          <li>
                            <Link
                              to={`${baseUrl}/collection/subcategory/${
                                sub.slug || sub.name
                              }`}
                              className="font-Lato mt-1 text-xs text-olive-600 hover:underline font-medium transition-all duration-200 py-0.5 leading-tight block"
                            >
                              See More →
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Image Preview */}
        {/* <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50 hidden lg:block">
          {(hoveredInnerSubcategory?.image ||
            hoveredSubcategory?.image ||
            category?.header_image) && (
            <div className="sticky top-0 p-4 h-full flex flex-col justify-center">
              <img
                src={
                  hoveredInnerSubcategory?.image ||
                  hoveredSubcategory?.image ||
                  category?.header_image ||
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
        </div> */}
      </div>
    </div>
  );
};

// ProfileDropdown Component
const ProfileDropdown = ({
  user,
  baseUrl,
  setShowLoginModal,
  setShowSignupModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  let timeoutId;

  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="relative text-gray-600 hover:text-gray-800 transition-colors duration-200">
        <User className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-[100] border border-gray-200"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {!user ? (
            <div className="p-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLoginModal(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowSignupModal(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="p-4 flex flex-col gap-1">
              <Link
                to={`${baseUrl}/profile`}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <Link
                to={`${baseUrl}/orders`}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                My Orders
              </Link>
              <Link
                to={`${baseUrl}/cart`}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                My Cart
              </Link>
              <Link
                to={`${baseUrl}/wishlist`}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                My Wishlist
              </Link>
              <Link
                to={`${baseUrl}/logout`}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200 flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// SearchResults Component
const SearchResults = ({ results, onSelect, searchResultsRef }) => {
  if (!results?.length) return null;

  return (
    <div
      ref={searchResultsRef}
      className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-md mt-1 max-h-64 overflow-y-auto z-[100]"
    >
      {results.map((product) => (
        <div
          key={product.id}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
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

// Voice Search Popup Component
const VoiceSearchPopup = ({ isListening, toggleListening, searchQuery }) => {
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] transition-opacity duration-300 ${
        isListening ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Microphone Icon */}
          <div
            className={`relative p-4 rounded-full ${
              isListening ? "bg-red-100 animate-pulse" : "bg-gray-100"
            }`}
          >
            <Mic
              className={`h-8 w-8 ${
                isListening ? "text-red-500" : "text-gray-500"
              }`}
            />
            {isListening && (
              <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-ping"></div>
            )}
          </div>

          {/* Status Text */}
          <p className="text-lg font-medium text-gray-800">
            {isListening ? "Listening..." : "Voice Search Stopped"}
          </p>

          {/* Live Transcript */}
          <div className="w-full bg-gray-100 rounded-lg p-3 min-h-[60px] flex items-center justify-center">
            <p className="text-gray-600 text-center">
              {searchQuery || "Say something to search..."}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={toggleListening}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              {isListening ? "Stop" : "Restart"}
            </button>
            <button
              onClick={toggleListening}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Header Component
const Header = () => {
  const location = useLocation();
  const { user, setUser, triggerHeaderCounts } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [categories, setCategories] = useState([]);
  const [floatingOffer, setFloatingOffer] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [hoveredInnerSubcategory, setHoveredInnerSubcategory] = useState(null);
  const [headerCounts, setHeaderCounts] = useState({});
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showOfferBar, setShowOfferBar] = useState(true);
  const recognitionRef = useRef(null);
  const searchRef = useRef(null);
  const categoryTimeoutRef = useRef(null);
  const searchResultsRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const baseUrl = config.VITE_BASE_WEBSITE_URL;

  // Check for customer token and user
  useEffect(() => {
    const customerToken = Cookies.get(`${config.BRAND_NAME}CustomerToken`);
    if (customerToken) {
      try {
        const decoded = jwtDecode(customerToken);
        if (decoded.role === "customer") {
          const storedUser = JSON.parse(
            localStorage.getItem(`${config.BRAND_NAME}CustomerUser`) || "{}"
          );
          setUser(storedUser);
        } else {
          setUser(null);
          Cookies.remove(`${config.BRAND_NAME}CustomerToken`);
          localStorage.removeItem(`${config.BRAND_NAME}CustomerUser`);
        }
      } catch (error) {
        console.error("Error decoding customer token:", error);
        setUser(null);
        Cookies.remove(`${config.BRAND_NAME}CustomerToken`);
        localStorage.removeItem(`${config.BRAND_NAME}CustomerUser`);
      }
    } else {
      setUser(null);
    }
  }, [setUser]);

  useEffect(() => {
    setHoveredCategory(null);
    setHoveredSubcategory(null);
    setHoveredInnerSubcategory(null);
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      const results = await searchProducts(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Initialization for speech recognition
  useEffect(() => {
    if (
      !("SpeechRecognition" in window) &&
      !("webkitSpeechRecognition" in window)
    ) {
      console.warn("Web Speech API not supported");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setSearchQuery(transcript);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (searchQuery.trim()) {
        // Create a synthetic event to mimic input change
        const syntheticEvent = {
          target: { value: searchQuery },
        };
        handleSearchChange(syntheticEvent);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [searchQuery]);

  // Function to toggle listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleNavigation = (to) => {
    setHoveredCategory(null);
    setHoveredSubcategory(null);
    setHoveredInnerSubcategory(null);
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
    navigate(to);
  };

  // Location model functionality
  const [currentLocation, setCurrentLocation] = useState("Your Location");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setCurrentLocation("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${config.GMAP_KEY}`
          );
          const data = await response.json();
          console.log("Geocoding Response:", data);

          if (data.results && data.results[0]) {
            const addressArray = data.results[0].address_components;
            const neighborhood = addressArray.find((component) =>
              component.types.includes("neighborhood")
            );
            const locality = addressArray.find((component) =>
              component.types.includes("locality")
            );

            if (neighborhood && locality) {
              setCurrentLocation(
                neighborhood.short_name + ", " + locality.short_name
              );
            } else {
              const locationStrings =
                data.results[0]?.formatted_address.split(",");

              if (locationStrings.length >= 3) {
                const firstWord =
                  locationStrings[locationStrings.length - 4]?.trim();
                const city =
                  locationStrings[locationStrings.length - 3]?.trim();
                setCurrentLocation(`${firstWord}, ${city}`);
              } else {
                setCurrentLocation(data.results[0]?.formatted_address);
              }
            }
          } else {
            setCurrentLocation("Unable to fetch location");
          }
        } catch (error) {
          console.error("Error fetching location details:", error);
          setCurrentLocation("Error fetching location");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setCurrentLocation("Permission denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const openLocationModal = () => {
    setIsLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
  };

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

  const handleProfileMouseEnter = () => {
    setShowProfileDropdown(true);
  };

  const handleProfileMouseLeave = () => {
    setShowProfileDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
        setShowSearchResults(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getHeaderCategories();
        setCategories(response?.data?.categories || []);
        const floatingOffer = response?.data?.header_floating_offer
          ? JSON.parse(response?.data?.header_floating_offer)
          : null;
        if (floatingOffer) {
          setFloatingOffer(floatingOffer);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchHeaderCartWishlistNotificationCount = async () => {
      const userId = getUserIdentifier("customer");
      if (!userId || typeof userId === "string") return;
      const res = await getHeaderCartWishlistNotificationCount(userId);
      if (res) {
        setHeaderCounts({
          cartCount: res.data.cart_count,
          wishlistCount: res.data.wishlist_count,
          notificationsCount: res.data.notification_count,
        });
      }
    };

    const isDesignerOrAdminRoute =
      location.pathname.startsWith("/vendor") ||
      location.pathname.startsWith("/admin");

    if (!isDesignerOrAdminRoute && user) {
      fetchHeaderCartWishlistNotificationCount();
    }
  }, [location.pathname, user, triggerHeaderCounts]);

  const handleSearchSelect = (product) => {
    navigate(`${baseUrl}/product/${product.slug}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `${baseUrl}/collection/search/${encodeURIComponent(searchQuery)}`
      );
      setShowSearchResults(false);
    }
  };

  const handleButtonClick = (route) => {
    const customerToken = Cookies.get(`${config.BRAND_NAME}CustomerToken`);
    if (customerToken) {
      navigate(`${baseUrl}/${route}`);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white font-poppins">
      <nav className="py-2 px-4">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            <Link
              to={baseUrl}
              className="flex-shrink-0 border-b-2 border-primary-100 rounded-lg py-1"
            >
              <img src={logoWhite} alt="Logo" className="h-6 md:h-8 w-auto" />
            </Link>
            <>
              <button
                className="text-primary-100 flex gap-1 items-center px-3 md:py-2 rounded-lg border shadow"
                onClick={openLocationModal}
              >
                <MapPin className="h-2 md:h-4 w-2 md:w-4 text-gray-400" />
                <span className="text-[10px] md:text-xs">
                  {currentLocation}
                </span>
              </button>

              {isLocationModalOpen && (
                <LocationModal
                  onClose={closeLocationModal}
                  setCurrentLocation={setCurrentLocation}
                />
              )}
            </>
          </div>

          {/* Search Bar */}
          <div
            ref={searchRef}
            className="relative hidden md:block flex-grow max-w-2xl"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-3 bg-white border border-primary-100 shadow-sm rounded-full px-4 py-2"
            >
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for items..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-white text-gray-800 placeholder-gray-500 flex-grow outline-none border-none ring-0 focus:ring-0"
              />
              <button
                type="button"
                onClick={toggleListening}
                className="text-gray-400"
              >
                <Mic
                  className={`h-5 w-5 ${isListening ? "text-red-500" : ""}`}
                />
              </button>
            </form>

            {showSearchResults && (
              <SearchResults
                results={searchResults}
                onSelect={handleSearchSelect}
                searchResultsRef={searchResultsRef}
              />
            )}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {[
              { icon: Heart, route: "wishlist", countKey: "wishlistCount" },
              { icon: ShoppingCart, route: "cart", countKey: "cartCount" },
            ].map(({ icon: Icon, route, countKey }) => (
              <button
                key={route}
                onClick={() => handleButtonClick(route)}
                className="relative flex gap-1 items-center text-gray-600 hover:text-gray-800"
              >
                <Icon className="h-5 w-5" />
                {user && headerCounts[countKey] > 0 ? (
                  <span className="absolute -top-3 left-2 bg-primary-100 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {headerCounts[countKey] || 0}
                  </span>
                ) : null}
                <span className="hidden md:inline text-sm">{route}</span>
              </button>
            ))}
            <ProfileDropdown
              user={user}
              baseUrl={baseUrl}
              setShowLoginModal={setShowLoginModal}
              setShowSignupModal={setShowSignupModal}
            />
          </div>

          <button
            className="md:hidden text-gray-600"
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
          <div className="md:hidden fixed top-20 left-0 right-0 bottom-0 bg-white shadow-lg z-50 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b bg-white">
                <div className="relative">
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center bg-gray-100 rounded-lg p-1"
                  >
                    <Search className="h-5 w-5 text-gray-500 mx-2" />
                    <input
                      type="text"
                      placeholder="Search product"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="bg-transparent flex-grow outline-none border-none ring-0 focus:ring-0"
                    />
                  </form>
                  {showSearchResults && (
                    <SearchResults
                      results={searchResults}
                      onSelect={handleSearchSelect}
                      searchResultsRef={searchResultsRef}
                    />
                  )}
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto py-2 px-4"
                style={{ height: "calc(100vh - 180px)" }}
              >
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(`${baseUrl}/collection/all`);
                  }}
                  className="block flex items-center gap-2 py-3 text-primary-100 hover:text-gray-600 border-b border-gray-100"
                >
                  <LiaHotjar className="h-5 w-5" />
                  Shop
                </a>

                {categories?.map((category) => (
                  <a
                    key={category.id}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(
                        `${baseUrl}/collection/category/${
                          category.slug || category.title.toLowerCase()
                        }`
                      );
                    }}
                    className="block py-3 text-gray-800 hover:text-gray-600 border-b border-gray-100"
                  >
                    {category.title}
                  </a>
                ))}
              </div>

              <div className="border-t border-gray-200 bg-white py-3">
                <div className="flex justify-around">
                  {[
                    { icon: Heart, route: "wishlist", label: "Wishlist" },
                    { icon: ShoppingCart, route: "cart", label: "Cart" },
                    { icon: User, route: "profile", label: "Profile" },
                  ].map(({ icon: Icon, route, label }) => (
                    <button
                      key={route}
                      onClick={() => {
                        handleButtonClick(route);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center text-gray-600"
                    >
                      <Icon className="h-6 w-6 mb-1" />
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="bg-white hidden md:block shadow-sm relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center md:justify-start xl:justify-start md:space-x-0 md:gap-2 xl:space-x-8 xl:py-3">
            <div className="overflow-x-auto whitespace-nowrap px-4">
              <div className="flex items-center gap-6 py-3">
                <Link
                  to={`${baseUrl}/collection/all`}
                  className="flex items-center gap-1 text-primary-100 font-medium text-sm uppercase"
                >
                  <LiaHotjar className="h-5 w-5" />
                  Shop
                </Link>
                {categories?.map((category) => (
                  <Link
                    key={category.id}
                    onMouseEnter={() => handleCategoryMouseEnter(category)}
                    onMouseLeave={handleCategoryMouseLeave}
                    to={`${baseUrl}/collection/category/${
                      category.slug || category.title.toLowerCase()
                    }`}
                    className="text-gray-800 font-medium text-sm uppercase"
                  >
                    {category.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

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

      {showOfferBar && (
        <div className="bg-button-gradient text-white text-xs md:text-base text-center py-2 text-sm flex flex-col md:flex-row justify-center items-center relative">
          <span>{floatingOffer?.header_text}</span>
          <Link
            to={floatingOffer?.link_url}
            className="ml-2 text-xs md:text-base font-medium hover:underline"
          >
            {floatingOffer?.link_text}
          </Link>
          <button
            onClick={() => setShowOfferBar(false)}
            className="absolute right-2 md:right-4 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isLocationModalOpen && (
        <LocationModal
          onClose={() => setIsLocationModalOpen(false)}
          setCurrentLocation={setCurrentLocation}
        />
      )}

      {(showLoginModal || showSignupModal) && (
        <SignInModal
          isOpen={showLoginModal || showSignupModal}
          onClose={() => {
            setShowLoginModal(false);
            setShowSignupModal(false);
          }}
          mode={showSignupModal ? "signup" : "signin"}
        />
      )}

      {/* Voice Search Popup */}
      <VoiceSearchPopup
        isListening={isListening}
        toggleListening={toggleListening}
        searchQuery={searchQuery}
      />
    </header>
  );
};

export default Header;
