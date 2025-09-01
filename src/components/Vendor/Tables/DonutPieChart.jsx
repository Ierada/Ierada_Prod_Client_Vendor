import React from "react";
import { Chart as ChartJS, Tooltip, Title, ArcElement, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { MdKeyboardArrowDown } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";

ChartJS.register(Tooltip, Title, ArcElement, Legend);

const DonutPieChart = ({ data }) => {
  const chartData = {
    datasets: [
      {
        data: [
          data.website.percentage,
          data.app.percentage,
          data.influencer.percentage,
          data.marketing.percentage,
        ],
        backgroundColor: ["#FFDB89", "#6E8EFF", "#80DAD6", "#DF7949"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    // <div className='w-full'>
    //   <div className='flex items-center '>
    //     <h2 className='inline-block text-[26px] font-semibold font-satoshi text-txtPage my-6'>
    //       Revenue
    //     </h2>
    //   </div>

    <div className="bg-white border-2 rounded-lg border-[#F2F2F2] p-6 ">
      <div className="relative w-60 h-56 mx-auto mt-10 mb-20 flex flex-col items-center justify-center">
        <Doughnut data={chartData} />
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold">
          {data.website.percentage + data.app.percentage}%
        </div>
      </div>
      <div className="grid grid-cols-2 gap-y-2 my-6 text-[14px] text-tableheader font-satoshi font-normal px-6">
        <div className="border-r">
          <div className="flex items-center justify-between pr-4 border-gray-300">
            <div className="flex items-center">
              <span className="h-2 w-2 bg-yellow-400 rounded-full mr-2"></span>
              Website
            </div>
            <div className="flex items-center">
              <span className="ml-4 text-txtPage font-semibold">
                ₹{data.website.value.toLocaleString()}
              </span>
              <span className="ml-4 text-gray-500">
                {data.website.percentage}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between pr-4">
            <div className="flex items-center">
              <span className="h-2 w-2 bg-[#80DAD6] rounded-full mr-2"></span>
              influencer
            </div>
            <div className="flex items-center">
              <span className="ml-4 text-txtPage font-semibold">
                ₹{data.influencer.value.toLocaleString()}
              </span>
              <span className="ml-4 text-gray-500">
                {data.influencer.percentage}%
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between pl-4 border-gray-300">
            <div className="flex items-center">
              <span className="h-2 w-2 bg-[#6E8EFF] rounded-full mr-2"></span>
              App
            </div>
            <div className="flex items-center">
              <span className="ml-4 text-txtPage font-semibold">
                ₹{data.app.value.toLocaleString()}
              </span>
              <span className="ml-4 text-gray-500">{data.app.percentage}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between pl-4">
            <div className="flex items-center">
              <span className="h-2 w-2 bg-[#DF7949] rounded-full mr-2"></span>
              Marketing
            </div>
            <div className="flex items-center">
              <span className="ml-4 text-txtPage font-semibold">
                ₹{data.marketing.value.toLocaleString()}
              </span>
              <span className="ml-4 text-gray-500">
                {data.marketing.percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};

export default DonutPieChart;
