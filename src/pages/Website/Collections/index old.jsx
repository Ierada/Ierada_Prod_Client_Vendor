import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Heart,
  ChevronDown,
  ChevronUp,
  FilterIcon,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { getCollectionData } from "../../../services/api.collection";
import SignInModal from "../../../components/Website/SigninModal";
import { useAppContext } from "../../../context/AppContext";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../../../services/api.wishlist";
import { IoMdArrowUp } from "react-icons/io";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { Range, getTrackBackground } from "react-range";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import common_top_banner from "/assets/banners/Commen-top-banner.png";
import debounce from "lodash/debounce";
import { Loader2 } from "lucide-react";

const bannerData = [
  {
    id: 1,
    image: common_top_banner,
  },
];

// Helper function to compare arrays
const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const CollectionsPage = () => {
  const { type, slug } = useParams();
  const { user, setTriggerHeaderCounts } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [collectionData, setCollectionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [wishlists, setWishlists] = useState([]);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const pageTopRef = useRef(null);
  const sectionRef = useRef(null); // Ref for the product section
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [paginationData, setPaginationData] = useState({
    totalPages: 1,
    totalItems: 0,
    currentPage: 1,
  });

  const [filters, setFilters] = useState({
    categories: [],
    subcategories: [],
    innersubcategories: [],
    fabric: [],
    colors: [],
    sizes: [],
    priceRange: [0, 15000],
    minRating: null,
  });

  const [sortBy, setSortBy] = useState("featured");
  const [expandedFilters, setExpandedFilters] = useState({
    categories: true,
    subcategories: false,
    innersubcategories: false,
    fabrics: false,
    colors: false,
    sizes: false,
    priceRange: false,
    rating: false,
  });

  const [categoryHierarchy, setCategoryHierarchy] = useState({
    selectedCategory: null,
    subcategories: [],
    innerSubcategories: [],
  });

  const [activeFilters, setActiveFilters] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showMobileSortModal, setShowMobileSortModal] = useState(false);

  // Debounced price range handler
  const debouncedPriceRangeChange = useRef(
    debounce((values, updateFilters) => {
      updateFilters(values);
    }, 300)
  ).current;

  const fetchCollectionData = useCallback(
    async (
      page,
      isLoadMore = false,
      filtersOverride = filters,
      currentSortBy = sortBy
    ) => {
      if (!hasMore || isLoading) return;
      setIsLoading(true);
      try {
        const queryParams = {
          page,
          limit: itemsPerPage,
          sortBy: currentSortBy,
        };

        // Only include non-empty filter arrays and other filter parameters
        // if (filtersOverride.categories.length > 0) {
        //   queryParams.categories = filtersOverride.categories.join(",");
        // }
        // if (filtersOverride.subcategories.length > 0) {
        //   queryParams.subcategories = filtersOverride.subcategories.join(",");
        // }
        // if (filtersOverride.innersubcategories.length > 0) {
        //   queryParams.innersubcategories =
        //     filtersOverride.innersubcategories.join(",");
        // }
        // if (filtersOverride.fabric.length > 0) {
        //   queryParams.fabric = filtersOverride.fabric.join(",");
        // }
        // if (filtersOverride.colors.length > 0) {
        //   queryParams.colors = filtersOverride.colors.join(",");
        // }
        // if (filtersOverride.sizes.length > 0) {
        //   queryParams.sizes = filtersOverride.sizes.join(",");
        // }
        // if (
        //   filtersOverride.priceRange[0] !== 0 ||
        //   filtersOverride.priceRange[1] !== 15000
        // ) {
        //   queryParams.minPrice = filtersOverride.priceRange[0];
        //   queryParams.maxPrice = filtersOverride.priceRange[1];
        // }
        // if (filtersOverride.minRating !== null) {
        //   queryParams.minRating = filtersOverride.minRating;
        // }

        // Use a stable reference for filters to prevent unnecessary re-renders
        const filterParams = {
          categories: filtersOverride.categories.join(",") || undefined,
          subcategories: filtersOverride.subcategories.join(",") || undefined,
          innersubcategories:
            filtersOverride.innersubcategories.join(",") || undefined,
          fabric: filtersOverride.fabric.join(",") || undefined,
          colors: filtersOverride.colors.join(",") || undefined,
          sizes: filtersOverride.sizes.join(",") || undefined,
          minPrice:
            filtersOverride.priceRange[0] !== 0
              ? filtersOverride.priceRange[0]
              : undefined,
          maxPrice:
            filtersOverride.priceRange[1] !== 15000
              ? filtersOverride.priceRange[1]
              : undefined,
          minRating: filtersOverride.minRating ?? undefined,
        };

        // Only include defined filter parameters
        Object.entries(filterParams).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams[key] = value;
          }
        });

        const response = await getCollectionData(
          type,
          slug ? slug : "all",
          queryParams
        );

        if (response?.data) {
          // Check if the previous collectionData was trending and the new response is not
          const wasPreviouslyTrending = collectionData?.isTrending === true;
          const isCurrentlyTrending = response.data.isTrending === true;

          if (
            isLoadMore &&
            collectionData?.productData &&
            !isCurrentlyTrending &&
            !wasPreviouslyTrending
          ) {
            setCollectionData((prev) => {
              const newProductData =
                isLoadMore && !response.data.isTrending && !prev?.isTrending
                  ? [...(prev.productData || []), ...response.data.productData]
                  : response.data.productData;
              const uniqueProductIds = new Set(newProductData.map((p) => p.id));
              return {
                ...prev,
                productData: newProductData,
              };
            });
          } else {
            setCollectionData(response.data);
          }
          setTotalProducts(response.data.pagination.totalItems);

          setPaginationData({
            totalPages: response.data.pagination.totalPages,
            totalItems: response.data.pagination.totalItems,
            currentPage: response.data.pagination.currentPage,
          });

          setHasMore(
            response.data.pagination.currentPage <
              response.data.pagination.totalPages
          );

          buildActiveFiltersFromState(response.data);
        }
      } catch (error) {
        console.error("Error fetching collection data:", error);
      } finally {
        setIsLoading(false);
        if (isInitialLoading) setIsInitialLoading(false);
      }
    },
    [
      type,
      slug,
      sortBy,
      itemsPerPage,
      isInitialLoading,
      hasMore,
      isLoading,
      filters,
    ]
  );

  useEffect(() => {
    // Store the previous type and slug to compare changes
    const prevType = sessionStorage.getItem("prevType");
    const prevSlug = sessionStorage.getItem("prevSlug");

    // Check if type or slug has changed
    if (
      !(prevType === "all" && type === "all") &&
      (prevType !== type || prevSlug !== slug)
    ) {
      // Update stored values
      sessionStorage.setItem("prevType", type);
      sessionStorage.setItem("prevSlug", slug);
      // Trigger full page reload
      window.location.reload();
    }
  }, [type, slug]);

  // Parse URL params on load
  useEffect(() => {
    // Reset filters to default values
    const defaultFilters = {
      categories: [],
      subcategories: [],
      innersubcategories: [],
      fabric: [],
      colors: [],
      sizes: [],
      priceRange: [0, 15000],
      minRating: null,
    };

    setFilters(defaultFilters);
    setActiveFilters([]);
    setCurrentPage(1);
    setHasMore(true);
    setCollectionData(null); // Reset collection data
    setIsInitialLoading(true);

    // Call fetchCollectionData with reset filters
    fetchCollectionData(1, false, defaultFilters);
  }, [location.search, type, slug]);

  // Update category hierarchy
  useEffect(() => {
    if (collectionData && filters.categories.length > 0) {
      const selectedCatId = filters.categories[0];
      const selectedCategory = collectionData.categories.find(
        (c) => c.id === selectedCatId
      );
      const relevantSubcategories = collectionData.subcategories.filter(
        (sc) => sc.cat_id === selectedCatId
      );
      const relevantInnerSubcategories =
        collectionData.innersubcategories.filter((isc) =>
          relevantSubcategories.some((sc) => sc.id === isc.sub_cat_id)
        );

      setCategoryHierarchy({
        selectedCategory,
        subcategories: relevantSubcategories,
        innerSubcategories: relevantInnerSubcategories,
      });
    } else {
      setCategoryHierarchy({
        selectedCategory: null,
        subcategories: [],
        innerSubcategories: [],
      });
    }
  }, [filters.categories, collectionData]);

  // Infinite scroll logic with half-section trigger
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !hasMore || isLoading) return;

      const section = sectionRef.current;
      const sectionRect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Trigger fetch when scrolled to half of the section
      // if (sectionRect.bottom <= windowHeight + windowHeight / 4) {
      //   setCurrentPage((prev) => prev + 1);
      // }
      if (sectionRect.bottom <= windowHeight + sectionRect.height / 2) {
        setCurrentPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoading]);

  // Fetch data when currentPage changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchCollectionData(currentPage, true);
    }
  }, [currentPage]);

  const toggleFilterExpansion = useCallback((filterType) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  }, []);

  const fetchWishlist = useCallback(async () => {
    if (user) {
      try {
        const response = await getWishlist(user.id);
        if (response?.data) {
          setWishlists(response.data);
          setWishlistedItems(
            new Set(response.data.map((item) => item.product_id))
          );
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const buildActiveFiltersFromState = useCallback(
    (data) => {
      if (!data) return;

      const newActiveFilters = [];

      filters.categories.forEach((catId) => {
        const category = data.categories.find((c) => c.id === catId);
        if (category) {
          newActiveFilters.push({
            type: "categories",
            value: category.title,
            original: catId,
          });
        }
      });

      filters.subcategories.forEach((subCatId) => {
        const subcategory = data.subcategories.find((sc) => sc.id === subCatId);
        if (subcategory) {
          newActiveFilters.push({
            type: "subcategories",
            value: subcategory.title,
            original: subCatId,
          });
        }
      });

      filters.colors.forEach((colorId) => {
        const color = data.colors.find((c) => c.id === colorId);
        if (color) {
          newActiveFilters.push({
            type: "colors",
            value: color.name,
            original: colorId,
          });
        }
      });

      filters.fabric.forEach((fabricId) => {
        const fab = data.fabric.find((f) => f.id === fabricId);
        if (fab) {
          newActiveFilters.push({
            type: "fabric",
            value: fab.name,
            original: fabricId,
          });
        }
      });

      if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 15000) {
        newActiveFilters.push({
          type: "priceRange",
          value: `₹${filters.priceRange[0]} - ₹${filters.priceRange[1]}`,
          original: filters.priceRange,
        });
      }

      if (filters.minRating !== null) {
        newActiveFilters.push({
          type: "minRating",
          value: `${filters.minRating} Stars & Above`,
          original: filters.minRating,
        });
      }

      setActiveFilters(newActiveFilters);
    },
    [filters]
  );

  const filteredProducts = useMemo(() => {
    return collectionData?.productData || [];
  }, [collectionData]);

  const getFilterLabel = useCallback(
    (type, value) => {
      if (!collectionData) return value?.toString() || "";

      try {
        switch (type) {
          case "categories":
            return (
              collectionData?.categories?.find((c) => c.id === value)?.title ||
              "Category"
            );
          case "subcategories":
            return (
              collectionData?.subcategories?.find((s) => s.id === value)
                ?.title || "Subcategory"
            );
          case "sizes":
            return value?.toString() || "Size";
          case "colors":
            return (
              collectionData?.colors?.find((c) => c.id === value)?.name ||
              "Color"
            );
          case "fabric":
            return (
              collectionData?.fabric?.find((f) => f.id === value)?.name ||
              "Fabric"
            );
          default:
            return value?.toString() || "";
        }
      } catch (error) {
        console.error(`Error getting filter label for ${type}:`, error);
        return value?.toString() || "";
      }
    },
    [collectionData]
  );

  const debouncedFetchCollectionData = useRef(
    debounce((page, isLoadMore, filtersOverride, currentSortBy) => {
      fetchCollectionData(page, isLoadMore, filtersOverride, currentSortBy);
    }, 300)
  ).current;

  const handleFilterChange = useCallback(
    (filterType, value) => {
      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters };

        if (filterType === "priceRange") {
          if (value[0] > value[1]) return prevFilters;
          newFilters.priceRange = value;
        } else if (filterType === "minRating") {
          newFilters.minRating = prevFilters.minRating === value ? null : value;
        } else {
          // Ensure the filter array is initialized as an empty array if undefined
          newFilters[filterType] = Array.isArray(prevFilters[filterType])
            ? [...prevFilters[filterType]]
            : [];

          // Toggle the filter value
          if (newFilters[filterType].includes(value)) {
            newFilters[filterType] = newFilters[filterType].filter(
              (item) => item !== value
            );
          } else {
            // Only add the value if it's valid (not undefined, null, or an empty array)
            if (value != null && value !== "" && !Array.isArray(value)) {
              newFilters[filterType].push(value);
            }
          }

          // Clear dependent filters only if the parent filter changes
          if (filterType === "categories") {
            const prevCategories = prevFilters.categories || [];
            const newCategories = newFilters.categories;
            if (!arraysEqual(prevCategories, newCategories)) {
              newFilters.subcategories = [];
              newFilters.innersubcategories = [];
            }
          } else if (filterType === "subcategories") {
            const prevSubcategories = prevFilters.subcategories || [];
            const newSubcategories = newFilters.subcategories;
            if (!arraysEqual(prevSubcategories, newSubcategories)) {
              newFilters.innersubcategories = [];
            }
          }
        }

        // Call API with updated filters
        debouncedFetchCollectionData(1, false, newFilters, sortBy);
        setCurrentPage(1);
        setHasMore(true);
        return newFilters;
      });
    },
    [debouncedFetchCollectionData, sortBy]
  );

  const handlePriceRangeChange = useCallback(
    (values) => {
      setFilters((prevFilters) => {
        const newFilters = {
          ...prevFilters,
          priceRange: values,
        };
        debouncedFetchCollectionData(1, false, newFilters, sortBy);
        setCurrentPage(1);
        setHasMore(true);
        return newFilters;
      });
    },
    [debouncedFetchCollectionData, sortBy]
  );

  const removeActiveFilter = useCallback(
    (filter) => {
      if (filter.type === "priceRange") {
        handleFilterChange("priceRange", [0, 15000]);
      } else {
        handleFilterChange(filter.type, filter.original);
      }
    },
    [handleFilterChange]
  );

  const clearAllFilters = useCallback(() => {
    const defaultFilters = {
      categories: [],
      subcategories: [],
      innersubcategories: [],
      sizes: [],
      fabric: [],
      colors: [],
      priceRange: [0, 15000],
      minRating: null,
    };
    setFilters(defaultFilters);
    setActiveFilters([]);
    setCurrentPage(1);
    setHasMore(true);
    debouncedFetchCollectionData(1, false, defaultFilters, sortBy);
  }, [debouncedFetchCollectionData, sortBy]);

  const ActiveFiltersSection = useCallback(() => {
    if (activeFilters.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-2 mb-4"
      >
        <span className="text-gray-600">Active Filter:</span>
        {activeFilters?.map((filter, index) => (
          <motion.span
            key={`${filter.type}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center px-3 py-1 rounded bg-black text-white"
          >
            {filter.value}
            <button
              onClick={() => removeActiveFilter(filter)}
              className="ml-2 focus:outline-none"
            >
              ×
            </button>
          </motion.span>
        ))}
        <button
          onClick={clearAllFilters}
          className="text-gray-600 underline ml-2 hover:text-gray-800"
        >
          Clear all
        </button>
      </motion.div>
    );
  }, [activeFilters, clearAllFilters, removeActiveFilter]);

  const SortDropdown = useCallback(() => {
    const [isOpen, setIsOpen] = useState(false);
    const sortOptions = [
      { value: "featured", label: "Featured" },
      { value: "price-low-high", label: "Price: Low to High" },
      { value: "price-high-low", label: "Price: High to Low" },
      { value: "newest", label: "Newest" },
    ];

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50 transition-colors"
        >
          <span>
            Sort By: {sortOptions.find((opt) => opt.value === sortBy)?.label}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && !collectionData?.isTrending && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50"
          >
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  handleSort(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                  sortBy === option.value ? "bg-gray-100 font-medium" : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    );
  }, [sortBy, collectionData?.isTrending, filters]);

  const handleSort = useCallback(
    (sortType) => {
      setSortBy(sortType);
      setCurrentPage(1);
      setHasMore(true);
      debouncedFetchCollectionData(1, false, filters, sortType);
    },
    [filters, debouncedFetchCollectionData]
  );

  const handleWishlistToggle = useCallback(
    async (productId) => {
      if (!user) {
        setShowLoginModal(true);
        return;
      }

      try {
        if (wishlistedItems.has(productId)) {
          const wishlist = wishlists.find(
            (item) => item.product_id === productId
          );
          await removeFromWishlist(wishlist.id);
          setWishlistedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        } else {
          await addToWishlist(user.id, productId);
          setWishlistedItems((prev) => new Set(prev).add(productId));
        }
        setTriggerHeaderCounts((prev) => prev + 1);
        await fetchWishlist();
      } catch (error) {
        console.error("Error toggling wishlist:", error);
      }
    },
    [user, wishlistedItems, wishlists, fetchWishlist, setTriggerHeaderCounts]
  );

  const RatingStars = useCallback(({ rating = 0 }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-amber-400 text-sm" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt key={i} className="text-amber-400 text-sm" />
        );
      } else {
        stars.push(<FaRegStar key={i} className="text-amber-400 text-sm" />);
      }
    }

    return <div className="flex">{stars}</div>;
  }, []);

  const renderProducts = useCallback(() => {
    // if (isInitialLoading) {
    //   return (
    //     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
    //       {[...Array(12)].map((_, index) => (
    //         <div
    //           key={index}
    //           className="border rounded-md overflow-hidden bg-gray-100 animate-pulse"
    //         >
    //           <div className="aspect-[400/533] w-full bg-gray-200" />
    //           <div className="p-4 space-y-2">
    //             <div className="h-4 bg-gray-200 rounded w-3/4" />
    //             <div className="h-4 bg-gray-200 rounded w-1/2" />
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   );
    // }

    if (isInitialLoading) {
      return (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-gray-500" />
            <p className="mt-4 text-gray-600 text-lg">Loading products...</p>
          </div>
        </div>
      );
    }

    if (!filteredProducts || filteredProducts.length === 0) {
      return (
        <div className="col-span-full flex justify-center items-center h-64">
          <p className="text-gray-500">
            No products found matching your criteria.
          </p>
        </div>
      );
    }

    return (
      <>
        {collectionData?.isTrending && (
          <div className="col-span-full mb-12 text-center">
            <p className="text-lg font-medium text-gray-700">
              No products found matching your criteria. Here are some trending
              products for you.
            </p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
        >
          {filteredProducts?.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group border rounded-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative">
                <div
                  className="relative aspect-[400/533] w-full overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${product.slug}`)}
                >
                  {product.media && product.media.length > 0 ? (
                    <img
                      src={product.media[0].url}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>

                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={() => handleWishlistToggle(product.id)}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow hover:bg-gray-100 transition-all"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        wishlistedItems.has(product.id)
                          ? "fill-rose-500 text-rose-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                </div>

                {product.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                    {product.discount}% OFF
                  </div>
                )}
              </div>

              <div
                className="p-4"
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                <h3 className="font-medium text-sm mb-1 truncate cursor-pointer hover:text-gray-700">
                  {product.name}
                </h3>

                <div className="flex items-center mb-2">
                  <RatingStars
                    rating={product.reviewStats?.average_rating || 0}
                  />
                  <span className="text-xs text-gray-500 ml-2">
                    ({product.reviewStats?.total_reviews || 0})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    ₹{product.discounted_price}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-gray-400 text-sm line-through">
                      ₹{product.original_price}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </>
    );
  }, [
    isInitialLoading,
    filteredProducts,
    navigate,
    handleWishlistToggle,
    wishlistedItems,
    RatingStars,
    collectionData?.isTrending,
  ]);

  const renderCategoryFilters = useCallback(
    () => (
      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => toggleFilterExpansion("categories")}
        >
          <h3 className="font-medium">Categories</h3>
          {expandedFilters.categories ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </div>

        <AnimatePresence>
          {expandedFilters.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2 ml-2 overflow-hidden"
            >
              {collectionData?.categories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`cat-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onChange={() => {
                      handleFilterChange("categories", category.id);
                      handleFilterChange("subcategories", []);
                      handleFilterChange("innersubcategories", []);
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`cat-${category.id}`} className="text-sm">
                    {category.title}
                  </label>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ),
    [
      collectionData,
      expandedFilters.categories,
      filters.categories,
      handleFilterChange,
    ]
  );

  const renderSubcategoryFilters = useCallback(() => {
    if (
      !categoryHierarchy.selectedCategory ||
      categoryHierarchy.subcategories.length === 0
    ) {
      return null;
    }

    return (
      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => toggleFilterExpansion("subcategories")}
        >
          <h3 className="font-medium">Subcategories</h3>
          {expandedFilters.subcategories ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </div>

        <AnimatePresence>
          {expandedFilters.subcategories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2 ml-2 overflow-hidden"
            >
              {categoryHierarchy.subcategories.map((subcategory) => (
                <div key={subcategory.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`subcat-${subcategory.id}`}
                    checked={filters.subcategories.includes(subcategory.id)}
                    onChange={() => {
                      handleFilterChange("subcategories", subcategory.id);
                      handleFilterChange("innersubcategories", []);
                    }}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`subcat-${subcategory.id}`}
                    className="text-sm"
                  >
                    {subcategory.title}
                  </label>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }, [
    categoryHierarchy,
    expandedFilters.subcategories,
    filters.subcategories,
    handleFilterChange,
    toggleFilterExpansion,
  ]);

  const renderInnerSubcategoryFilters = useCallback(() => {
    if (
      filters.subcategories.length === 0 ||
      categoryHierarchy.innerSubcategories.length === 0
    ) {
      return null;
    }

    const relevantInnerSubcategories =
      categoryHierarchy.innerSubcategories.filter((isc) =>
        filters.subcategories.includes(isc.sub_cat_id)
      );

    if (relevantInnerSubcategories.length === 0) return null;

    return (
      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => toggleFilterExpansion("innersubcategories")}
        >
          <h3 className="font-medium">Inner Subcategories</h3>
          {expandedFilters.innersubcategories ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </div>

        <AnimatePresence>
          {expandedFilters.innersubcategories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2 ml-2 overflow-hidden"
            >
              {relevantInnerSubcategories.map((innerSubcategory) => (
                <div key={innerSubcategory.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`innersubcat-${innerSubcategory.id}`}
                    checked={filters.innersubcategories.includes(
                      innerSubcategory.id
                    )}
                    onChange={() =>
                      handleFilterChange(
                        "innersubcategories",
                        innerSubcategory.id
                      )
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor={`innersubcat-${innerSubcategory.id}`}
                    className="text-sm"
                  >
                    {innerSubcategory.title}
                  </label>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }, [
    categoryHierarchy.innerSubcategories,
    expandedFilters.innersubcategories,
    filters.innersubcategories,
    filters.subcategories,
    handleFilterChange,
    toggleFilterExpansion,
  ]);

  const renderRatingFilters = useCallback(() => {
    const ratingOptions = [
      { value: 1, label: "1 Star & Above" },
      { value: 2, label: "2 Stars & Above" },
      { value: 3, label: "3 Stars & Above" },
      { value: 4, label: "4 Stars & Above" },
    ];

    return (
      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => toggleFilterExpansion("rating")}
        >
          <h3 className="font-medium">Rating</h3>
          {expandedFilters.rating ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </div>

        <AnimatePresence>
          {expandedFilters.rating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2 pl-2 overflow-hidden"
            >
              {ratingOptions.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`rating-${option.value}`}
                    checked={filters.minRating === option.value}
                    onChange={() =>
                      handleFilterChange("minRating", option.value)
                    }
                    className="mr-2"
                    disabled={collectionData?.isTrending}
                  />
                  <label
                    htmlFor={`rating-${option.value}`}
                    className="text-sm flex items-center"
                  >
                    <div className="flex mr-2">
                      {[...Array(option.value)].map((_, i) => (
                        <FaStar key={i} className="text-amber-400 text-sm" />
                      ))}
                      {[...Array(5 - option.value)].map((_, i) => (
                        <FaRegStar key={i} className="text-amber-400 text-sm" />
                      ))}
                    </div>
                    {option.label}
                  </label>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }, [
    filters.minRating,
    handleFilterChange,
    toggleFilterExpansion,
    collectionData?.isTrending,
  ]);

  const renderMobileFiltersSidebar = useCallback(() => {
    return (
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-0 left-0 h-full w-80 bg-white overflow-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b">
                <h3 className="text-lg font-medium">Filter Products</h3>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                {renderCategoryFilters()}
                {renderSubcategoryFilters()}
                {renderInnerSubcategoryFilters()}

                {collectionData?.colors && (
                  <div className="mb-6">
                    <div
                      className="flex justify-between items-center cursor-pointer mb-2"
                      onClick={() => toggleFilterExpansion("colors")}
                    >
                      <h3 className="font-medium">Colors</h3>
                      {expandedFilters.colors ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedFilters.colors && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-wrap gap-2 ml-2 overflow-hidden"
                        >
                          {collectionData.colors.map((color) => (
                            <button
                              key={color.id}
                              onClick={() =>
                                handleFilterChange("colors", color.id)
                              }
                              className={`px-3 py-1 border rounded-md text-sm ${
                                filters.colors.includes(color.id)
                                  ? "bg-black text-white border-black"
                                  : "bg-white text-gray-700 border-gray-300"
                              }`}
                            >
                              {color.name}
                            </button>
                            // <div
                            //   key={color.id}
                            //   className="flex flex-col items-center"
                            // >
                            //   <button
                            //     onClick={() =>
                            //       handleFilterChange("colors", color.id)
                            //     }
                            //     className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            //       filters.colors.includes(color.id)
                            //         ? "ring-2 ring-black ring-offset-1"
                            //         : ""
                            //     }`}
                            //     style={{ backgroundColor: color.code }}
                            //     title={color.name}
                            //   ></button>
                            //   <span className="text-xs mt-1">{color.name}</span>
                            // </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {collectionData?.sizes && (
                  <div className="mb-6">
                    <div
                      className="flex justify-between items-center cursor-pointer mb-2"
                      onClick={() => toggleFilterExpansion("sizes")}
                    >
                      <h3 className="font-medium">Sizes</h3>
                      {expandedFilters.sizes ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedFilters.sizes && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-wrap gap-2 ml-2 overflow-hidden"
                        >
                          {collectionData.sizes.map((size) => (
                            <button
                              key={size.id}
                              onClick={() =>
                                handleFilterChange("sizes", size.id)
                              }
                              className={`px-3 py-1 border rounded-md text-sm ${
                                filters.sizes.includes(size.id)
                                  ? "bg-black text-white border-black"
                                  : "bg-white text-gray-700 border-gray-300"
                              }`}
                            >
                              {size.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {collectionData?.fabric && (
                  <div className="mb-6">
                    <div
                      className="flex justify-between items-center cursor-pointer mb-2"
                      onClick={() => toggleFilterExpansion("fabrics")}
                    >
                      <h3 className="font-medium">Fabric</h3>
                      {expandedFilters.fabrics ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedFilters.fabrics && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-2 ml-2 overflow-hidden"
                        >
                          {collectionData.fabric.map((fabric) => (
                            <div key={fabric.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`mobile-fab-${fabric.id}`}
                                checked={filters.fabric.includes(fabric.id)}
                                onChange={() =>
                                  handleFilterChange("fabric", fabric.id)
                                }
                                className="mr-2"
                              />
                              <label
                                htmlFor={`mobile-fab-${fabric.id}`}
                                className="text-sm"
                              >
                                {fabric.name}
                              </label>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {renderRatingFilters()}

                <div className="mb-6">
                  <div
                    className="flex justify-between items-center cursor-pointer mb-2"
                    onClick={() => toggleFilterExpansion("priceRange")}
                  >
                    <h3 className="font-medium">Price Range</h3>
                    {expandedFilters.priceRange ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedFilters.priceRange && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-6 px-2 overflow-hidden"
                      >
                        <div className="flex justify-between mb-4">
                          <span className="font-medium">
                            ₹{filters.priceRange[0]}
                          </span>
                          <span className="font-medium">
                            ₹{filters.priceRange[1]}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 mb-4">
                          <div className="flex gap-4">
                            <input
                              type="number"
                              value={filters.priceRange[0]}
                              onChange={(e) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  priceRange: [
                                    Math.max(0, Number(e.target.value)),
                                    prev.priceRange[1],
                                  ],
                                }))
                              }
                              className="w-24 p-2 border rounded-md text-sm"
                              placeholder="Min Price"
                              min="0"
                              max={filters.priceRange[1]}
                            />
                            <input
                              type="number"
                              value={filters.priceRange[1]}
                              onChange={(e) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  priceRange: [
                                    prev.priceRange[0],
                                    Math.min(15000, Number(e.target.value)),
                                  ],
                                }))
                              }
                              className="w-24 p-2 border rounded-md text-sm"
                              placeholder="Max Price"
                              min={filters.priceRange[0]}
                              max="15000"
                            />
                          </div>
                          <button
                            onClick={() =>
                              handlePriceRangeChange(filters.priceRange)
                            }
                            className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
                          >
                            Apply
                          </button>
                        </div>
                        <Range
                          step={500}
                          min={0}
                          max={15000}
                          values={filters.priceRange}
                          onChange={(values) =>
                            setFilters((prev) => ({
                              ...prev,
                              priceRange: values,
                            }))
                          }
                          renderTrack={({ props, children }) => (
                            <div
                              {...props}
                              className="h-2 w-full rounded-md"
                              style={{
                                background: getTrackBackground({
                                  values: filters.priceRange,
                                  colors: ["#E5E7EB", "#000000", "#E5E7EB"],
                                  min: 0,
                                  max: 15000,
                                }),
                              }}
                            >
                              {children}
                            </div>
                          )}
                          renderThumb={({ props, index }) => (
                            <div
                              {...props}
                              className="h-5 w-5 rounded-full bg-black border-2 border-white shadow-md focus:outline-none"
                            />
                          )}
                        />
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>₹0</span>
                          <span>₹15,000+</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }, [
    isMobileSidebarOpen,
    collectionData,
    expandedFilters,
    filters,
    handleFilterChange,
    handlePriceRangeChange,
    toggleFilterExpansion,
    clearAllFilters,
  ]);

  const renderMobileSortModal = useCallback(() => {
    const sortOptions = [
      { value: "featured", label: "Featured" },
      { value: "price-low-high", label: "Price: Low to High" },
      { value: "price-high-low", label: "Price: High to Low" },
      { value: "newest", label: "Newest" },
    ];

    return (
      <AnimatePresence>
        {showMobileSortModal && !collectionData?.isTrending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center"
            onClick={() => setShowMobileSortModal(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-lg w-full max-w-md p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Sort By</h3>
                <button onClick={() => setShowMobileSortModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleSort(option.value);
                      setShowMobileSortModal(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded transition-colors ${
                      sortBy === option.value
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }, [showMobileSortModal, sortBy, handleSort, collectionData?.isTrending]);

  const BackToTopButton = useCallback(() => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const toggleVisibility = () => {
        setIsVisible(window.pageYOffset > 300);
      };

      window.addEventListener("scroll", toggleVisibility);
      return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-black text-white p-3 rounded-full shadow-lg z-50 hover:bg-gray-800 transition-colors"
            aria-label="Back to top"
          >
            <IoMdArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    );
  }, []);

  return (
    <div className="min-h-screen mt-10 bg-white" ref={pageTopRef}>
      <CommonTopBanner data={bannerData} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-center mb-8">
          {collectionData?.collectionTitle || "Products"}
        </h1>

        <div className="md:hidden flex justify-between mb-4">
          <button
            onClick={() =>
              !collectionData?.isTrending && setIsMobileSidebarOpen(true)
            }
            className="flex items-center space-x-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
          >
            <FilterIcon className="w-4 h-4" />
            <span>Filter</span>
          </button>

          <button
            onClick={() =>
              !collectionData?.isTrending && setShowMobileSortModal(true)
            }
            className="flex items-center space-x-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
          >
            <span>Sort</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <ActiveFiltersSection />

        <div className="flex flex-col md:flex-row gap-6">
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Filter Products</h2>

              {renderCategoryFilters()}
              {renderSubcategoryFilters()}
              {renderInnerSubcategoryFilters()}

              {collectionData?.colors && (
                <div className="mb-6">
                  <div
                    className="flex justify-between items-center cursor-pointer mb-2"
                    onClick={() => toggleFilterExpansion("colors")}
                  >
                    <h3 className="font-medium">Colors</h3>
                    {expandedFilters.colors ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedFilters.colors && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-wrap gap-2 ml-2 overflow-hidden"
                      >
                        {collectionData.colors.map((color) => (
                          <button
                            key={color.id}
                            onClick={() =>
                              handleFilterChange("colors", color.id)
                            }
                            className={`px-3 py-1 border rounded-md text-sm ${
                              filters.colors.includes(color.id)
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {color.name}
                          </button>
                          // <div
                          //   key={color.id}
                          //   className="flex flex-col items-center"
                          // >
                          //   <button
                          //     onClick={() =>
                          //       handleFilterChange("colors", color.id)
                          //     }
                          //     className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          //       filters.colors.includes(color.id)
                          //         ? "ring-2 ring-black ring-offset-1"
                          //         : ""
                          //     }`}
                          //     style={{ backgroundColor: color.code }}
                          //     title={color.name}
                          //   ></button>
                          //   <span className="text-xs mt-1">{color.name}</span>
                          // </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {collectionData?.sizes && (
                <div className="mb-6">
                  <div
                    className="flex justify-between items-center cursor-pointer mb-2"
                    onClick={() => toggleFilterExpansion("sizes")}
                  >
                    <h3 className="font-medium">Sizes</h3>
                    {expandedFilters.sizes ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedFilters.sizes && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-wrap gap-2 ml-2 overflow-hidden"
                      >
                        {collectionData.sizes.map((size) => (
                          <button
                            key={size.id}
                            onClick={() => handleFilterChange("sizes", size.id)}
                            className={`px-3 py-1 border rounded-md text-sm ${
                              filters.sizes.includes(size.id)
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {size.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {collectionData?.fabric && (
                <div className="mb-6">
                  <div
                    className="flex justify-between items-center cursor-pointer mb-2"
                    onClick={() => toggleFilterExpansion("fabrics")}
                  >
                    <h3 className="font-medium">Fabric</h3>
                    {expandedFilters.fabrics ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedFilters.fabrics && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2 ml-2 overflow-hidden"
                      >
                        {collectionData.fabric.map((fabric) => (
                          <div key={fabric.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`fab-${fabric.id}`}
                              checked={filters.fabric.includes(fabric.id)}
                              onChange={() =>
                                handleFilterChange("fabric", fabric.id)
                              }
                              className="mr-2"
                            />
                            <label
                              htmlFor={`fab-${fabric.id}`}
                              className="text-sm"
                            >
                              {fabric.name}
                            </label>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {renderRatingFilters()}

              <div className="mb-6">
                <div
                  className="flex justify-between items-center cursor-pointer mb-2"
                  onClick={() => toggleFilterExpansion("priceRange")}
                >
                  <h3 className="font-medium">Price Range</h3>
                  {expandedFilters.priceRange ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>

                <AnimatePresence>
                  {expandedFilters.priceRange && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-6 px-2 overflow-hidden"
                    >
                      <div className="flex justify-between mb-4">
                        <span className="font-medium">
                          ₹{filters.priceRange[0]}
                        </span>
                        <span className="font-medium">
                          ₹{filters.priceRange[1]}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex gap-4">
                          <input
                            type="number"
                            value={filters.priceRange[0]}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                priceRange: [
                                  Math.max(0, Number(e.target.value)),
                                  prev.priceRange[1],
                                ],
                              }))
                            }
                            className="w-24 p-2 border rounded-md text-sm"
                            placeholder="Min Price"
                            min="0"
                            max={filters.priceRange[1]}
                          />
                          <input
                            type="number"
                            value={filters.priceRange[1]}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                priceRange: [
                                  prev.priceRange[0],
                                  Math.min(15000, Number(e.target.value)),
                                ],
                              }))
                            }
                            className="w-24 p-2 border rounded-md text-sm"
                            placeholder="Max Price"
                            min={filters.priceRange[0]}
                            max="15000"
                          />
                        </div>
                        <button
                          onClick={() =>
                            handlePriceRangeChange(filters.priceRange)
                          }
                          className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
                        >
                          Apply
                        </button>
                      </div>
                      <Range
                        step={500}
                        min={0}
                        max={15000}
                        values={filters.priceRange}
                        onChange={(values) =>
                          setFilters((prev) => ({
                            ...prev,
                            priceRange: values,
                          }))
                        }
                        renderTrack={({ props, children }) => (
                          <div
                            {...props}
                            className="h-2 w-full rounded-md"
                            style={{
                              background: getTrackBackground({
                                values: filters.priceRange,
                                colors: ["#E5E7EB", "#000000", "#E5E7EB"],
                                min: 0,
                                max: 15000,
                              }),
                            }}
                          >
                            {children}
                          </div>
                        )}
                        renderThumb={({ props, index }) => (
                          <div
                            {...props}
                            className="h-5 w-5 rounded-full bg-black border-2 border-white shadow-md focus:outline-none"
                          />
                        )}
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>₹0</span>
                        <span>₹15,000+</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex-1" ref={sectionRef}>
            <div className="hidden md:flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {paginationData.totalItems} Products found
              </p>
              <SortDropdown />
            </div>

            {renderProducts()}

            {isLoading && !isInitialLoading && !collectionData?.isTrending && (
              <div className="col-span-full flex justify-center items-center h-16 mt-4">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                <p className="ml-2 text-gray-500">Loading more products...</p>
              </div>
            )}

            {!hasMore && filteredProducts.length > 0 && (
              <p className="text-center py-8 text-gray-600 text-lg font-medium">
                You've seen all our amazing products!
              </p>
            )}
          </div>
        </div>
      </div>

      {renderMobileFiltersSidebar()}
      {renderMobileSortModal()}
      <BackToTopButton />

      {showLoginModal && (
        <SignInModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default CollectionsPage;
