import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  FaCalendarAlt,
  FaCheck,
  FaHeart,
  FaPercent,
  FaRegHeart,
  FaRegPlayCircle,
  FaStar,
  FaFacebook,
  FaTelegram,
  FaLinkedin,
  FaInstagram,
  FaShareAlt,
  FaWhatsapp,
} from "react-icons/fa";
import {
  MdOutlineCalendarMonth,
  MdStar,
  MdStarBorder,
  MdStarHalf,
} from "react-icons/md";
import {
  IoIosArrowDown,
  IoIosArrowUp,
  IoMdArrowForward,
  IoMdCheckmarkCircleOutline,
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdInformationCircle,
} from "react-icons/io";
import { IoArrowForward, IoShareSocialOutline } from "react-icons/io5";
import { CiLocationOn } from "react-icons/ci";
import { PencilLine } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getProductBySlug } from "../../../services/api.product";
import { addComboToCart, addToCart, buyNow } from "../../../services/api.cart";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../../../services/api.wishlist";
import ProductSlider from "../../../components/Website/ProductSlider";
import config from "../../../config/config";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import SignInModal from "../../../components/Website/SigninModal";
import { ProductNotFound, ProductPageSkeleton } from "./skeleton";
import Reviews from "../../../components/Website/Reviews";
import AddReviewModal from "../../../components/Website/AddReviewModal";
import BestComboSection from "../../../components/Website/BestComboSection";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";
import SizeGuideModal from "../../../components/Website/SizeChartModal";
import ScrollToTop from "../../../components/Common/ScrollToTop";
import { getUserIdentifier } from "../../../utils/userIdentifier";
import { setTrackProductView } from "../../../services/api.viewedProduct";
import { Dialog } from "@headlessui/react";
import MediaModal from "../../../components/Website/MediaModal";
import { useAppContext } from "../../../context/AppContext";
import {
  notifyOnFail,
  notifyOnSuccess,
  notifyOnWarning,
} from "../../../utils/notification/toast";
import { Helmet } from "react-helmet-async";

export default function ProductPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const variationId = searchParams.get("variation");
  const { user, setTriggerHeaderCounts, setOrderSummary } = useAppContext();

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState("General info");
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [filterType, setFilterType] = useState("Most Recent");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [isProductPageUpdated, setIsProductPageUpdated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSizeModalOpen, setIsSizModalOpen] = useState(false);
  const [wishlists, setWishlists] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);

  const handleMouseMove = (e) => {
    if (!zoomRef.current) return;

    const { left, top, width, height } =
      zoomRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  const tabSectionRef = useRef(null);

  const scrollToTabSection = () => {
    tabSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePincodeInputChange = (e) => {
    setPinCode(e.target.value);
  };

  const handlePincodeCheck = () => {
    console.log("Checking PIN code:", pinCode);
  };

  const navigate = useNavigate();

  const filteredReviews = useMemo(() => {
    switch (filterType) {
      case "Most Recent":
        return [...reviews].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      case "Most Helpful":
        return [...reviews]
          .filter((review) => review.review >= 4)
          .sort((a, b) => b.helpfulVotes - a.helpfulVotes);
      case "Lowest Rating":
        return [...reviews].sort((a, b) => a.review - b.review);
      case "Pictures First":
        return [...reviews].sort(
          (a, b) => (b.images?.length || 0) - (a.images?.length || 0)
        );
      default:
        return reviews;
    }
  }, [filterType, reviews]);

  const handleShowMore = () => {
    const reviews = filteredReviews;
    if (visibleReviews < reviews.length) {
      setVisibleReviews(reviews.length);
    } else {
      setVisibleReviews(5);
    }
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await getProductBySlug(
          slug,
          variationId ? parseInt(variationId) : null
        );
        if (response?.status === 1) {
          setProductData(response.data);
          trackProductView(response.data?.id);

          if (response.data.variations?.length > 0) {
            const firstVariation = response.data.variations[0];
            setSelectedVariation(firstVariation);
            if (firstVariation.sizes?.length > 0) {
              setSelectedSize(firstVariation.sizes[0]);
            }
          }

          if (
            response.data.is_variation &&
            response.data.variations?.size &&
            response.data.variations.size.length > 0
          ) {
            setSelectedSize(response.data.variations.size[0]);
          }

          if (response.data.reviews) {
            setReviews(response.data.reviews);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug, isProductPageUpdated]);

  // pre-select specific variation if provided
  useEffect(() => {
    if (
      productData &&
      variationId &&
      productData.is_variation &&
      productData.variations
    ) {
      let targetGroup = null;
      let targetSize = null;
      for (const group of productData.variations) {
        const size = group.sizes.find((s) => s.variation_id == variationId);
        if (size) {
          targetGroup = group;
          targetSize = size;
          break;
        }
      }
      if (targetGroup && targetSize) {
        setSelectedVariation(targetGroup);
        setSelectedSize(targetSize);
      }
    }
  }, [productData, variationId]);

  const trackProductView = async (product_id) => {
    const userId = getUserIdentifier();

    try {
      const response = setTrackProductView({
        userId,
        productId: product_id,
      });
    } catch (error) {
      console.error("Failed to track product view:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const mediaList = useMemo(() => {
    if (!productData) return [];

    if (selectedVariation) {
      const variationMedia = productData.variationMedia.filter(
        (media) => media.color_id === selectedVariation.color_id
      );

      return variationMedia.length > 0 ? variationMedia : productData.media;
    }

    return productData.media;
  }, [productData, selectedVariation]);

  const checkWishlistStatus = async () => {
    if (!user) {
      setIsWishlisted(false);
      return;
    }

    try {
      const response = await getWishlist(user.id);
      if (response?.data) {
        const isInWishlist = response.data.some(
          (item) => item.product_id === productData?.id
        );
        setWishlists(response.data);
        setIsWishlisted(isInWishlist);
      } else {
        setWishlists([]);
        setIsWishlisted(false);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  useEffect(() => {
    if (productData) {
      checkWishlistStatus();
    }
  }, [user, productData]);

  const handleWishlistToggle = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        const wishlist = wishlists.find(
          (item) => item.product_id === productData.id
        );
        const response = await removeFromWishlist(wishlist.id);
        if (response) {
          setIsWishlisted(false);
          checkWishlistStatus();
        }
      } else {
        const response = await addToWishlist(user.id, productData.id);
        if (response) {
          setIsWishlisted(true);
          checkWishlistStatus();
        }
      }
      setTriggerHeaderCounts((prev) => !prev);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      notifyOnFail("Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleVariationSelect = (variation) => {
    setSelectedVariation(variation);
    if (variation.sizes?.length > 0) {
      setSelectedSize(variation.sizes[0]);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const currentPrice = selectedSize
    ? {
        original: Math.round(selectedSize.original_price),
        discounted: Math.round(selectedSize.discounted_price),
        discount: Math.round(
          ((selectedSize.original_price - selectedSize.discounted_price) /
            selectedSize.original_price) *
            100
        ),
      }
    : {
        original: Math.round(productData?.original_price),
        discounted: Math.round(productData?.discounted_price),
        discount: Math.round(
          ((productData?.original_price - productData?.discounted_price) /
            productData?.original_price) *
            100
        ),
      };

  const currentStock = selectedSize ? selectedSize.stock : productData?.stock;
  const isLowStock = currentStock > 0 && currentStock < 10;

  const handleAddToCart = async (type) => {
    const userToken = Cookies.get(`${config.BRAND_NAME}CustomerToken`);

    if (userToken) {
      const userData = jwtDecode(userToken);

      setAddingToCart(true);

      try {
        const cartData = {
          product_id: productData.id,
          qty: 1,
          variation_id: selectedSize?.variation_id
            ? selectedSize.variation_id
            : selectedVariation?.id
            ? selectedVariation.id
            : null,
        };

        if (type === "add") {
          const response = await addToCart(userData.id, cartData);
          if (response && response.status === 1) {
            checkWishlistStatus();
            setTriggerHeaderCounts((prev) => !prev);
          }
        } else if (type === "buy") {
          const response = await buyNow(userData.id, cartData);
          if (response && response.status === 1) {
            setOrderSummary({
              selectedItems: [],
            });
            navigate(`${config.VITE_BASE_WEBSITE_URL}/checkout`);
          }
        }

        // const response = await addToCart(userData.id, cartData);
        // if (response && response.status === 1) {
        //   if (type === "add") {
        //     checkWishlistStatus();
        //     setTriggerHeaderCounts((prev) => !prev);
        //   }
        //   if (type === "buy") {
        //     navigate(`${config.VITE_BASE_WEBSITE_URL}/checkout`);
        //   }
        // }
      } catch (error) {
        console.error("Error adding to cart:", error);
      } finally {
        setAddingToCart(false);
      }
    } else {
      setShowLoginModal(true);
      return;
    }
  };

  const handleAddComboToCart = async (selectedProducts) => {
    const userToken = Cookies.get(`${config.BRAND_NAME}CustomerToken`);

    if (!userToken) {
      setShowLoginModal(true);
      return;
    }

    const userData = jwtDecode(userToken);
    setAddingToCart(true);

    try {
      const cartData = {
        products: selectedProducts,
        qty: 1,
      };

      const response = await addComboToCart(userData.id, cartData);

      if (response && response.status === 1) {
        notifyOnSuccess(response.message);
        navigate(`${config.VITE_BASE_WEBSITE_URL}/cart`);
      } else {
        notifyOnFail(response.message || "Failed to add combo to cart");
      }
    } catch (error) {
      console.error("Error adding combo to cart:", error);
      notifyOnFail(error.message || "Failed to add combo to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBreadcrumbNavigation = (path, slug) => {
    navigate(`${config.VITE_BASE_WEBSITE_URL}/${path}/${slug}`);
  };

  const StarRating = ({ rating }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<MdStar key={i} className="text-yellow-500" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<MdStarHalf key={i} className="text-yellow-500" />);
      } else {
        stars.push(<MdStarBorder key={i} className="text-gray-300" />);
      }
    }

    return <div className="flex items-center text-xl">{stars}</div>;
  };

  const handleShare = (platform) => {
    const shareText = `${productData?.name} - Check out this product!`;
    const currentUrl = window.location.href;
    const imageUrl =
      mediaList?.[0]?.url || "https://via.placeholder.com/1200x630";
    let shareLink = "";

    switch (platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(
          shareText + " " + currentUrl
        )}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          currentUrl
        )}&picture=${encodeURIComponent(
          imageUrl
        )}&description=${encodeURIComponent(shareText)}`;
        break;
      case "telegram":
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(
          currentUrl
        )}&text=${encodeURIComponent(shareText)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
          currentUrl
        )}&title=${encodeURIComponent(
          productData?.name
        )}&summary=${encodeURIComponent(shareText)}&source=${encodeURIComponent(
          config.BRAND_NAME || "Ierada"
        )}`;
        break;
      case "instagram":
        // Instagram doesn't support direct sharing via URL, so copy the link
        navigator.clipboard.writeText(currentUrl);
        notifyOnSuccess("Link copied! Paste it in Instagram to share.");
        setIsShareDropdownOpen(false);
        return;
      case "native":
        if (navigator.share) {
          navigator
            .share({
              title: productData?.name,
              text: shareText,
              url: currentUrl,
            })
            .catch((error) => console.error("Error sharing:", error));
        } else {
          notifyOnWarning("Web Share API not supported on this device.");
        }
        setIsShareDropdownOpen(false);
        return;
      default:
        return;
    }

    window.open(shareLink, "_blank");
    setIsShareDropdownOpen(false);
  };

  const tabs = ["General info", "Product Details", "Warranty Information"];
  const handleTabClick = (tab) => setActiveTab(tab);

  if (loading) return <ProductPageSkeleton />;
  if (!productData) return <ProductNotFound />;

  return (
    <>
      <Helmet>
        <title>{productData?.name || "Product Page"}</title>
        <meta
          name="description"
          content={
            productData?.meta?.description ||
            "Explore this product on our website"
          }
        />
        <meta
          property="og:title"
          content={
            productData?.meta?.title || productData?.name || "Product Page"
          }
        />
        <meta
          property="og:description"
          content={
            productData?.meta?.description ||
            "Explore this product on our website"
          }
        />
        <meta
          property="og:image"
          content={
            mediaList?.[0]?.url || "https://via.placeholder.com/1200x630"
          }
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:url"
          content={`${config.VITE_BASE_WEBSITE_URL}/product/${slug}`}
        />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content={config.BRAND_NAME || "Ierada"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={
            productData?.meta?.title || productData?.name || "Product Page"
          }
        />
        <meta
          name="twitter:description"
          content={
            productData?.meta?.description ||
            "Explore this product on our website"
          }
        />
        <meta
          name="twitter:image"
          content={
            mediaList?.[0]?.url || "https://via.placeholder.com/1200x630"
          }
        />
      </Helmet>

      <main className="mb-10 mx-4 lg:mx-20 xl:mx-24 mt-4">
        <section className="md:mt-10">
          {/* Enhanced Breadcrumb */}
          {/* <nav aria-label="Breadcrumb" className="my-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="hover:text-black transition-colors hover:underline"
                >
                  Home
                </button>
              </li>
              <li>/</li>
              <li>
                <button
                  onClick={() =>
                    handleBreadcrumbNavigation("collection", "all")
                  }
                  className="hover:text-black transition-colors hover:underline"
                >
                  Shop
                </button>
              </li>
              <li>/</li>
              <li>
                <button
                  onClick={() =>
                    handleBreadcrumbNavigation(
                      "collection/category",
                      productData.category.slug
                    )
                  }
                  className="hover:text-black transition-colors hover:underline"
                >
                  {productData?.category?.title}
                </button>
              </li>
              <li>/</li>
              <li>
                <button
                  onClick={() =>
                    handleBreadcrumbNavigation(
                      "collection/subcategory",
                      productData.subcategory.slug
                    )
                  }
                  className="hover:text-black transition-colors hover:underline"
                >
                  {productData?.subcategory?.title}
                </button>
              </li>
              <li>/</li>
              <li className="text-gray-800 font-medium truncate max-w-[200px]">
                {productData?.name}
              </li>
            </ol>
          </nav> */}

          <div className="flex flex-col lg:flex-row lg:justify-between gap-8 py-4">
            {/* Product Images Section */}
            <div className="w-full lg:w-1/2 xl:w-3/5 flex flex-col space-y-6">
              {/* Images gallery */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Thumbnails */}
                <div className="relative flex md:flex-col gap-2 order-2 md:order-1">
                  <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:h-[600px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded">
                    {mediaList?.map((media, index) => (
                      // Need to add a border of gradient to the side image boxes.
                      <button
                        key={index}
                        onClick={() => setActiveMediaIndex(index)}
                        onMouseEnter={() => setActiveMediaIndex(index)}
                        className={`relative flex-shrink-0 w-16 md:w-20 aspect-square border-2 rounded-lg transition-all duration-200
                        ${
                          activeMediaIndex === index
                            ? "border-black ring-2 ring-blue-500"
                            : "border-gray-300 hover:border-gray-500"
                        }`}
                      >
                        {media.type === "video" ? (
                          <div className="relative w-full h-full">
                            <video
                              src={media.url}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                              <FaRegPlayCircle className="text-white text-xl" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={media.url}
                            alt={`Product view ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Media */}
                {/* Main Media with Side Zoom */}
                <div className="w-full order-1 md:order-2 relative flex">
                  {/* Main Image Container */}
                  {/* Need to add a border of gradient to the side image boxes. */}
                  <div
                    className="w-full h-[500px] md:h-[600px] bg-gray-50 rounded-xl overflow-hidden cursor-pointer shadow-sm border border-gray-200"
                    onClick={() => setShowMediaModal(true)}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setZoomVisible(true)}
                    onMouseLeave={() => setZoomVisible(false)}
                    ref={zoomRef}
                  >
                    {mediaList[activeMediaIndex]?.type === "video" ? (
                      <div className="relative w-full h-full">
                        <video
                          src={mediaList[activeMediaIndex]?.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaRegPlayCircle className="text-white text-4xl bg-black bg-opacity-40 rounded-full p-2" />
                        </div>
                      </div>
                    ) : mediaList[activeMediaIndex]?.type === "image" ? (
                      <div className="relative w-full h-full">
                        <img
                          src={mediaList[activeMediaIndex]?.url}
                          alt={productData.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-xl">
                        <span className="text-gray-400">
                          No image available
                        </span>
                      </div>
                    )}

                    {/* Navigation Arrows */}
                    {mediaList.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMediaIndex((prev) =>
                              prev === 0 ? mediaList.length - 1 : prev - 1
                            );
                          }}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow-md hover:bg-opacity-100 focus:outline-none z-10"
                          aria-label="Previous image"
                        >
                          <IoIosArrowBack className="text-gray-800 text-xl" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMediaIndex((prev) =>
                              prev === mediaList.length - 1 ? 0 : prev + 1
                            );
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow-md hover:bg-opacity-100 focus:outline-none z-10"
                          aria-label="Next image"
                        >
                          <IoIosArrowForward className="text-gray-800 text-xl" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Amazon-style Zoom Container - Positioned to the side */}
                  {zoomVisible &&
                    mediaList[activeMediaIndex]?.type === "image" && (
                      <div
                        className="hidden lg:block absolute left-full ml-8 w-[400px] h-[400px] border border-gray-200 rounded-lg shadow-xl overflow-hidden bg-white z-20"
                        style={{
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      >
                        <div
                          className="w-full h-full bg-no-repeat"
                          style={{
                            backgroundImage: `url(${mediaList[activeMediaIndex]?.url})`,
                            backgroundSize: `${zoomLevel * 100}%`,
                            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          }}
                        />
                      </div>
                    )}
                </div>
              </div>

              {/* Product specifications section */}
              {/* <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"> */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-[#000000]">
                    Product Specifications
                  </h3>
                  <button
                    className="text-[#000000] hover:text-blue-800 font-medium flex items-center"
                    onClick={scrollToTabSection}
                  >
                    Read More
                    <IoMdArrowForward className="ml-1" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    {/* <thead className="bg-gray-50"> */}
                    <thead>
                      <tr>
                        <th className="px-4 py-3 border-b font-medium text-left text-[#000000]">
                          Feature
                        </th>
                        <th className="px-4 py-3 border-b font-medium text-left text-[#000000]">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productData?.specifications?.map((feature, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-gray-500">
                            {feature.feature}
                          </td>
                          <td className="px-4 py-3 text-[#000000]">
                            {feature.specification}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Product Info Section */}
            <div className="lg:w-1/2 xl:w-3/5 space-y-6">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl md:text-2xl font-lato font-bold text-gray-900 ">
                      {productData?.name}
                    </h1>
                    {/* Uncomment it later */}
                    {/* This is the code for rating filter */}
                    {/* <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <StarRating
                          rating={
                            parseFloat(
                              productData?.reviewStats?.average_rating
                            ) || 0
                          }
                        />
                        <span className="text-sm text-gray-600 ml-1">
                          ({productData?.reviewStats?.total_reviews} Reviews)
                        </span>
                      </div>
                      {currentStock > 0 ? (
                        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                          <IoMdCheckmarkCircleOutline className="text-green-500" />
                          <span className="text-sm text-gray-600">
                            {isLowStock
                              ? `Only ${currentStock} left`
                              : "In Stock"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
                          <span className="text-sm text-red-600">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div> */}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsShareDropdownOpen(!isShareDropdownOpen)
                      }
                      className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
                      aria-label="Share product"
                    >
                      <FaShareAlt size={20} />
                    </button>
                    {isShareDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => handleShare("whatsapp")}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaWhatsapp size={20} className="text-green-500" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleShare("facebook")}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaFacebook size={20} className="text-blue-600" />
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare("telegram")}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaTelegram size={20} className="text-blue-400" />
                          Telegram
                        </button>
                        <button
                          onClick={() => handleShare("linkedin")}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaLinkedin size={20} className="text-blue-700" />
                          LinkedIn
                        </button>
                        <button
                          onClick={() => handleShare("instagram")}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaInstagram size={20} className="text-pink-500" />
                          Instagram
                        </button>
                        {navigator.share && (
                          <button
                            onClick={() => handleShare("native")}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FaShareAlt size={20} className="text-gray-600" />
                            More
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl md:text-3xl text-gray-900">
                      ₹{currentPrice.discounted}
                    </span>
                    <span className="text-sm text-[#000000] line-through">
                      ₹{currentPrice.original}
                    </span>
                    <span className="text-sm bg-gradient-to-r from-[#FFB700] to-[#FF3B00] bg-clip-text text-transparent">
                      ({currentPrice.discount}% OFF)
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Inclusive of all taxes
                  </span>
                </div>

                {/* {productData?.user?.shop_name && (
                  <div className="flex gap-3 items-center">
                    {productData?.user?.avatar && (
                      <img
                        src={productData?.user?.avatar}
                        alt="Seller"
                        className="rounded-full w-10 h-10 border-2 border-gray-200"
                      />
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Sold by</p>
                      <p className="font-medium">
                        {productData?.user?.shop_name}
                      </p>
                    </div>
                  </div>
                )} */}

                {/* {productData?.fabric?.name && (
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-700">Fabric:</span>
                    <button
                      onClick={() =>
                        handleBreadcrumbNavigation(
                          "collection/fabric",
                          productData?.fabric?.slug
                        )
                      }
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {productData?.fabric?.name}
                    </button>
                  </div>
                )} */}
              </div>

              {/* Variations Section */}
              {productData.variations?.length > 0 && (
                <div className="space-y-6 border-t border-gray-200 pt-4">
                  {/* Color Selection */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-800">
                        Color:{" "}
                        <span className="font-semibold">
                          {selectedVariation?.color_name}
                        </span>
                      </p>
                      <button
                        onClick={() => {
                          productData.inner_subcategory?.size_chart_image
                            ? setIsSizModalOpen(true)
                            : notifyOnWarning("Size chart is not available");
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productData?.variations?.map((variation, index) => (
                        <button
                          key={index}
                          onClick={() => handleVariationSelect(variation)}
                          disabled={
                            !variation.sizes.some((size) => size.stock > 0)
                          }
                          className={`relative w-10 h-10 md:h-12 w-12 rounded-md border-2 flex items-center justify-center
                          ${
                            selectedVariation?.id === variation.id
                              ? "ring-2 ring-blue-500 ring-offset-2 border-black"
                              : "border-gray-300 hover:border-gray-500"
                          } ${
                            !variation.sizes.some((size) => size.stock > 0)
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          title={variation.color_name}
                        >
                          <div
                            className="w-10 h-10 md:w-12 h-12 rounded-md"
                            style={{ backgroundColor: variation.color_code }}
                          />
                          {selectedVariation?.id === variation.id && (
                            <FaCheck className="absolute bottom-0 right-0 bg-white rounded-full p-1 text-black border border-gray-300" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Selection */}
                  {selectedVariation?.sizes?.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-medium text-gray-800">Select Size</p>
                      <div className="flex flex-wrap gap-3">
                        {selectedVariation?.sizes?.map((size, index) => (
                          <div className="bg-gradient-to-r from-[#FFB700] to-[#FF3B00] p-[0.7px] rounded-lg">
                            <button
                              key={index}
                              onClick={() => handleSizeSelect(size)}
                              disabled={size.stock === 0}
                              className={`p-2 min-w-[50px] rounded-lg text-md font-medium transition-all duration-200 border-none
                            ${
                              selectedSize?.size_id === size.size_id
                                ? "bg-gradient-to-r from-[#FFB700] to-[#FF3B00] text-white"
                                : "bg-white text-gray-900 hover:border-gray-500 hover:bg-gradient-to-r from-[#FFB700] to-[#FF3B00]"
                            } ${
                              size.stock === 0
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            >
                              {size.size_name}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Options */}
              <>
                <h3 className="text-lg text-gray-900 font-bold">
                  Delivery Options
                </h3>

                <div className="relative w-full">
                  <label htmlFor="pincode-input" className="sr-only">
                    Enter your PIN code
                  </label>

                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CiLocationOn className="text-gray-900 text-xl" />
                  </div>

                  <input
                    id="pincode-input"
                    type="text"
                    placeholder="Enter your PIN code"
                    value={pinCode}
                    onChange={handlePincodeInputChange}
                    maxLength={6}
                    className="w-full py-3 pl-10 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={handlePincodeCheck}
                    // className="absolute right-1 top-1/2 -translate-y-1/2 px-5 py-2 text-sm text-gray-800 hover:text-black rounded-full focus:outline-none"
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-5 py-2 text-sm bg-gradient-to-r from-[#FFB700] to-[#FF3B00] bg-clip-text text-transparent hover:text-md focus:outline-none"
                  >
                    Check
                  </button>
                </div>
              </>

              {/* Offers */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FaPercent className="text-yellow-600" /> OFFERS FOR YOU
                </h3>
                <ul className="space-y-2">
                  {productData?.offers?.map((offer, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{offer}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading || productData.stock === 0}
                  className={`flex items-center justify-center p-3 border border-gray-300 rounded-lg text-2xl transition-colors
                  ${wishlistLoading ? "opacity-70" : "hover:bg-gray-100"}
                  ${isWishlisted ? "text-red-500" : "text-gray-600"}`}
                  aria-label={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  {wishlistLoading ? (
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                  ) : isWishlisted ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
                <div className="flex-1 flex-col sm:flex-row gap-3 hidden sm:flex">
                  <div className="flex-1 bg-gradient-to-r from-[#FFB700] to-[#FF3B00] p-[1px] rounded-lg">
                    <button
                      onClick={() => handleAddToCart("add")}
                      disabled={addingToCart || productData.stock === 0}
                      className={`uppercase w-full flex items-center justify-center gap-2 px-6 py-3 border-none rounded-lg text-base md:text-lg font-bold transition-colors
                    ${
                      addingToCart || productData.stock === 0
                        ? "bg-gray-100 text-gray-400 border-gray-300"
                        : "bg-white"
                    }`}
                    >
                      {addingToCart ? (
                        "Adding to Cart..."
                      ) : (
                        <div className="bg-gradient-to-r from-[#FFB700] to-[#FF3B00] bg-clip-text text-transparent">
                          Add to Cart
                        </div>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCart("buy")}
                    disabled={addingToCart || productData.stock === 0}
                    className={`uppercase flex-1 items-center justify-center gap-2 px-6 py-3 text-base rounded-lg md:text-lg font-bold text-white transition-colors
                    ${
                      addingToCart || productData.stock === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#FFB700] to-[#FF3B00] text-white"
                    } hidden sm:flex`}
                  >
                    Buy Now
                  </button>
                </div>

                <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4">
                  <button
                    onClick={() => handleAddToCart("buy")}
                    disabled={addingToCart || productData.stock === 0}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white transition-colors rounded
                    ${
                      addingToCart || productData.stock === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#f47954] hover:bg-[#e66843]"
                    }`}
                  >
                    {addingToCart ? (
                      "Adding..."
                    ) : (
                      <>
                        Buy Now <IoMdArrowForward />
                      </>
                    )}
                  </button>
                </div>
              </div>
              {productData.stock < 10 && productData.stock !== 0 ? (
                <div className="flex items-center ">
                  <IoMdInformationCircle className="text-[#FF7B00] mr-2 text-md" />
                  <p className="text-gray-900 font-medium">
                    only {productData.stock} left.
                  </p>
                </div>
              ) : productData.stock === 0 ? (
                <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                  <p className="text-red-600 text-center font-medium">
                    This product is currently out of stock
                  </p>
                </div>
              ) : null}

              {/* Return Policy */}
              {productData?.subcategory?.is_returnable ? (
                <div className="flex items-center gap-3 bg-blue-100 p-3 rounded-lg">
                  <MdOutlineCalendarMonth className="text-gray-900 text-xl flex-shrink-0" />
                  <span className="text-gray-900">
                    {productData?.subcategory?.is_instant_return ? (
                      <div>
                        Instant returns available with{" "}
                        <a
                          href={`${productData?.product_return_policy_link}`}
                          className="underline"
                        >
                          T&C
                        </a>{" "}
                        applys
                      </div>
                    ) : (
                      <div>
                        7 days easy return or exchange with{" "}
                        <a
                          href={`${productData?.product_return_policy_link}`}
                          className="underline"
                        >
                          T&C
                        </a>{" "}
                        applys
                      </div>
                    )}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section ref={tabSectionRef} className="py-4 my-6 md:py-6 md:my-10">
          {/* Tab Navigation - Now properly responsive */}
          <nav className="relative border-t border-b border-gray-300 py-3">
            <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
              <div className="flex min-w-max w-full justify-between gap-2 px-1">
                {tabs?.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => handleTabClick(tab)}
                    className={`flex-shrink-0 flex items-center space-x-1 border-b-2 pb-1 px-1 bg-white focus:outline-none ${
                      activeTab === tab
                        ? "border-black font-bold"
                        : "border-transparent hover:border-gray-400"
                    }`}
                  >
                    <span className="text-sm whitespace-nowrap">{tab}</span>
                    {activeTab === tab ? (
                      <IoIosArrowUp className="flex-shrink-0" />
                    ) : (
                      <IoIosArrowDown className="flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </nav>
          <div className="p-4 md:p-6 bg-white">
            {activeTab === "General info" && (
              <div
                className="prose max-w-none text-gray-700 text-sm md:text-base"
                dangerouslySetInnerHTML={{
                  __html:
                    productData.general_info || "No description available",
                }}
              />
            )}
            {activeTab === "Product Details" && (
              <div
                className="prose max-w-none text-gray-700 text-sm md:text-base"
                dangerouslySetInnerHTML={{
                  __html:
                    productData.product_details || "No description available",
                }}
              />
            )}
            {activeTab === "Warranty Information" && (
              <div
                className="prose max-w-none text-gray-700 text-sm md:text-base"
                dangerouslySetInnerHTML={{
                  __html:
                    productData.warranty_info || "No description available",
                }}
              />
            )}
          </div>
        </section>

        <BestComboSection
          comboProducts={productData?.comboProducts}
          handleAddComboToCart={handleAddComboToCart}
          addingToCart={addingToCart}
          currentProduct={productData}
        />

        {productData.related_products &&
          productData.related_products.length > 0 && (
            <section className="px-4 space-y-4 my-16">
              <div className="w-full justify-center items-center flex py-8">
                <img src={left_decor} alt="" className="hidden md:block" />
                <h2 className="text-3xl md:text-4xl font-bold text-center mx-4">
                  Related Products
                </h2>
                <img src={right_decor} alt="" className="hidden md:block" />
              </div>
              <div className="space-y-14">
                <ProductSlider products={productData.related_products} />
              </div>
            </section>
          )}

        {productData?.monthly_offers &&
          productData?.monthly_offers?.length > 0 && (
            <section className="px-4 space-y-4 my-16">
              <div className="w-full justify-center items-center flex py-8">
                <img src={left_decor} alt="" className="hidden md:block" />
                <h2 className="text-3xl md:text-4xl font-bold text-center mx-4">
                  Monthly Offers
                </h2>
                <img src={right_decor} alt="" className="hidden md:block" />
              </div>
              <div className="space-y-14">
                <ProductSlider products={productData.monthly_offers} />
              </div>
            </section>
          )}

        {productData?.featured_collections &&
          productData?.featured_collections?.length > 0 && (
            <section className="px-4 space-y-4 my-16">
              <div className="w-full justify-center items-center flex py-8">
                <img src={left_decor} alt="" className="hidden md:block" />
                <h2 className="text-3xl md:text-4xl font-bold text-center mx-4">
                  Featured Collections
                </h2>
                <img src={right_decor} alt="" className="hidden md:block" />
              </div>
              <div className="space-y-14">
                <ProductSlider products={productData?.featured_collections} />
              </div>
            </section>
          )}

        <section className="my-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Customer Reviews
                </h2>
                <p className="text-gray-600 mt-1">
                  {reviews.length} reviews for this product
                </p>
              </div>
              {/* {Cookies.get(`${config.BRAND_NAME}CustomerToken`) && (
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  <PencilLine size={18} />
                  <span>Leave a Review</span>
                </button>
              )} */}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-gray-600">
                Showing 1-
                {reviews.length < visibleReviews
                  ? reviews.length
                  : visibleReviews}{" "}
                of {reviews.length} reviews
              </p>
              <div className="flex items-center">
                <label
                  htmlFor="filterSelect"
                  className="mr-2 font-medium text-gray-700"
                >
                  Sort by:
                </label>
                <select
                  id="filterSelect"
                  value={filterType}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="Most Recent">Most Recent</option>
                  <option value="Most Helpful">Most Helpful</option>
                  <option value="Lowest Rating">Lowest Rating</option>
                  <option value="Pictures First">With Images</option>
                </select>
              </div>
            </div>

            <Reviews
              reviews={filteredReviews.slice(0, visibleReviews)}
              handleShowMore={handleShowMore}
              visibleReviews={visibleReviews}
            />

            {reviews.length > 5 && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleShowMore}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-blue-600 font-medium"
                >
                  {visibleReviews < reviews.length
                    ? "View All Reviews"
                    : "Show Less"}
                </button>
              </div>
            )}
          </div>
        </section>

        {showLoginModal && (
          <SignInModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
          />
        )}

        {isReviewModalOpen && (
          <AddReviewModal
            productId={productData.id}
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            setIsProductPageUpdated={setIsProductPageUpdated}
          />
        )}

        <SizeGuideModal
          isOpen={isSizeModalOpen}
          onClose={() => setIsSizModalOpen(false)}
          sizeGuideImage={productData.inner_subcategory?.size_chart_image}
        />

        <MediaModal
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          media={mediaList}
          activeIndex={activeMediaIndex}
        />
      </main>

      <ScrollToTop />
    </>
  );
}
