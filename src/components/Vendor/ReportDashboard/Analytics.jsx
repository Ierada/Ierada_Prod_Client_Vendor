import React from 'react';
import Chart from 'react-apexcharts';

const DonutChart = ({ title, colors, series }) => {
  const options = {
    labels: ['Sale', 'Rent', 'Return'],
    // colors: ['#BAEDBD', '#1C1C1C', '#95A4FC'],
    colors: colors,
    legend: { show: false },
    dataLabels: { enabled: false },
  };

  // const series = [40, 30, 20];

  return (
    <div className='flex flex-col items-center justify-center'>
      <Chart options={options} series={series} type='donut' width={100} />
      <h3 className='text-sm font-semibold mt-2'>{title}</h3>
    </div>
  );
};

const Analytics = ({ totalSales, totalRentals, totalReturns }) => {
  return (
    <div className='bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full flex flex-col'>
      <h2 className='text-[18px] font-normal text-[#171A1F] mb-4'>Analytics</h2>
      <div className='h-full flex gap-2 justify-around'>
        {/* <DonutChart title="Sale" colors={['#6EE7B7', '#93C5FD', '#000']} /> */}
        <DonutChart
          title='Total Orders'
          colors={['#BAEDBD', '#95A4FC', '#1C1C1C']} // Sale, Rent, Return color order
          series={[totalSales, totalRentals, totalReturns]}
        />
        {/* <DonutChart title="Return" colors={['#6EE7B7', '#93C5FD', '#000']} /> */}
      </div>
    </div>
  );
};

export default Analytics;
