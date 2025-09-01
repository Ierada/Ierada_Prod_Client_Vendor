import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import config from "../../../config/config";
import left_decor from "/assets/heading_decoration/heading_decoration_left.svg";
import right_decor from "/assets/heading_decoration/heading_decoration_right.svg";

const ProductCollection = ({ data }) => {
  const navigate = useNavigate();

  return (
    <section className='px-4 md:px-8 lg:px-16 space-y-4'>
       <div className="w-full flex justify-center items-center py-6 gap-3 sm:gap-4 md:gap-6">
        {left_decor && (
          <img
            src={left_decor}
            alt="Left Decoration"
            className="h-3 sm:h-4 md:h-5 lg:h-6 w-auto"
          />
        )}
        <h2 className='text-2xl md:text-3xl lg:text-4xl font-italiana text-nowrap'>
          <span>{data.title}</span>
        </h2>
        {right_decor && (
            <img
              src={right_decor}
              alt="Right Decoration"
              className="h-3 sm:h-4 md:h-5 lg:h-6 w-auto"
            />
          )}
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {data.items.map(product => (
          <div
            key={product.id}
            className='group relative bg-[#f1f2ec] border border-white overflow-hidden shadow-sm hover:shadow-md transition-shadow'
            onClick={() =>
              navigate(
                `${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`
              )
            }
          >
            <div className='relative aspect-square overflow-hidden'>
              <img
                src={product.image}
                alt={product.name}
                className='w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300'
              />
            </div>
            <div className='p-4'>
              <div className='flex items-center text-yellow-500 mb-2'>
                {[...Array(5)].map((_, index) => {
                  const rating = product.reviewStats.average_rating;
                  if (index < Math.floor(rating)) {
                    return <FaStar key={`full-${index}`} />;
                  } else if (index < Math.ceil(rating) && rating % 1 !== 0) {
                    return <FaStarHalfAlt key={`half-${index}`} />;
                  }
                  return <FaRegStar key={`empty-${index}`} />;
                })}
                <span className='ml-2 text-gray-500'>
                  ({product.reviewStats.total_reviews})
                </span>
              </div>
              <h3 className='text-lg font-medium mb-2'>{product.name}</h3>
              <p className='text-xl font-bold'>
                ₹{product.original_price - product.discounted_price}
              </p>
              <p className='line-through text-gray-500'>{`₹${product.original_price}`}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductCollection;
