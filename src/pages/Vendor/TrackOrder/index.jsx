import React, { useState } from 'react';
import ReactPaginate from 'react-paginate';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

const TrackCustomerOrders = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      name: 'Shinaya Kapoor',
      trackingId: 'QA29-2ABB-2916',
      location: 'Surat',
    },
    {
      id: 2,
      name: 'Ravesh Kohali',
      trackingId: 'QA9D-2ABB-2916',
      location: 'Delhi',
    },
    {
      id: 3,
      name: 'Kamalli Thanu',
      trackingId: 'QA29-23BB-2916',
      location: 'Noida',
    },
    {
      id: 4,
      name: 'Illiyas Sidhiqui',
      trackingId: 'QA23-22BB-2916',
      location: 'Raipur',
    },
    {
      id: 5,
      name: 'Bibasha Kishor',
      trackingId: 'QA44-254B-2916',
      location: 'Indore',
    },
    {
      id: 6,
      name: 'Rashika Lalwani',
      trackingId: 'QA34-243B-2916',
      location: 'Delhi',
    },
    {
      id: 7,
      name: 'Sheryansh Desai',
      trackingId: 'QA23-544B-2916',
      location: 'Gurgaon',
    },
    {
      id: 8,
      name: 'Abhinav Mahajan',
      trackingId: 'QA34-233B-2916',
      location: 'Kolkata',
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
    <div className="min-h-screen ">
      <h1 className="text-[35px] font-semibold text-txtPage font-satoshi ">
        Track Customers Orders
      </h1>

      <div className="flex items-center justify-between my-6">
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
          + Request For New Shipping Partners
        </button>
      </div>

      <div className="bg-white border border-[#F8F8F8]  rounded-lg overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead style={{ backgroundColor: '#F8F8F8' }} className="bg-gray-300">
            <tr>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                SL
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Customer Name
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Tracking ID
              </th>
              <th className="px-4 py-3 border-b border-[#F8F8F8] text-[#2D3954] font-satoshi font-semibold text-[15px]">
                Deliver Location
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
                  {order.name}
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  {order.trackingId}
                </td>
                <td className="p-3 text-[15px] text-[#2D3954] dark:text-gray-300 font-medium">
                  {order.location}
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

export default TrackCustomerOrders;
