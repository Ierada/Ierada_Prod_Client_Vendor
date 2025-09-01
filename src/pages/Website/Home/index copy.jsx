import React, { useEffect, useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  User,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { GoCreditCard } from "react-icons/go";
import { LiaRupeeSignSolid } from "react-icons/lia";
import { IoChatbubblesOutline } from "react-icons/io5";
import { PiSealPercentFill } from "react-icons/pi";
import {
  FaStar,
  FaShieldAlt,
  FaShippingFast,
  FaHeadset,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";
import { NavLink, useNavigate } from "react-router-dom";

import LabelSlider from "../../../components/Website/LabelSlider";
import ProductSlider from "../../../components/Website/ProductSlider";
import CommonSlider from "../../../components/Website/CommonSlider";
import MiddleBanner from "../../../components/Website/MiddleBanner";
import DownloadApp from "../../../components/Website/DownloadApp";

import { getHomePageData } from "../../../services/api.dashboard";
import config from "../../../config/config";
import { useAppContext } from "../../../context/AppContext";
import { FaRegCirclePlay, FaRegCirclePause } from "react-icons/fa6";
import ScrollToTop from "../../../components/Common/ScrollToTop";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../../../services/api.wishlist";
import { getUserIdentifier } from "../../../utils/userIdentifier";

// import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [wishlists, setWishlists] = useState([]);
  const { user } = useAppContext();
  const sliderRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [lastMouseMove, setLastMouseMove] = useState(Date.now());

  const [homepageData, setHomepageData] = useState({
    slider: [],
    popularProducts: [],
    productsByCategory: [],
    productsBySubCategory: [],
    middleBanner: [],
    homeBottomVideo: [],
    labels: [],
    offerSale: [],
    featuredCollections: [],
    subcategorySection: [],
    newArrivals: [],
    accessories: [],
    trendingProducts: [],
    browsingData: [],
  });

  const handlePrevClick = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const handleNextClick = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const fetchData = async () => {
    try {
      const userId = getUserIdentifier();
      const response = await getHomePageData(userId);
      setHomepageData(response);
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      setLastMouseMove(Date.now());
    };

    const interval = setInterval(() => {
      if (Date.now() - lastMouseMove > 3000) {
        setShowControls(false);
      }
    }, 500);

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, [lastMouseMove]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex(
          (prevIndex) => (prevIndex + 1) % homepageData?.slider?.length
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPaused, homepageData?.slider?.length]);

  const fetchWishlist = async () => {
    if (user) {
      const response = await getWishlist(user.id);
      if (response?.data) {
        setWishlists(response?.data);
        const wishlistSet = new Set(
          response.data.map((item) => item.product_id)
        );
        setWishlistedItems(wishlistSet);
      }
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (wishlistedItems.has(productId)) {
        const wishlist = wishlists.find(
          (item) => item.product_id === productId
        );
        const response = await removeFromWishlist(wishlist.id);
        if (response) {
          fetchWishlist();
        }
      } else {
        // Add to wishlist
        const response = await addToWishlist(user.id, productId);
        if (response) {
          fetchWishlist();
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const handleWishlistClick = (e, productId) => {
    e.stopPropagation();
    toggleWishlist(productId);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? homepageData?.slider?.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex + 1) % homepageData?.slider?.length
    );
  };

  const handleNavigation = (data) => {
    if (data.Category && data.Category.slug) {
      navigate(
        `${config.VITE_BASE_WEBSITE_URL}/collection/category/${data.Category.slug}`
      );
    } else if (data.SubCategory && data.SubCategory.slug) {
      navigate(
        `${config.VITE_BASE_WEBSITE_URL}/collection/subcategory/${data.SubCategory.slug}`
      );
    } else if (data.link) {
      window.location.href = data.link;
    }
  };

  return (
    <main className="min-h-screen bg-[#f1f2ec] space-y-20 text-[black]">
      <section
        className="relative h-screen w-full overflow-hidden pt-16"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {homepageData?.slider?.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {slide.file_type === "image" ? (
              <div
                className="relative h-full w-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.file_url})` }}
              >
                <div className="absolute inset-0 bg-[black] bg-opacity-10" />
                <div className="relative h-full flex flex-col justify-center px-16 text-white max-w-2xl">
                  {/* <div className="flex items-center bg-white text-[black] px-4 py-2 rounded-full mb-4 w-fit">
                    <span className="flex items-center text-lg font-semibold">
                      <PiSealPercentFill className="mr-1 text-black" />
                      {slide.discount_price}% OFF
                    </span>
                    <span className="ml-2 text-lg">Christmas Sale</span>
                  </div> */}
                  <h1 className="text-5xl  font-bold mb-4">{slide.title}</h1>

                  <p className="text-lg mb-8">{slide.subtitle}</p>
                  <button
                    onClick={() => handleNavigation(slide)}
                    className="bg-[#6B705C] hover:bg-[#535647] transition-colors px-8 py-3 text-white font-medium w-fit"
                  >
                    Shop Now →
                  </button>
                </div>
              </div>
            ) : slide.file_type === "video" ? (
              <div className="relative h-full w-full">
                <video
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  src={slide.file_url}
                  autoPlay
                  muted
                  loop
                ></video>
                <div className="absolute inset-0 bg-[black] bg-opacity-30" />
                <div className="relative h-full flex flex-col justify-center px-16 text-white max-w-2xl">
                  {/* <div className="flex items-center bg-white text-[black] px-4 py-2 rounded-full mb-4 w-fit">
                    <span className="flex items-center text-lg font-semibold">
                      <PiSealPercentFill className="mr-1 text-black" />
                      {slide.discount_price}% OFF
                    </span>
                    <span className="ml-2 text-lg">Christmas Sale</span>
                  </div> */}
                  <h1 className="text-5xl font-bold mb-4">{slide.title}</h1>
                  <p className="text-lg mb-8">{slide.subtitle}</p>
                  <button
                    onClick={() => handleNavigation(slide)}
                    className="bg-[#6B705C] hover:bg-[#535647] transition-colors px-8 py-3 text-white font-medium w-fit"
                  >
                    Shop Now →
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-black" />
        </button>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {homepageData?.slider?.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-black" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {homepageData?.popularProducts &&
      homepageData?.popularProducts?.length > 0 ? (
        <section className="px-4 md:px-8 lg:px-16 space-y-4 ">
          <div className="w-full justify-evenly items-center flex py-8">
            <img src={left_decor} alt="" />
            <h2 className="text-4xl font-italiana text-nowrap">
              <span>Popular Products </span>
            </h2>
            <img src={right_decor} alt="" />
          </div>
          <div className="space-y-14 ">
            <ProductSlider products={homepageData?.popularProducts} />
          </div>
        </section>
      ) : null}

      {homepageData?.productsByCategory &&
      homepageData?.productsByCategory?.length > 0 ? (
        <section className="px-4 md:px-8 lg:px-16 space-y-4 ">
          <div className="w-full justify-evenly items-center flex py-8">
            <img src={left_decor} alt="" />
            <h2 className="text-4xl font-italiana text-nowrap">
              <span>Shop By Category </span>
            </h2>
            <img src={right_decor} alt="" />
          </div>
          <div className="space-y-14 ">
            <CommonSlider
              type={"category"}
              commonData={homepageData?.productsByCategory}
            />
          </div>
        </section>
      ) : null}

      <section className="w-full space-y-4 ">
        <div className="space-y-14 ">
          <MiddleBanner bannerData={homepageData?.middleBanner?.[0]} />
        </div>
      </section>

      <LabelSlider homepageData={homepageData} />

      {homepageData?.offerSale && homepageData?.offerSale?.length > 0 ? (
        <section className="px-4 md:px-8 lg:px-16 space-y-4">
          <div className="w-full justify-evenly items-center flex py-8">
            <img src={left_decor} alt="" />
            <h2 className="text-4xl font-italiana text-nowrap">
              <span>{homepageData?.offerSale?.[0]?.offerData?.title}</span>
            </h2>
            <img src={right_decor} alt="" />
          </div>
          <div className="relative">
            <div
              ref={sliderRef}
              className="flex overflow-x-hidden gap-4 scroll-smooth"
            >
              {homepageData?.offerSale?.[0]?.productList
                .slice(0, 10)
                .map((product) => (
                  <div
                    key={product.id}
                    className="w-full sm:w-1/4 md:1/3 lg:1/4"
                  >
                    <div className="group relative bg-[#f1f2ec] border border-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <a>
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img
                            onClick={() =>
                              navigate(
                                `${config.VITE_BASE_WEBSITE_URL}/product/offersale/${homepageData?.offerSale?.[0]?.offerData?.slug}`
                              )
                            }
                            src={
                              homepageData?.offerSale?.[0]?.offerData?.image ||
                              "/api/placeholder/400/320"
                            }
                            alt={product.name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            onClick={(e) => handleWishlistClick(e, product.id)}
                            className="absolute top-2 right-2 p-2 rounded-full text-white hover:text-gray-600 hover:bg-white transition-colors"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                wishlistedItems.has(product.id)
                                  ? "fill-red-500 text-red-500"
                                  : ""
                              }`}
                            />
                          </button>
                        </div>
                        <div className="p-4 text-[black]">
                          <p>{product.name}</p>
                          <div className="flex gap-2 items-center">
                            <p className="line-through text-gray-500">{`₹${product.original_price}`}</p>
                            <p className="font-bold">{`₹${
                              product.discounted_price || product.original_price
                            }`}</p>
                            <p className="text-red-500">{`${
                              product.discount_price || 0
                            }% OFF`}</p>
                          </div>
                          <div className="flex gap-2 text-sm text-gray-600 mt-2">
                            {product.variations &&
                            product.variations.length > 0 ? (
                              product.variations.map((variation) => (
                                <p key={variation.id}>
                                  {variation.size.toUpperCase()}
                                </p>
                              ))
                            ) : (
                              <p>No sizes available</p>
                            )}
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                ))}
            </div>
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
              <button
                onClick={handlePrevClick}
                className="p-2 rounded-full text-[#6B705C] bg-white shadow-md hover:bg-gray-50 transition-colors pointer-events-auto"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextClick}
                className="p-2 rounded-full text-[#6B705C] bg-white shadow-md hover:bg-gray-50 transition-colors pointer-events-auto"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="relative h-[90vh] w-full">
          {homepageData?.homeBottomVideo?.[0]?.video && (
            <>
              <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-cover"
                src={homepageData.homeBottomVideo[0].video}
                loop
              ></video>
              <div className="absolute inset-0 bg-[black] bg-opacity-10"></div>
              <div className="relative h-full flex flex-col justify-center items-center text-white">
                {showControls && (
                  <>
                    <h1 className="text-5xl font-bold mb-4 text-center">
                      {homepageData.homeBottomVideo[0].title || "Default Title"}
                    </h1>
                    <button
                      onClick={handlePlayPause}
                      className="text-white text-5xl bg-black bg-opacity-50 rounded-full p-4 flex items-center justify-center"
                      aria-label={isPlaying ? "Pause Video" : "Play Video"}
                    >
                      {isPlaying ? <FaRegCirclePause /> : <FaRegCirclePlay />}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="px-4 md:px-8 lg:px-16 space-y-4 ">
        <div className="w-full justify-evenly items-center flex py-8">
          <img src={left_decor} alt="" />
          <h2 className="text-4xl font-italiana text-nowrap">
            <span>Trending Products </span>
          </h2>
          <img src={right_decor} alt="" />
        </div>
        <div className="space-y-14 ">
          <div className="flex flex-wrap lg:flex-nowrap gap-8">
            <div className="w-full lg:w-1/3 bg-[#FFBCC7] p-6 rounded-md flex flex-col gap-5">
              <div className="flex flex-col items-center gap-3">
                <h2 className="text-4xl font-semibold text-[black] mb-2">
                  {homepageData?.browsingData?.length > 0
                    ? "Continue Browsing"
                    : "No Browsing Data Available"}
                </h2>
                <p className="text-gray-700 mb-6">
                  {homepageData?.browsingData?.length > 0
                    ? "Shop again where you left..."
                    : "You haven't viewed any products yet."}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {homepageData?.browsingData?.slice(0, 6)?.map((item, index) => (
                  <a
                    key={index}
                    href={`${config.VITE_BASE_WEBSITE_URL}/product/${item.slug}`}
                  >
                    <div className="overflow-hidden rounded-md">
                      <img
                        src={item?.image_file || "/api/placeholder/400/320"}
                        alt={`image of ${item?.name}`}
                        className="w-36 h-36 hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </a>
                ))}
              </div>
              <button
                onClick={() =>
                  navigate(
                    `${config.VITE_BASE_WEBSITE_URL}/collection/continue_browsing`
                  )
                }
                className="mx-auto flex border border-[#6B705C] text-[#6B705C] px-4 py-2 font-medium hover:bg-[#6B705C] hover:text-white transition"
              >
                Shop Now →
              </button>
            </div>

            <div className="w-full lg:w-2/3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {homepageData?.trendingProducts?.map((product, index) => (
                  <a
                    href={`${config.VITE_BASE_WEBSITE_URL}/product/trendingproduct/${product.slug}`}
                  >
                    <div
                      key={product.id}
                      className={`flex gap-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white ${
                        index % 2 === 0
                          ? "row-start-auto col-start-1"
                          : "row-start-auto col-start-2"
                      }`}
                    >
                      <div className="overflow-hidden rounded-md ">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-32 h-32 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="items-start flex flex-col justify-center gap-3">
                        <div className="text-yellow-500 flex justify-center items-center mt-1">
                          {[...Array(5)].map((_, index) => {
                            if (
                              index <
                              Math.floor(
                                product.reviewStatistics.average_rating
                              )
                            ) {
                              return <FaStar key={`full-${index}`} />;
                            } else if (
                              index < product.reviewStatistics.average_rating &&
                              product.reviewStatistics.average_rating % 1 !== 0
                            ) {
                              return <FaStarHalfAlt key={`half-${index}`} />;
                            } else {
                              return <FaRegStar key={`empty-${index}`} />;
                            }
                          })}
                          <span className="ml-1 text-gray-500">
                            {product.reviewStatistics.total_reviews}
                          </span>
                        </div>
                        <h3 className="text-lg text-[black] truncate">
                          {product.name}
                        </h3>
                        <p className="font-semibold text-[black]">{`₹${product.discounted_price}`}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 lg:px-16 space-y-4 ">
        <div className="w-full justify-evenly items-center flex py-8">
          <img src={left_decor} alt="" />
          <h2 className="text-4xl font-italiana text-nowrap">
            <span>Shop By Collection </span>
          </h2>
          <img src={right_decor} alt="" />
        </div>
        <div className="space-y-14 ">
          <CommonSlider
            type={"collection"}
            commonData={homepageData?.productsBySubCategory}
          />
        </div>
      </section>

      <section className="px-4 md:px-8 lg:px-16 space-y-4">
        <div className="w-full justify-evenly items-center flex py-8">
          <img src={left_decor} alt="" />
          <h2 className="text-4xl font-italiana text-nowrap">
            <span>Featured Collection </span>
          </h2>
          <img src={right_decor} alt="" />
        </div>
        <div className="flex gap-4 ">
          {homepageData?.featuredCollections?.slice(0, 4)?.map((product) => (
            <div key={product.id} className=" w-full sm:w-1/4 md:1/3 lg:1/4">
              <a
                href={`${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`}
              >
                <div className="group  relative bg-[#f1f2ec] border border-white overflow-hidden shadow-sm hover:shadow-md transition-shadow ">
                  <div className="relative aspect-[4/4] overflow-hidden">
                    <img
                      src={product?.image || "/api/placeholder/400/320"}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      <p>
                        {`${(
                          ((product.original_price - product.discounted_price) /
                            product.original_price) *
                          100
                        ).toFixed(2)}%`}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 text-[black]">
                    <div className="flex pb-2  items-center gap-1 text-[#FC9231] text-lg">
                      {[
                        ...Array(
                          Math.floor(product?.reviewStats?.average_rating || 0)
                        ),
                      ].map((_, index) => (
                        <FaStar key={`full-${index}`} />
                      ))}

                      {product?.reviewStats?.average_rating % 1 !== 0 && (
                        <FaStarHalfAlt />
                      )}

                      {[
                        ...Array(
                          5 -
                            Math.ceil(product?.reviewStats?.average_rating || 0)
                        ),
                      ].map((_, index) => (
                        <FaRegStar key={`empty-${index}`} />
                      ))}

                      <p className=" text-gray-500 ml-2">
                        ({product?.reviewStats?.total_reviews || 0})
                      </p>
                    </div>
                    <p>{product.name}</p>
                    <div className="flex justify-between mt-4">
                      <div className="flex gap-2 items-center">
                        <p className="text-xl">{`₹${product.discounted_price}`}</p>
                        <p className="line-through text-gray-500">{`₹${product.original_price}`}</p>
                      </div>
                      <button
                        onClick={() => {
                          product.btn_link;
                        }}
                        className="border-[black] border-2 rounded-full"
                      >
                        <ArrowUpRight />
                      </button>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {homepageData?.subcategorySection?.SubCategories?.slice(0, 3).map(
            (subcategory) => (
              <div key={subcategory.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[black]">
                    {subcategory.title}
                  </h2>
                  <a
                    href={`${config.VITE_BASE_WEBSITE_URL}/collection/subcategory/${subcategory.slug}`}
                    className="text-sm text-gray-500 hover:text-gray-800 font-medium"
                  >
                    View All
                  </a>
                </div>

                <div className="border border-white">
                  <div
                    className="relative bg-gray-100 overflow-hidden h-50 flex items-center p-4"
                    style={{
                      backgroundImage: `url(${subcategory.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-[black] opacity-20"></div>
                    <div className="relative text-left text-white gap-2 flex flex-col">
                      <p className="text-xl font-semibold">
                        Up to{" "}
                        <span className="text-red-500">
                          {subcategory.discount}% off
                        </span>
                      </p>
                      <p className="text-sm">{subcategory.subtitle}</p>
                      <div className="text-gray-700 flex gap-2">
                        <p className="border-b-2 border-gray-700">Shop Now</p>
                        <button
                          onClick={() =>
                            navigate(
                              `${config.VITE_BASE_WEBSITE_URL}/collection/subcategory/${subcategory.slug}`
                            )
                          }
                          className="border-gray-700 border-2 rounded-full"
                        >
                          <ArrowUpRight />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inner Subcategories */}
                  <div className="grid grid-cols-2 gap-4 py-6">
                    {subcategory.InnerSubCategories?.slice(0, 4).map(
                      (innerSubcategory) => (
                        <a
                          key={innerSubcategory.id}
                          href={`${config.VITE_BASE_WEBSITE_URL}/collection/inner-subcategory/${innerSubcategory.slug}`}
                        >
                          <div className="text-center space-y-2">
                            <img
                              src={innerSubcategory.image}
                              alt={innerSubcategory.title}
                              className="w-full h-24 object-contain mx-auto"
                            />
                            <h3 className="text-sm font-medium text-gray-800">
                              {innerSubcategory.title}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {subcategory.count}
                            </p>
                          </div>
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <section className="flex flex-wrap justify-between gap-8  text-[black] px-4 md:px-8 lg:px-16  ">
        <div className="flex items-center space-x-4 max-w-xs">
          <FaShippingFast className="w-16 h-16 p-4 text-gray-700 bg-white rounded-full" />
          <div>
            <h3 className="font-semibold text-lg">Free Shipping & Returns</h3>
            <p className="text-sm text-gray-500">For all orders over ₹999.00</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 max-w-xs">
          <GoCreditCard className="w-16 h-16 p-4 text-gray-700 bg-white rounded-full" />
          <div>
            <h3 className="font-semibold text-lg">Secure Payment</h3>
            <p className="text-sm text-gray-500">We ensure secure payment</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 max-w-xs">
          <LiaRupeeSignSolid className="w-16 h-16 p-4 text-gray-700 bg-white rounded-full" />
          <div>
            <h3 className="font-semibold text-lg">Price Match Guarantee</h3>
            <p className="text-sm text-gray-500">Get best price</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 max-w-xs">
          <IoChatbubblesOutline className="w-16 h-16 p-4 text-gray-700 bg-white rounded-full" />
          <div>
            <h3 className="font-semibold text-lg">24/7 Customer Support</h3>
            <p className="text-sm text-gray-500">Friendly customer support</p>
          </div>
        </div>
      </section>

      <DownloadApp />

      <ScrollToTop />
    </main>
  );
};

export default Home;
