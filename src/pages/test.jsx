import React, { useState } from 'react';
import { FaSortDown } from 'react-icons/fa6';
import { CiImport } from 'react-icons/ci';
import ReactPaginate from 'react-paginate';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

const Order = () => {
  const [orders, setOrders] = useState([
    {
      id: '1100001',
      date: '15 June 2024 02:05PM',
      customer: 'Pallavi Kumari',
      phone: '+91*********',
      channel: 'Influencer',
      amount: '₹25000.00',
      paymentStatus: 'Paid',
      orderStatus: 'Processing',
      orderType: 'Delivery',
    },
    {
      id: '1100002',
      date: '15 June 2024 02:06PM',
      customer: 'Pallavi Kumari',
      phone: '+91*********',
      channel: 'Website',
      amount: '₹25000.00',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      orderType: 'Delivery',
    },
    {
      id: '1100003',
      date: '15 June 2024 02:07PM',
      customer: 'Pallavi Kumari',
      phone: '+91*********',
      channel: 'Social Media',
      amount: '₹25000.00',
      paymentStatus: 'Unpaid',
      orderStatus: 'Pending',
      orderType: 'Delivery',
    },
    {
      id: '1100004',
      date: '15 June 2024 02:07PM',
      customer: 'Pallavi Kumari',
      phone: '+91*********',
      channel: 'Social Media',
      amount: '₹25000.00',
      paymentStatus: 'Unpaid',
      orderStatus: 'Pending',
      orderType: 'Delivery',
    },
  ]);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastOrder = (currentPage + 1) * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrder = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / itemsPerPage);

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
        Order
      </h1>
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-md shadow-md ">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 ">
          <div>
            <label className="text-[14px] font-satoshi font-medium text-txtPage">
              Select Order
            </label>
            <div className="relative w-36">
              <select className="px-2  py-1 pr-8 border border-gray-300 rounded-md w-full min-h-8 text-[14px] font-satoshi font-normal text-gray-500 bg-white appearance-none">
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
            <div className="relative w-36">
              <select className="px-2  py-1 pr-8 border border-gray-300 rounded-md w-full min-h-8 text-[14px] font-satoshi font-normal text-gray-500 bg-white appearance-none">
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
            <div className="relative w-36">
              <select className="px-2  py-1 pr-8 border border-gray-300 rounded-md w-full min-h-8 text-[14px] font-satoshi font-normal text-gray-500 bg-white appearance-none">
                <option value="" className="text-gray-500">
                  Order Status
                </option>
                <option value="" className="text-gray-500">
                  Pending
                </option>
                <option value="" className="text-gray-500">
                  Processing
                </option>
                <option value="" className="text-gray-500">
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
              className="px-2 py-1 border border-gray-300 rounded-md w-36 min-h-8 placeholder:text-sm text-[14px]"
            />
          </div>
          <div>
            <label className="text-[14px] font-satoshi font-medium text-txtPage">
              End Date
            </label>
            <input
              type="date"
              className="px-2 py-1 border border-gray-300 rounded-md w-36 min-h-8 placeholder:text-sm text-[14px]"
            />
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <button className="px-3 py-2 bg-[#BCC1CA] font-satoshi font-medium text-gray-700 rounded-md text-[16px] focus:bg-black focus:text-white hover:bg-tableheader">
              Clear
            </button>
            <button className="px-3.5 py-2 bg-[#BCC1CA] font-satoshi font-medium text-gray-700 rounded-md text-[16px] focus:bg-black focus:text-white hover:bg-tableheader ">
              Show Data
            </button>
          </div>
        </div>
      </div>

      {/* Search and Export Section */}
      <div className="flex items-center justify-between my-10">
        <div className="flex items-center ">
          <input
            type="text"
            placeholder="Search by order ID"
            className="p-2 border border-r-0 border-gray-300 rounded-l-md  w-72 min-h-8 placeholder:text-sm text-[14px]"
          />
          <button className="px-8  py-2 bg-black text-white  min-h-8  rounded-r-md text-[16px] font-satoshi font-medium">
            Search
          </button>
        </div>
        <button className="px-4 py-2 bg-black text-white  text-[16px] font-satoshi font-medium rounded-md">
          <CiImport className="inline-block text-white mr-3" size={20} />
          Export Data
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#F8F8F8]  rounded-lg overflow-hidden">
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
                Order ID
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Order Date
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Customer Info
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Channel
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Total Amount
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Order Status
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Order Type
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-50 ">
            {currentOrder.map((order, index) => (
              <tr
                key={order.id}
                className="border-b-2 border-[#eeeee4] dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  {index + 1}
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  {order.id}
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  {order.date}
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  {order.customer} <br /> {order.phone}
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  <span
                    className={`px-2 py-2 rounded-md ${
                      order.channel === 'Influencer'
                        ? 'bg-[#A6F5FF30] text-[#62D8E7]'
                        : order.channel === 'Website'
                        ? 'bg-[#5897F730] text-[#5897F7]'
                        : order.channel === 'Social Media'
                        ? 'bg-[#5639E630] text-[#5639E]'
                        : order.channel === 'Affiliate'
                        ? 'bg-[#DDB3EB30] text-[#DDB3E]'
                        : order.channel === 'B2B'
                        ? 'bg-[#C4486430] text-[#C44864]'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {order.channel}
                  </span>
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  <div>{order.amount}</div>
                  <span
                    className={`text-${
                      order.paymentStatus === 'Paid' ? 'green' : 'red'
                    }-600`}
                    style={{ lineHeight: '1' }}
                  >
                    {order.paymentStatus}
                  </span>
                </td>

                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  <span
                    className={`px-2 py-2 rounded-md ${
                      order.orderStatus === 'Processing'
                        ? 'bg-yellow-200 text-yellow-800'
                        : order.orderStatus === 'Confirmed'
                        ? 'bg-[#56C7D830] text-[#56C7D8]'
                        : order.orderStatus === 'Delivered'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium ">
                  <span className="bg-green-200 text-green-800 px-2 py-2 rounded-md">
                    {order.orderType}
                  </span>
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium space-x-2">
                  <button>
                    <img src="./images/eye.png" className="w-4 h-4" />
                  </button>
                  <button>
                    <img src="./images/Vector (1).png" className="w-4 h-4" />
                  </button>
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

export default Order;



<div className="bg-white p-4 rounded-md shadow-md">
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
  <div>
    <label className="text-[14px] font-satoshi font-medium text-txtPage">
      Select Order
    </label>
    <div className="relative w-full sm:w-36">
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
    <div className="relative w-full sm:w-36">
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
    <div className="relative w-full sm:w-36">
      <select className="px-2 py-1 pr-8 border border-gray-300 rounded-md w-full min-h-8 text-[14px] font-satoshi font-normal text-gray-500 bg-white appearance-none">
        <option value="" className="text-gray-500">
          Order Status
        </option>
        <option value="" className="text-gray-500">
          Pending
        </option>
        <option value="" className="text-gray-500">
          Processing
        </option>
        <option value="" className="text-gray-500">
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
      className="px-2 py-1 border border-gray-300 rounded-md w-full sm:w-36 min-h-8 placeholder:text-sm text-[14px]"
    />
  </div>
  <div>
    <label className="text-[14px] font-satoshi font-medium text-txtPage">
      End Date
    </label>
    <input
      type="date"
      className="px-2 py-1 border border-gray-300 rounded-md w-full sm:w-36 min-h-8 placeholder:text-sm text-[14px]"
    />
  </div>
  <div className="flex items-center  sm:mt-6 sm:col-span-2  space-x-2 mt-4">
    <button className="px-3 py-2 bg-[#BCC1CA] font-satoshi font-medium text-gray-700 rounded-md text-[16px] focus:bg-black focus:text-white hover:bg-tableheader w-full sm:w-auto">
      Clear
    </button>
    <button className="px-3.5 py-2 bg-[#BCC1CA] font-satoshi font-medium text-gray-700 rounded-md text-[16px] focus:bg-black focus:text-white hover:bg-tableheader w-full sm:w-auto">
      Show Data
    </button>
  </div>
</div>
</div>