

import React from 'react';
import Chart from 'react-apexcharts';

const ProfileVisitsChart = () => {
  const options = {
    chart: { type: 'bar' },
    colors: ['#4A90E2'],
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: false,
        columnWidth: '70%',
      },
    },
    yaxis: {
      show: false, 
    },
    grid: {
      show: false, 
    },
  };
  const series = [
    { name: 'Visits', data: [446, 285, 382, 368, 413, 307, 432] },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="font-semibold mb-2">Profile Visits</h3>
      <Chart options={options} series={series} type="bar" />
    </div>
  );
};

export default ProfileVisitsChart;
