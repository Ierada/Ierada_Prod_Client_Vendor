

import React from 'react';
import Chart from 'react-apexcharts';

const FollowerAcquisitionChart = () => {
  const options = {
    chart: { type: 'bar', stacked: true },
    colors: ['#D32F2F', '#757575', '#4A90E2', '#82B1FF'],
    xaxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
    },
  };
  const series = [
    {
      name: 'Recommended',
      data: [40, 30, 50, 60, 70, 90, 80, 60, 70, 80, 100, 110],
    },
    { name: 'Shared', data: [30, 20, 40, 50, 60, 70, 60, 50, 60, 70, 80, 90] },
    { name: 'Search', data: [20, 10, 30, 40, 50, 60, 50, 40, 50, 60, 70, 80] },
    { name: 'Others', data: [10, 5, 20, 30, 40, 50, 40, 30, 40, 50, 60, 70] },
  ];

  return (
    <div className="mt-4">
      <Chart options={options} series={series} type="bar" height={250} />
    </div>
  );
};

export default FollowerAcquisitionChart;
