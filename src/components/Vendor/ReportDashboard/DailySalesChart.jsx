import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import config from '../../../config/config';

const DailySalesChart = ({ dailySalesData }) => {
  // Check if dailySalesData is correctly passed
  // const [dailySalesData, setDailySalesData] = useState(
  //   localStorage.getItem(`${config.BRAND_NAME}dailySales`) || null
  // );

  useEffect(() => {
    console.log('Daily Sales Data updated:', dailySalesData);
  }, [dailySalesData]);

  // Generate x-axis labels for 24 hours
  const xAxisLabels = Array.from({ length: 24 }, (_, index) => {
    if (index === 0) return '12am';
    if (index === 12) return '12pm';
    return index < 12 ? `${index}am` : `${index - 12}pm`;
  });

  const options = {
    chart: {
      id: 'daily-sales',
      toolbar: { show: false },
    },
    xaxis: {
      categories: xAxisLabels, // Map directly to the backend-provided data
      tickAmount: 12,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          colors: '#6b7280',
        },
      },
    },
    colors: ['#007FFF'],
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    dataLabels: {
      enabled: false,
    },
    yaxis: {
      min: 0,
      max:
        dailySalesData && dailySalesData.length
          ? Math.ceil(Math.max(...dailySalesData) * 1.5)
          : 10,
      tickAmount: 4,
      labels: {
        formatter: value => value.toFixed(0),
        style: {
          fontSize: '12px',
          colors: '#6b7280',
        },
      },
    },
    grid: {
      show: true,
      borderColor: '#e5e7eb',
    },
    tooltip: {
      enabled: true,
      x: {
        formatter: value => {
          // Correct mapping of the index to xAxisLabels
          return xAxisLabels[value] || 'N/A';
        },
      },
      y: {
        formatter: value => `${value} sales`,
      },
    },
  };

  const series = [
    {
      name: 'Hourly Sales',
      data:
        Array.isArray(dailySalesData) && dailySalesData.length === 24
          ? dailySalesData
          : Array(24).fill(0), // Fallback to zeros if data is invalid
    },
  ];

  return (
    <div className='bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full'>
      <h2 className='text-[18px] font-normal text-[#171A1F] mb-4'>
        Daily Sales
      </h2>
      {dailySalesData && (
        <Chart
          key={JSON.stringify(dailySalesData)}
          options={options}
          series={series}
          type='line'
          height={250}
          width='100%'
        />
      )}
    </div>
  );
};

export default DailySalesChart;
