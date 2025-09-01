import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Initial Data for all years
const initialData = {
  labels: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ],
  datasets: [
    {
      label: '2019',
      data: [10, 20, 15, 25, 12, 18, 15, 22, 17, 10, 5, 8],
      backgroundColor: '#E05C43',
      borderRadius: 8,
    },
    {
      label: '2020',
      data: [8, 18, 12, 20, 10, 15, 17, 18, 13, 8, 10, 7],
      backgroundColor: '#B88DD6',
      borderRadius: 8,
    },
    {
      label: '2021',
      data: [12, 22, 17, 23, 15, 20, 19, 21, 18, 15, 12, 10],
      backgroundColor: '#51B960',
      borderRadius: 8,
    },
    {
      label: '2022',
      data: [15, 25, 20, 27, 18, 22, 21, 24, 20, 18, 15, 12],
      backgroundColor: '#6E8EFF',
      borderRadius: 8,
    },
    {
      label: '2023',
      data: [20, 30, 25, 32, 22, 28, 27, 30, 26, 22, 20, 18],
      backgroundColor: '#FFDB89',
      borderRadius: 8,
    },
  ],
};

const CustomerRetention = () => {
  const [selectedYear, setSelectedYear] = useState(null);

  // Filter data based on the selected year
  const getFilteredData = () => {
    if (!selectedYear) return initialData; // Show all years if no selection
    return {
      labels: initialData.labels,
      datasets: initialData.datasets.filter((dataset) => dataset.label === selectedYear),
    };
  };

  const filteredData = getFilteredData();

  const yearColorMap = {
    '2019': '#E05C43',
    '2020': '#B88DD6',
    '2021': '#51B960',
    '2022': '#6E8EFF',
    '2023': '#FFDB89',
  };

  return (
    <div className="mt-4">
      <h2 className="text-[26px] font-semibold font-satoshi text-txtPage mb-4">
        Customer Retention
      </h2>

      <div className="bg-white border shadow-md rounded-lg p-12 relative">
        <div className="flex">
          <div className="flex flex-col justify-around items-start sticky left-0 bg-white pt-8 pr-4 z-10">
            {initialData.datasets.map((dataset) => (
              <div
                key={dataset.label}
                onClick={() => setSelectedYear(selectedYear === dataset.label ? null : dataset.label)}
                className={`cursor-pointer text-sm font-medium  ${
                  selectedYear === dataset.label ? 'font-bold' : ''
                }`}
                style={{
                  color: selectedYear === dataset.label ? yearColorMap[dataset.label] : '#9CA3AF', // Dynamic Color Logic
                }}
              >
                {dataset.label}
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <div style={{ width: '1000px' }}>
              <Bar
                data={filteredData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }, // Hide default legend
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: {
                        color: '#6B7280',
                        font: { size: 12 },
                        maxRotation: 0,
                        autoSkip: false,
                      },
                      barPercentage: 0.5, // Reduce bar width
                      categoryPercentage: 0.6, // Reduce gap between bars
                    },
                    y: {
                      beginAtZero: true,
                      grid: { display: true },
                      ticks: { color: '#6B7280', font: { size: 12 } },
                    },
                  },
                  barThickness: 30, // Adjust bar thickness
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRetention;
