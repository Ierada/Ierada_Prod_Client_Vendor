import React from 'react';
import { FaSortDown } from 'react-icons/fa6';
import { CiImport } from 'react-icons/ci';
import { useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

import ReactPaginate from 'react-paginate';
const Coupons = () => {
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: 'CCA29-2ABB-2916',
      type: 'Percentage',
      discount: '25%',
      status: 'Finished',
      startDate: '15/06/2024 10:08 AM',
      endDate: '22/06/2024 12:10 PM',
    },
    {
      id: 2,
      code: 'CCA29-2ABB-2916',
      type: 'Percentage',
      discount: '75%',
      status: 'Finished',
      startDate: '15/06/2024 10:08 AM',
      endDate: '22/06/2024 12:10 PM',
    },
    {
      id: 3,
      code: 'CCA29-2ABB-2916',
      type: 'Fixed Amount',
      discount: '25%',
      status: 'Enabled',
      startDate: '15/06/2024 10:08 AM',
      endDate: '22/06/2024 12:10 PM',
    },
    {
      id: 4,
      code: 'CCA29-2ABB-2916',
      type: 'Percentage',
      discount: '18%',
      status: 'Planned',
      startDate: '15/06/2024 10:08 AM',
      endDate: '22/06/2024 12:10 PM',
    },
    {
      id: 5,
      code: 'CCA29-2ABB-2916',
      type: 'Fixed Amount',
      discount: '25%',
      status: 'Finished',
      startDate: '15/06/2024 10:08 AM',
      endDate: '22/06/2024 12:10 PM',
    },
    {
      id: 6,
      code: 'CCA29-2ABB-2916',
      type: 'Percentage',
      discount: '20%',
      status: 'Enabled',
      startDate: '15/06/2024 10:08 AM',
      endDate: '22/06/2024 12:10 PM',
    },
    {
      id: 7,
      code: 'CCA29-2ABB-2916',
      type: 'Percentage',
      discount: '25%',
      status: 'Finished',
      startDate: '15/06/2024 10:08 AM',
      endDate: '22/06/2024 12:10 PM',
    },
    {
      id: 8,
      code: 'CCA29-2ABB-2916',
      type: 'Fixed Amount',
      discount: '45%',
      status: 'Planned',
      startDate: '15/06/2024 10:08 AM',
      endDate: '22/06/2024 12:10 PM',
    },
  ]);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastCoupon = (currentPage + 1) * itemsPerPage;
  const indexOfFirstCoupon = indexOfLastCoupon - itemsPerPage;
  const currentCoupon = coupons.slice(indexOfFirstCoupon, indexOfLastCoupon);

  const totalPages = Math.ceil(coupons.length / itemsPerPage);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0);
  };

  return (
    <div className=" bg-gray-100 min-h-screen ">
      <h1 className="text-[35px] font-semibold text-txtPage font-satoshi mb-6">
        Coupons
      </h1>
      {/* Filters Section */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-1">
          <div>
            <label className="text-[14px] font-satoshi font-medium text-txtPage">
              Select Order
            </label>
            <div className="relative w-full">
              <select className="px-2 py-1 pr-8 border border-gray-300 rounded-md w-full min-h-8 text-[14px] font-satoshi font-normal text-gray-500 bg-white appearance-none">
                <option value="" className="text-gray-500">
                  Select Order
                </option>
                <option value="rental" className="text-gray-700">
                  Rental
                </option>
              </select>
              <FaSortDown className="absolute right-2 top-1/2 transform -translate-y-3 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[14px] font-satoshi font-medium text-txtPage">
              Order Channel
            </label>
            <div className="relative w-full">
              <select className="px-2 py-1 pr-8 border border-gray-300 rounded-md w-full min-h-8 text-[14px] font-satoshi font-normal text-gray-500 bg-white appearance-none">
                <option value="" className="text-gray-500">
                  Order Channel
                </option>
                <option value="influencer" className="text-gray-500">
                  Influencer
                </option>
                <option value="website" className="text-gray-500">
                  Website
                </option>
                <option value="social media" className="text-gray-500">
                  Social Media
                </option>
              </select>
              <FaSortDown className="absolute right-2 top-1/2 transform -translate-y-3 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[14px] font-satoshi font-medium text-txtPage">
              Order Status
            </label>
            <div className="relative w-full">
              <select className="px-2 py-1 pr-8 border border-gray-300 rounded-md w-full min-h-8 text-[14px] font-satoshi font-normal text-gray-500 bg-white appearance-none">
                <option value="" className="text-gray-500">
                  Order Status
                </option>
                <option value="pending" className="text-gray-500">
                  Pending
                </option>
                <option value="processing" className="text-gray-500">
                  Processing
                </option>
                <option value="delivered" className="text-gray-500">
                  Delivered
                </option>
              </select>
              <FaSortDown className="absolute right-2 top-1/2 transform -translate-y-3 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[14px] font-satoshi font-medium text-txtPage">
              Start Date
            </label>
            <input
              type="date"
              className="px-2 py-1 border border-gray-300 rounded-md w-full min-h-8 placeholder:text-sm text-[14px]"
            />
          </div>

          <div>
            <label className="text-[14px] font-satoshi font-medium text-txtPage">
              End Date
            </label>
            <input
              type="date"
              className="px-2 py-1 border border-gray-300 rounded-md w-full min-h-8 placeholder:text-sm text-[14px]"
            />
          </div>

          <div className="flex items-end space-x-1 mt-4  sm:mt-0">
            <button className="px-3 py-2 bg-[#BCC1CA] font-satoshi font-medium text-gray-700 rounded-md text-[16px] focus:bg-black focus:text-white hover:bg-tableheader w-full sm:w-auto lg:ml-1">
              Clear
            </button>
            <button className="px-3.5 py-2 bg-[#BCC1CA] font-satoshi font-medium text-gray-700 rounded-md text-[16px] focus:bg-black focus:text-white hover:bg-tableheader w-full sm:w-auto">
              Show Data
            </button>
          </div>
        </div>
      </div>

      {/* Search and Export Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between my-10">
        <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
          <input
            type="text"
            placeholder="Search by order ID"
            className="p-2 border border-r-0 border-gray-300 rounded-l-md w-full sm:w-72 min-h-8 placeholder:text-sm text-[14px]"
          />
          <button className="px-8 py-2 bg-black text-white min-h-8 rounded-r-md text-[16px] font-satoshi font-medium">
            Search
          </button>
        </div>
        <button className="px-4 py-2 bg-black text-white text-[16px] font-satoshi font-medium rounded-md mt-4 sm:mt-0">
          <CiImport className="inline-block text-white mr-3" size={20} />
          Export Data
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto bg-white border border-[#F8F8F8] dark:bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead
            style={{ backgroundColor: '#F8F8F8' }}
            className="bg-gray-300 dark:bg-gray-700"
          >
            <tr className="text-left uppercase text-gray-700 dark:text-gray-300 text-[15px] font-medium">
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                SL
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Code
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Type
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Discount
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Status
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Start Date
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                End Date
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]"></th>
            </tr>
          </thead>
          <tbody>
            {currentCoupon.map((coupon, index) => (
              <tr
                key={coupon.id}
                className="border-b-2 border-[#eeeee4] dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  {index + 1}
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  {coupon.code}
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  {coupon.type}
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  {coupon.discount}
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  <span
                    className={`px-2 py-2 rounded-md  ${
                      coupon.status === 'Finished'
                        ? 'bg-[#7ADEA730] text-[#7ADEA7]'
                        : coupon.status === 'Enabled'
                        ? 'bg-[#A6F5FF30] text-[#62D8E7]'
                        : 'text-[#F9AC0C] bg-[#F9AC0C30]'
                    }`}
                  >
                    {coupon.status}
                  </span>
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  {coupon.startDate}
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  {coupon.endDate}
                </td>
                <td>
                  <BsThreeDotsVertical />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="border border-gray-300 rounded p-2">
          <label htmlFor="rows-per-page" className="mr-2">
            Show:
          </label>
          <select
            id="rows-per-page"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className=""
          >
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
          </select>
        </div>

        <ReactPaginate
          breakLabel="..."
          nextLabel={
            <span className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-200 ">
              <BsChevronRight />
            </span>
          }
          previousLabel={
            <span className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-200  ">
              <BsChevronLeft />
            </span>
          }
          pageCount={totalPages}
          onPageChange={handlePageChange}
          containerClassName="flex items-center justify-center mt-3 "
          pageClassName="border border-gray-300 rounded-md w-8 h-8 flex items-center justify-center hover:bg-gray-200 mr-2 "
          activeClassName="bg-black text-white rounded-md"
          previousClassName="mr-3"
          nextClassName="ml-3"
        />
      </div>
    </div>
  );
};

export default Coupons;
