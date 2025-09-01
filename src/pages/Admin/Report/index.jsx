import React, { useState, useMemo, useEffect } from "react";
import { Eye, Trash2, MoreVertical, Download, ChevronDown } from "lucide-react";
import { useAppContext } from "../../../context/AppContext";
import { getAdminReport } from "../../../services/api.report";
import TopProductsTable from "../../../components/Vendor/Tables/TopProductsTable";
import map from "/assets/banners/vendor_map.svg";
import { Doughnut } from "react-chartjs-2";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const analyticsOptions = {
  cutout: "50%", // Adjust the inner radius (percentage of the chart's width)
  plugins: {
    legend: {
      display: false, // Hide the default legend
    },
  },
};

const Map = ({ data }) => {
  return (
    <div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className=""
    >
      <h2 className="text-[25px] font-semibold text-txtPage font-satoshi mb-6 my-2">
        Revenue by Region
      </h2>
      <div className="flex flex-col-reverse md:flex-row items-start border-2 border-[#F2F2F2] bg-white rounded-lg p-6">
        <div className="flex-1 md:pr-6 w-full max-h-94 overflow-y-auto scrollbar-hide">
          <table className="table-auto w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                <th className="text-left text-gray-400 text-sm font-medium py-2">
                  City
                </th>
                <th className="text-left text-gray-400 text-sm font-medium py-2">
                  Revenue
                </th>
                <th className="text-left text-gray-400 text-sm font-medium py-2">
                  Ratio
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((region) => (
                <React.Fragment key={region.name}>
                  <tr>
                    <td className="py-2 text-sm">{region.name || "N/A"}</td>
                    <td className="py-2 text-sm">
                      ₹{region.value.toLocaleString()}
                    </td>
                    <td className="py-2 text-sm">{region.percentage}%</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="py-2">
                      <div className="w-full bg-gray-200 h-1 rounded-md">
                        <div
                          className="h-1 rounded-md"
                          style={{
                            width: `${region.percentage}%`,
                            backgroundColor: "#6E8EFF",
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="">
          <img className="w-full h-full object-contain" src={map} alt="Map" />
        </div>
      </div>
    </div>
  );
};

const Report = () => {
  const { user } = useAppContext();
  const [reports, setReports] = useState(null);
  const [salesChartPeriod, setSalesChartPeriod] = useState("year");
  const [dailySalesdataPoints, setDailySalesdataPoints] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    stateData: [],
    topSellingProducts: [],
  });
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [salesDetailDataPoints, setSalesDetailDataPoints] = useState([
    { x: "Jan:0", totalSales: 0, y: 0 },
    { x: "Feb:0", totalSales: 0, y: 0 },
    { x: "Mar:0", totalSales: 0, y: 0 },
    { x: "Apr:0", totalSales: 0, y: 0 },
    { x: "May:0", totalSales: 0, y: 0 },
    { x: "Jun:0", totalSales: 0, y: 0 },
    { x: "Jul:0", totalSales: 0, y: 0 },
    { x: "Aug:0", totalSales: 0, y: 0 },
    { x: "Sep:0", totalSales: 0, y: 0 },
    { x: "Oct:0", totalSales: 0, y: 0 },
    { x: "Nov:0", totalSales: 0, y: 0 },
    { x: "Dec:0", totalSales: 0, y: 0 },
  ]);
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getAdminReport({
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
        });

        if (res) {
          if (res.status === 1) {
            setReports(res.data);
            setDailySalesdataPoints(res.data.dailySalesdataPoints || []);
            console.log(res.data.analyticsData);

            setAnalyticsData(res.data.analyticsData || []);
            setSalesDetailDataPoints(res.data.salesDetailDataPoints || []);
            setDashboardData(
              res.data.dashboardData || {
                stateData: [],
                topSellingProducts: [],
              }
            );
          } else {
            console.error("API response status is not 1:", res.message);
          }
        } else {
          console.error("No data returned from the API");
        }
      } catch (error) {
        console.error("Error fetching vendor report:", error);
        notifyOnFail("Error fetching data from API");
      }
    };

    fetchReports();
  }, [dateRange]);

  const timeframeOptions = [
    { value: "all-time", label: "All time" },
    { value: "last-year", label: "Last Year" },
    { value: "last-month", label: "Last Month" },
    { value: "last-week", label: "Last Week" },
    { value: "today", label: "Today" },
  ];

  const reportTypeOptions = [{ value: "sales-report", label: "Sales Report" }];

  const topicOptions = [
    { value: "all", label: "All Topics" },
    { value: "marketing", label: "Marketing" },
    { value: "finance", label: "Finance" },
    { value: "operations", label: "Operations" },
  ];

  const getChartData = (data, chartPeriod) => {
    if (!data || !data["2024"]) return [];
    const monthKeys = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    if (chartPeriod === "month") {
      const monthData = data["2024"]["November"] || {};
      return Object.values(monthData).map(Number);
    } else {
      return monthKeys.map((month) => {
        const monthData = data["2024"][month] || {};
        return Object.values(monthData).reduce(
          (sum, value) => sum + Number(value),
          0
        );
      });
    }
  };

  const salesChartData = getChartData(reports?.Sales, salesChartPeriod);

  const salesData = {
    options: {
      chart: { id: "sales-bar-chart", toolbar: { show: false } },
      xaxis: {
        categories:
          salesChartPeriod === "month"
            ? ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]
            : [
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
      },
      colors: ["#9F1239"],
      plotOptions: {
        bar: { borderRadius: 5, columnWidth: "30%" },
      },
    },
    series: [
      {
        name: "Sales",
        data: salesChartData.length ? salesChartData : [0, 0, 0, 0],
      },
    ],
  };

  // Safe fallback data handling
  // const safeAnalyticsData = analyticsData?.length ? analyticsData : [];
  // const safeDailySalesData = dailySalesdataPoints?.length
  //   ? dailySalesdataPoints
  //   : [];
  // const safeSalesDetailData = salesDetailDataPoints?.length
  //   ? salesDetailDataPoints
  //   : [];

  const CustomDateRangePicker = ({ from, to, onSelect }) => {
    return (
      <div className="w-full flex flex-col md:flex-row items-center md:space-x-4 bg-white rounded-lg shadow-md p-4">
        <input
          type="date"
          value={from.toISOString().split("T")[0]}
          onChange={(e) =>
            onSelect({
              from: new Date(e.target.value),
              to,
            })
          }
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={to.toISOString().split("T")[0]}
          onChange={(e) =>
            onSelect({
              from,
              to: new Date(e.target.value),
            })
          }
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  };

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-[black] text-2xl lg:text-3xl font-semibold">
          Report
        </h1>
        {/* <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue hover:bg-gray-50 rounded-md text-sm font-medium">
          <Download className="w-4 h-4" />
          Export Data
        </button> */}
      </div>

      <div className="flex justify-end md:mb-6">
        <CustomDateRangePicker
          from={dateRange.from}
          to={dateRange.to}
          onSelect={setDateRange}
        />
      </div>

      {/* <div className="grid md:grid-cols-3 gap-4">
        <CustomSelect
          value={timeframe}
          onChange={setTimeframe}
          options={timeframeOptions}
          placeholder="Select timeframe"
        />
        <CustomSelect
          value={reportType}
          onChange={setReportType}
          options={reportTypeOptions}
          placeholder="Select report type"
        />
        <CustomSelect
          value={topic}
          onChange={setTopic}
          options={topicOptions}
          placeholder="Select topic"
        />
      </div> */}

      <section className="p-5 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Sales Details</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={salesDetailDataPoints}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              tickFormatter={(value) => {
                const parts = value.split(":");
                return parts[1] ? `${parts[1] / 1000}k` : value; // Prevents errors if ":" is missing
              }}
              label={{ position: "insideBottom", offset: -5 }}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              label={{ angle: -90, position: "insideLeft" }}
              domain={[0, 100]}
            />
            <Tooltip formatter={(value) => `${value}%`} />
            <Area
              type="monotone"
              dataKey="y"
              stroke="#3A5BFF"
              fill="rgba(58, 91, 255, 0.3)"
              dot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full lg:w-1/2">
          {dashboardData && dashboardData.topSellingProducts.length > 0 ? (
            <>
              <TopProductsTable
                title={"Top Selling Products"}
                products={dashboardData.topSellingProducts}
              />
            </>
          ) : (
            <TopProductsTable title={"Top Selling Products"} products={[]} />
          )}
        </div>

        <div className="w-full lg:w-1/2">
          {dashboardData && <Map data={dashboardData.stateData} />}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 ">
        <section className="w-full lg:w-1/2 bg-white border-2 border-[#F2F2F2] rounded-lg p-4 h-64 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800">Daily Sales</h2>

          <div className="flex items-center justify-center flex-grow">
            <ResponsiveContainer>
              <LineChart
                data={
                  dailySalesdataPoints.length === 0
                    ? [{ month: "", sales: 0 }]
                    : dailySalesdataPoints
                }
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  label={{ position: "insideBottom", offset: -10 }}
                />
                <YAxis
                  label={{ angle: -90, position: "insideLeft" }}
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />

                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="rgba(255, 118, 117, 1)"
                  strokeWidth={3}
                  dot={
                    dailySalesdataPoints.length === 0
                      ? false
                      : { r: 5, fill: "#ff7675" }
                  } // Hide dots if no data
                  activeDot={
                    dailySalesdataPoints.length === 0 ? false : { r: 8 }
                  }
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white border-2 border-[#F2F2F2] lg:w-1/2 rounded-lg p-6 w-full h-64 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800">Analytics</h2>

          <div className="flex items-center justify-center space-y-4 gap-6 flex-grow">
            {analyticsData.length === 0 ? (
              // 🎨 Empty State UI
              <div className="flex flex-col items-center justify-center h-full w-full">
                <svg
                  className="w-20 h-20 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10M2 12A10 10 0 0 1 12 2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <p className="text-gray-500 text-sm mt-2">No data available</p>
              </div>
            ) : (
              <>
                <div className="h-45">
                  <Doughnut data={analyticsData} options={analyticsOptions} />
                </div>

                <div className="flex flex-col space-y-2 text-center">
                  {analyticsData.labels.map((label, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span
                        className="w-4 h-4 inline-block rounded-full"
                        style={{
                          backgroundColor:
                            analyticsData.datasets[0].backgroundColor[index],
                        }}
                      ></span>
                      <span className="text-gray-700 font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Report;
