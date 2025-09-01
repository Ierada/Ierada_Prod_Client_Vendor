import React from 'react';
import Chart from 'react-apexcharts';

const DeviceUsageChart = () => {
  const options = {
    labels: ['Mobile', 'Tablet', 'Desktop'],
    colors: ['#59A7FF', '#2CDDC7', '#849AA9'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
        },
      },
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
      formatter: function (val) {
        return `${val.toFixed(1)}%`;
      },
      style: {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
      },
    },
    states: {
      active: {
        filter: {
          type: 'none',
        },
      },
      hover: {
        filter: {
          type: 'none',
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return `${val}%`;
        },
      },
    },
  };
  const series = [50, 25, 25];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-[#555555]  text-[18px] font-satoshi font-medium mb-2">
        Users By Device
      </h3>
      <Chart options={options} series={series} type="donut" />
    </div>
  );
};

export default DeviceUsageChart;
