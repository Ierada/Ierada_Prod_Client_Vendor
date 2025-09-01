import React from "react";
import { Link } from "react-router-dom";
import config from "../../../config/config";

const ProductCard = ({ product }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        {/* limit the product name to 2 lines */}
        <h3 className="text-md font-semibold mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600">
          <span className="font-semibold">₹{product.discount_price}</span>
          <span className="ml-2 line-through">₹{product.original_price}</span>
        </p>
        <Link
          to={`${config.VITE_BASE_WEBSITE_URL}/product/${product.slug}`}
          className="mt-2 inline-block text-blue-600 hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
