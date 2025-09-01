import React from 'react';
import Chart from 'react-apexcharts';
import { RiArrowDropDownLine } from 'react-icons/ri';

const SalesChart = () => {
  const salesData = {
    options: {
      chart: {
        id: 'sales-bar-chart',
        toolbar: { show: false },
      },
      xaxis: {
        categories: [
          'JAN',
          'FEB',
          'MAR',
          'APR',
          'MAY',
          'JUN',
          'JUL',
          'AUG',
          'SEP',
          'OCT',
          'NOV',
          'DEC',
        ],
      },
      yaxis: {
        min: 0,
        max: 400, 
        tickAmount: 4,
        labels: {
          formatter: function (value) {
            return `${value}`; 
          },
        },
      },
      colors: ['#9F1239'], 
      plotOptions: {
        bar: {
          borderRadius: 5,
          horizontal: false,
          columnWidth: '30%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
    },
    series: [
      {
        name: 'Sales',
        data: [120, 90, 150, 100, 330, 140, 160, 130, 180, 190, 220, 210],
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-card border border-[#EFF0F6] ">
      <div className="flex justify-between items-center mb-2 border-b border-borderColor">
        <h2 className="text-[13px] text-[#4D4D4D] font-satoshi font-medium ">
          Sales
        </h2>
        <button className="text-[11px] text-[#0F2552] font-satoshi font-semibold  hover:bg-gray-200 focus:outline-none">
          Month
          <RiArrowDropDownLine className="inline-block w-4 h-4" />
        </button>
      </div>
      <Chart
        options={salesData.options}
        series={salesData.series}
        type="bar"
        height={200}
      />
    </div>
  );
};

export default SalesChart;
