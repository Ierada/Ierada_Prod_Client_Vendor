import React from 'react';
import Chart from 'react-apexcharts';
import { IoIosArrowDown } from 'react-icons/io';

const ComparisonChart = ({ salesData = [], rentalData = [] }) => {
  // Process sales and rental data
  const processedSalesData = salesData.map(item => ({
    x: `${item.month}/${item.year}`,
    y: item.order_count
  }));

  const processedRentalData = rentalData.map(item => ({
    x: `${item.month}/${item.year}`,
    y: item.order_count
  }));

  const options = {
    chart: {
      type: 'bar',
      height: 350,
    },
    colors: ['#8B1638', '#C5B8A7'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [...new Set([...processedSalesData.map(d => d.x), ...processedRentalData.map(d => d.x)])],
    },
    yaxis: {
      title: {
        text: 'Order Count'
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} orders`
      },
    },
  };

  const series = [
    {
      name: 'Sales',
      data: processedSalesData.map(item => item.y)
    },
    {
      name: 'Rentals',
      data: processedRentalData.map(item => item.y)
    }
  ];

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between items-center">
        <h2 className="text-[25px] font-semibold text-txtPage font-satoshi">
          Comparison Analytics
        </h2>
        <div>
          <button className="border px-4 py-1 rounded-lg flex items-center text-[14px] font-satoshi font-normal text-txtPage">
            Material
            <IoIosArrowDown className="ml-2" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 w-full my-6">
        <div className="w-full">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

export default ComparisonChart;