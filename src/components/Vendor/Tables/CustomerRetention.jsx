import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CustomerRetention = ({ customerRetentionData }) => {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Check if customerRetentionData exists and contains datasets
  const hasData =
    customerRetentionData &&
    customerRetentionData.datasets &&
    customerRetentionData.datasets.length > 0;

  // Define a placeholder empty dataset
  const emptyData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "No Data",
        data: Array(12).fill(0),
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
      },
    ],
  };

  // Use the actual data if available, otherwise fallback to empty data
  const filteredData = hasData
    ? {
        ...customerRetentionData,
        datasets: selectedYear
          ? customerRetentionData.datasets.filter(
              (dataset) => dataset.label === selectedYear
            )
          : customerRetentionData.datasets,
      }
    : emptyData;

  return (
    <div className="">
      <h2 className="text-[26px] font-semibold font-satoshi text-txtPage mb-8">
        Customer Retention
      </h2>

      <div className="relative">
        <div className="flex bg-white border-2 border-[#F2F2F2] rounded-lg p-9">
          {hasData && (
            <div className="flex flex-col justify-around items-start sticky left-0 bg-white pt-8 pr-4 z-10">
              {customerRetentionData.datasets.map((dataset) => (
                <div
                  key={dataset.label}
                  onClick={() =>
                    setSelectedYear(
                      selectedYear === dataset.label ? null : dataset.label
                    )
                  }
                  className={`cursor-pointer text-sm font-medium ${
                    selectedYear === dataset.label ? "font-bold" : ""
                  }`}
                  style={{ color: dataset.backgroundColor }}
                >
                  {dataset.label}
                </div>
              ))}
            </div>
          )}

          {/* Bar Chart */}
          <div className="overflow-x-auto">
            <div style={{ width: "1000px", height: "350px" }}>
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
                        color: "#6B7280",
                        font: { size: 12 },
                        maxRotation: 0,
                        autoSkip: false,
                      },
                      barPercentage: 0.8,
                      categoryPercentage: 0.8,
                    },
                    y: {
                      beginAtZero: true,
                      grid: { display: true },
                      ticks: { color: "#6B7280", font: { size: 12 } },
                    },
                  },
                  barThickness: 40,
                }}
              />
            </div>
          </div>
        </div>

        {/* Show "No Data Available" message if there's no data */}
        {!hasData && (
          <p className="text-center text-gray-500 mt-4">
            No customer retention data available.
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomerRetention;
