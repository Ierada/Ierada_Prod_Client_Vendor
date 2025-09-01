import React, { useState, useMemo, useEffect } from "react";
import { Eye, Trash2, MoreVertical, Download, ChevronDown } from "lucide-react";
import { useAppContext } from "../../../context/AppContext";
import { getVendorReport } from "../../../services/api.report";
import TopProductsTable from "../../../components/Vendor/Tables/TopProductsTable";
import {
  formatDate,
  formatTime,
} from "../../../utils/date&Time/dateAndTimeFormatter";
import config from "../../../config/config";
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

// const Options = {
//   animationEnabled: true,
//   theme: "light2",
//   axisX: {
//     // title: "Sales (in Thousands)",
//     interval: 5000,
//     labelFormatter: e => `${e.value / 1000}k`,
//   },
//   axisY: {
//     // title: "Percentage (%)",
//     interval: 20,
//     suffix: "%",
//     gridColor: "#f0f0f0",
//   },
//   data: [
//     {
//       type: "area",
//       markerType: "circle",
//       color: "#3A5BFF",
//       fillOpacity: 0.3,
//       markerSize: 6,

//       dataPoints: [
//         { x: 5000, y: 20 },
//         { x: 10000, y: 40 },
//         { x: 15000, y: 30 },
//         { x: 20000, y: 90 },
//         { x: 25000, y: 40 },
//         { x: 30000, y: 50 },
//         { x: 35000, y: 20 },
//         { x: 40000, y: 70 },
//         { x: 45000, y: 60 },
//         { x: 50000, y: 80 },
//         { x: 55000, y: 60 },
//         { x: 60000, y: 70 },
//       ],
//     },
//   ],
// };

// const salesDetailDataPoints = [
//   { x: 4500, y: 25 },
//   { x: 8000, y: 48 },
//   { x: 15300, y: 30 },
//   { x: 2500, y: 86 },
//   { x: 2000, y: 35 },
//   { x: 38000, y: 55 },
//   { x: 35000, y: 28 },
//   { x: 48500, y: 66 },
//   { x: 45000, y: 58 },
//   { x: 50500, y: 89 },
//   { x: 55000, y: 60 },
//   { x: 60500, y: 75 },
// ];

const analyticsOptions = {
  cutout: "50%", // Adjust the inner radius (percentage of the chart's width)
  plugins: {
    legend: {
      display: false, // Hide the default legend
    },
  },
};

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border border-[#EFF0F6] rounded-lg text-[14px] font-satoshi font-medium appearance-none bg-white pr-8 relative cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.5rem center",
        backgroundSize: "1.5em 1.5em",
      }}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const Map = ({ data }) => {
  return (
    <div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className=""
    >
      <h2 className="text-[25px] font-semibold text-txtPage font-satoshi mb-4">
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
              {data.length > 0 ? (
                data.map((region) => (
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
                ))
              ) : (
                <div className="py-2 text-sm ">No data</div>
              )}
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

// Enhanced mock data
const generateOrderData = (count) => {
  const statuses = ["Paid", "Pending", "Failed"];
  const products = [
    "Silk Sari",
    "Pathani Kurti",
    "Chanderi Sari",
    "Designer Lehenga",
  ];
  const designers = [
    "ABC Designer",
    "XYZ Fashion",
    "Studio Elite",
    "Design House",
  ];
  const customers = ["Ashok", "Priya", "Irfan", "John", "Sarah", "Raj"];
  const paymentMethods = ["Online payment", "COD", "UPI", "Card"];

  return Array.from({ length: count }, (_, i) => ({
    id: `#${112400 + i}`,
    date: `${Math.floor(Math.random() * 28) + 1} ${
      ["Jan", "Feb", "Mar", "Apr"][Math.floor(Math.random() * 4)]
    } ${Math.floor(Math.random() * 12) + 1}pm`,
    name: products[Math.floor(Math.random() * products.length)],
    designer: designers[Math.floor(Math.random() * designers.length)],
    price: `Rs ${(Math.floor(Math.random() * 50) + 10) * 1000}`,
    customer: customers[Math.floor(Math.random() * customers.length)],
    total: `Total Amt${Math.floor(Math.random() * 1000)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    channel: ["Online", "In-store", "Phone"][Math.floor(Math.random() * 3)],
    orderType: ["Sale", "Return"][Math.floor(Math.random() * 3)],
  }));
};

const Report = () => {
  const { user } = useAppContext();
  const [reports, setReports] = useState([]);
  const [timeframe, setTimeframe] = useState("all-time");
  const [reportType, setReportType] = useState("sales-report");
  const [topic, setTopic] = useState("all");
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
    {
      x: "Jan:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Feb:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Mar:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Apr:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "May:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Jun:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Jul:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Aug:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Sep:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Oct:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Nov:0",
      totalSales: 0,
      y: 0,
    },
    {
      x: "Dec:0",
      totalSales: 0,
      y: 0,
    },
  ]);

  useEffect(() => {
    const fetchReports = async () => {
      const res = await getVendorReport({
        vendor_id: user.id,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      });
      if (res) {
        setReports(res.data);
        setDailySalesdataPoints(res.data.dailySalesdataPoints);
        setAnalyticsData(res.data.analyticsData);
        setSalesDetailDataPoints(res.data.salesDetailDataPoints);
        setDashboardData(res.data.dashboardData);
        // localStorage.setItem(
        //   `${config.BRAND_NAME}dailySales`,
        //   JSON.stringify(res.data.dailySales)
        // );
        // setDailySalesData(res.data.dailySales);
      }
    };
    fetchReports();
  }, [dateRange]);

  // const memoizedDailySalesData = useMemo(
  //   () => dailySalesData || [],
  //   [dailySalesData]
  // );

  // useEffect(() => {
  //   reports &&
  //     localStorage.setItem(
  //       `${config.BRAND_NAME}dailySales`,
  //       JSON.stringify(reports.dailySales)
  //     );
  // }, [reports]);

  // Dropdown options
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

  // Generate mock data
  const allOrders = useMemo(() => generateOrderData(20), []);

  // Filtered orders based on selections
  const filteredOrders = useMemo(() => {
    let filtered = [...allOrders];

    if (timeframe !== "all-time") {
      // Add timeframe filtering logic
      const now = new Date();
      const timeframeMap = {
        "last-year": 365,
        "last-month": 30,
        "last-week": 7,
        today: 1,
      };
      const days = timeframeMap[timeframe];
      if (days) {
        filtered = filtered.filter((order) => {
          const orderDate = new Date(order.date);
          const diffTime = Math.abs(now - orderDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= days;
        });
      }
    }

    if (reportType !== "all") {
      // Add report type filtering logic
      filtered = filtered.filter((order) => {
        if (reportType === "sales-report") return order.orderType === "Sale";
        return true;
      });
    }

    return filtered;
  }, [allOrders, timeframe, reportType]);

  const getChartData = (data, chartPeriod) => {
    if (!data || !data["2024"]) return [];

    if (chartPeriod === "month") {
      const monthData = data["2024"]["November"] || {};
      return Object.values(monthData).map(Number);
    } else {
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

  // Chart data
  const salesData = {
    options: {
      chart: {
        id: "sales-bar-chart",
        toolbar: { show: false },
      },
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
        bar: {
          borderRadius: 5,
          columnWidth: "30%",
        },
      },
    },
    series: [
      {
        name: "Sales",
        data: salesChartData.length ? salesChartData : [0, 0, 0, 0],
      },
    ],
  };

  if (!reports) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

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

      {/* Date Range Filter */}
      <div className="flex justify-end md:mb-6">
        <CustomDateRangePicker
          from={dateRange.from}
          to={dateRange.to}
          onSelect={setDateRange}
        />
      </div>

      {/* Filters */}
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

      {/* Charts */}
      <section className="p-5 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Sales Details</h2>
          {/* <select className="rounded-md px-6 text-sm py-1">
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select> */}
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
              {/* Table Heading outside */}
              {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Top Selling Products
              </h3> */}

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
                } // 🟢 Empty data structure
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
