import React from 'react';
import { FaSortDown } from 'react-icons/fa6';
import InfluencerCard from './influencerCard';
import { AiFillInstagram } from 'react-icons/ai';
import CampaignTable from './CampaignTable';
import { useNavigate } from 'react-router-dom';

const influencers = [
  {
    name: '@maddison_c21',
    followers: '98M',
    performance: 80,
    image: 'https://via.placeholder.com/40',
  },
  {
    name: '@karl.will02',
    followers: '70M',
    performance: 65,
    image: 'https://via.placeholder.com/40',
  },
  {
    name: '@andreea.lz',
    followers: '52M',
    performance: 60,
    image: 'https://via.placeholder.com/40',
  },
  {
    name: '@abraham47.y',
    followers: '43M',
    performance: 55,
    image: 'https://via.placeholder.com/40',
  },
  {
    name: '@simmmple.web',
    followers: '387K',
    performance: 45,
    image: 'https://via.placeholder.com/40',
  },
  {
    name: '@venus.sys',
    followers: '315K',
    performance: 40,
    image: 'https://via.placeholder.com/40',
  },
  {
    name: '@ape.vpp8',
    followers: '290K',
    performance: 35,
    image: 'https://via.placeholder.com/40',
  },
  {
    name: '@leon_pwrr',
    followers: '2309',
    performance: 30,
    image: 'https://via.placeholder.com/40',
  },
];

const Influencers = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-8 ">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-[24px] lg:text-[28px] font-semibold text-txtPage font-satoshi">
          Influencers
        </h2>
        <button
          className="bg-black text-white px-4 py-2 rounded hover:bg-black text-[16px] lg:text-[20px]"
          onClick={() => navigate('./management')}
        >
          + Add influencer
        </button>
      </div>

      {/* Filter Section */}
      <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-4">
        <div className="relative">
          <select className="p-2 pr-8 border border-[#EFF0F6] rounded-lg w-full text-[14px] font-satoshi font-medium appearance-none">
            <option value="all-time">Timeframe: All-time</option>
            <option value="last-year">Last Year</option>
            <option value="last-month">Last Month</option>
            <option value="last-week">Last Week</option>
            <option value="today">Today</option>
          </select>
          <FaSortDown className="absolute right-2 top-1/2 transform -translate-y-3 text-gray-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select className="p-2 pr-8 border border-[#EFF0F6] rounded-lg w-full text-[14px] font-satoshi font-medium appearance-none">
            <option value="sales-report">Report Type: Sales Report</option>
            <option value="inventory-report">Inventory Report</option>
            <option value="customer-report">Customer Report</option>
          </select>
          <FaSortDown className="absolute right-2 top-1/2 transform -translate-y-3 text-gray-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select className="p-2 pr-8 border border-[#EFF0F6] rounded-lg w-full text-[14px] font-satoshi font-medium appearance-none">
            <option value="all">Topic: All</option>
            <option value="marketing">Marketing</option>
            <option value="finance">Finance</option>
            <option value="operations">Operations</option>
          </select>
          <FaSortDown className="absolute right-2 top-1/2 transform -translate-y-3 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Influencer Cards Grid */}

      <div>
        <InfluencerCard />
      </div>

      <div className="max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[20px] font-satoshi font-bold text-txtPage">
            Top Influencers
          </h2>
          <button className="px-3 py-1 text-[14px] font-medium font-satoshi text-[#731540] bg-[#9C2D4126] rounded-full hover:bg-rose-200">
            See all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
          
          
            <thead>
              <tr>
                <th className="text-[14px] font-satoshi font-medium text-tableheader py-2 px-3">
                  Name
                </th>
                <th className="text-[14px] font-satoshi font-medium text-tableheader py-2 px-3">
                  Social Media
                </th>
                <th className="text-[14px] font-satoshi font-medium text-tableheader py-2 px-3">
                  Performance
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {influencers.map((influencer, index) => (
                <tr key={index} className="bg-gray-400">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={influencer.image}
                        alt={influencer.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-[14px] font-satoshi font-bold text-txtColor">
                        {influencer.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-left ">
                    {influencer.followers}
                  </td>
                  <td className="py-3 px-3">
                    <div className="relative w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="absolute h-2 bg-black rounded-full"
                        style={{ width: `${influencer.performance}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <CampaignTable />
      </div>
    </div>
  );
};

export default Influencers;
