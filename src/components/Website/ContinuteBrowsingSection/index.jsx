import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import config from "../../../config/config";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { getUserIdentifier } from "../../../utils/userIdentifier";
import { recentlyViewedProducts } from "../../../services/api.viewedProduct";

const ContinueBrowsing = ({ data }) => {

    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentlyViewed = async () => {
          const userId = getUserIdentifier();
          
          try {
            const response = await recentlyViewedProducts(userId);
            if (response.status === 1) {
                setRecentProducts(response.data);
            }
          } catch (error) {
            console.error('Failed to fetch recently viewed products:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchRecentlyViewed();
    }, []);

    return (
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
                  {data?.continue_browsing?.title || "Continue Browsing"}
                </h2>
                <p className="text-gray-700 mb-6">
                  {data?.continue_browsing?.subtitle || "Shop again where you left..."}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {data?.continue_browsing?.images.map((image) => (
                  <a href={`${config.VITE_BASE_WEBSITE_URL}/collection/${image.type}/${image.slug}`}>
                    <div key={image.id} className="overflow-hidden rounded-md">
                      <img
                        src={image.image}
                        alt={`Product ${image.id}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </a>
                ))}
              </div>
              <button
                navigate={`${config.VITE_BASE_WEBSITE_URL}/collection/${data?.product_grid?.slug}`}
                className="mx-auto flex border border-[#6B705C] text-[#6B705C] px-4 py-2 font-medium hover:bg-[#6B705C] hover:text-white transition"
              >
                Shop Now →
              </button>
            </div>

            <div className="w-full lg:w-2/3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {data?.product_grid.map((product, index) => (
                  <a href={`${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`}>
                    <div
                      key={product.id}
                      className={`flex gap-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white ${
                        index % 2 === 0 ? "row-start-auto col-start-1" : "row-start-auto col-start-2"
                      }`}
                    >
                      <div className="overflow-hidden rounded-md ">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-32 h-32 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="items-start  flex flex-col justify-center gap-3">
                        <div className="text-yellow-500 flex justify-center items-center mt-1">
                          {[...Array(Math.floor(product.ratings))].map((_, index) => (
                            <FaStar key={`full-${index}`} />
                          ))}
                          {product.ratings % 1 !== 0 && <FaStarHalfAlt />}
                          {[...Array(5 - Math.ceil(product.ratings))].map((_, index) => (
                            <FaRegStar key={`empty-${index}`} />
                          ))}
                          <span className="ml-1 text-gray-500">{product.people_count}</span>
                        </div>
                        <h3 className="text-lg text-[black] truncate">{product.title}</h3>
                        <p className=" font-semibold text-[black]">{`₹${product.discounted_price}`}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
}

export default ContinueBrowsing;