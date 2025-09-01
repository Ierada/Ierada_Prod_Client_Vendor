import React from 'react';
import Chart from 'react-apexcharts';
import { RiArrowDropDownLine } from 'react-icons/ri';

const RentalChart = () => {
  const rentalData = {
    options: {
      chart: {
        id: 'rental-bar-chart',
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
        min: 0, // Minimum value on the y-axis
        max: 400, // Maximum value on the y-axis
        tickAmount: 4, 
        labels: {
          formatter: function (value) {
            return `${value}`; // Customize this if you want to add units
          },
        },
      },
      colors: ['#2563EB'], // Example color for rental chart (blue)
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
        name: 'Rentals',
        data: [80, 100, 90, 120, 150, 130, 110, 160, 140, 180, 170, 400],
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-card border border-[#EFF0F6]">
      <div className="flex justify-between items-center mb-2 border-b border-borderColor">
        <h2 className="text-[13px] text-[#4D4D4D] font-satoshi font-medium ">
          Rentals
        </h2>
        <button className="text-[11px] text-[#0F2552] font-satoshi font-semibold  hover:bg-gray-200 focus:outline-none">
          Month
          <RiArrowDropDownLine className="inline-block w-4 h-4" />
        </button>
      </div>
      <Chart
        options={rentalData.options}
        series={rentalData.series}
        type="bar"
        height={200}
      />
    </div>
  );
};

export default RentalChart;
