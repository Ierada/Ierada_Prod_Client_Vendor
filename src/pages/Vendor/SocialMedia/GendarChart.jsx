import React from 'react';
import Chart from 'react-apexcharts';

const GenderChart = () => {
  const options = {
    labels: ['Men', 'Women'],
    colors: ['#89C0FF', '#FFB2D7'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      style: {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
      },
    },
    states: {
      active: {
        filter: {
          type: 'none', // Disables color change on click
        },
      },
      hover: {
        filter: {
          type: 'none', // Disables color change on hover
        },
      },
    },
  };
  const series = [65, 35];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-[#555555]  text-[18px] font-satoshi font-medium mb-2">
        Statistic By Gender
      </h3>
      <Chart options={options} series={series} type="pie" />
    </div>
  );
};

export default GenderChart;
