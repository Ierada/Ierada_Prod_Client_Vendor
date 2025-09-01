import React from "react";

function TopProductsTable({ products = [], title }) {
  return (
    <div className="">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[25px] font-semibold text-txtPage font-satoshi ">
          {title}
        </h2>
        {/* Filters */}
        {/* <div className="flex space-x-4">
          <div>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 pr-6 text-[14px] text-txtPage focus:outline-none focus:ring-1 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>By City</option>
              <option>Bengaluru</option>
              <option>Hyderabad </option>
              <option>Chennai</option>
            </select>
          </div>
          <div>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 pr-6 text-[14px] text-txtPage focus:outline-none focus:ring-1 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>By Month</option>
              <option>October</option>
              <option>November</option>
              <option>December</option>
            </select>
          </div>
        </div> */}
      </div>

      <div className="bg-white border-2 border-[#F2F2F2] rounded-lg p-5">
        <div
          className={`overflow-y-auto ${
            products.length > 0 ? "h-96" : "h-60"
          } m scrollbar-hide`}
        >
          <table className="w-full border-collapse">
            <thead className="bg-white sticky top-0">
              <tr className="text-left text-tableheader text-[14px] font-medium border-b border-[#F2F2F2]">
                <th className="py-2 px-4">Product name</th>
                <th className="py-2 px-4">Price</th>
                <th className="py-2 px-4">Sold</th>
                <th className="py-2 px-4">Sales</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-4 px-4 text-txtPage text-[14px] font-satoshi m-auto items-center justify-center"
                  >
                    <div className="flex flex-col items-center justify-center h-full w-full m-auto">
                      <svg
                        className="w-20 h-20 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M12 2a10 10 0 0 1 10 10M2 12A10 10 0 0 1 12 2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      <p className="text-gray-500 text-sm mt-2">
                        No data available
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={index} className="border-b border-[#F2F2F2]">
                    <td className="py-4 px-4 text-txtPage text-[14px] font-satoshi">
                      <div className="flex items-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                        )}
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-txtPage text-[14px] font-satoshi">
                      ₹{product.price}
                    </td>
                    <td className="py-4 px-4 text-txtPage text-[14px] font-satoshi">
                      {product.soldCount}
                    </td>
                    <td className="py-4 px-4 text-txtPage text-[14px] font-satoshi">
                      ₹{product.soldCount * product.price}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TopProductsTable;
