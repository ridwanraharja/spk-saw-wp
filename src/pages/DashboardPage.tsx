import React from "react";
import { DashboardLayout } from "../layouts/DashboardLayout";
// import { MetricCard } from "../components/molecules/MetricCard";
import { ChartContainer } from "../components/molecules/ChartContainer";
import {
  FiUsers,
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiCalendar,
} from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const metrics = [
  {
    id: "users",
    title: "Jumlah Pemesanan",
    value: "2.409",
    change: "7,1%",
    icon: FiShoppingCart,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "selected",
    title: "Pesanan Seleksi",
    value: "68,9%",
    change: "",
    icon: FiDollarSign,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "driver",
    title: "Fill Driver",
    value: "68,9%",
    change: "",
    icon: FiTrendingUp,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: "customer",
    title: "Total Customer",
    value: "3.509",
    change: "",
    icon: FiUsers,
    color: "bg-red-100 text-red-600",
  },
];

const lineChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Revenue",
      data: [30, 40, 35, 50, 49, 60],
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.5)",
    },
  ],
};

const barChartData = {
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
      label: "Pemesanan",
      data: [500, 900, 700, 800, 950, 700, 900, 1000, 850, 950, 900, 1000],
      backgroundColor: "#6366f1",
      borderRadius: 6,
      barThickness: 18,
    },
    {
      label: "Seleksi",
      data: [300, 700, 500, 600, 800, 600, 700, 900, 700, 800, 700, 900],
      backgroundColor: "#c7d2fe",
      borderRadius: 6,
      barThickness: 18,
    },
  ],
};

const doughnutChartData = {
  labels: ["Product A", "Product B", "Product C"],
  datasets: [
    {
      data: [300, 50, 100],
      backgroundColor: [
        "rgba(59, 130, 246, 0.5)",
        "rgba(16, 185, 129, 0.5)",
        "rgba(245, 158, 11, 0.5)",
      ],
      borderColor: [
        "rgb(59, 130, 246)",
        "rgb(16, 185, 129)",
        "rgb(245, 158, 11)",
      ],
    },
  ],
};

const topCustomers = [
  { name: "PT Avian Cipta Solusi", count: 493 },
  { name: "CV ABCD", count: 483 },
  { name: "CV QOQRY TEKNIKA ALAM", count: 463 },
  { name: "PT Indoensia", count: 448 },
  { name: "PT Mitra Internasional", count: 410 },
  { name: "PT Avia Aviasi", count: 399 },
  { name: "Forza Jaya Abadi", count: 377 },
  { name: "PT Pertamina", count: 365 },
  { name: "Pertamina Cupuwatu Wonosari", count: 357 },
  { name: "PT Pertamina Ekang Balikpapan", count: 295 },
];

const orderOverview = [
  {
    no: 1,
    name: "Brad Simmons",
    jenis: "Pertamax",
    kuantitas: "2600 Liter",
    tanggal: "21 Desember 2021",
  },
  {
    no: 2,
    name: "Jessie Clarcson",
    jenis: "Turbo",
    kuantitas: "2600 Liter",
    tanggal: "20 Desember 2021",
  },
  {
    no: 3,
    name: "Brad Simmons",
    jenis: "Pertamax",
    kuantitas: "2600 Liter",
    tanggal: "20 Desember 2021",
  },
  {
    no: 4,
    name: "Jessie Clarcson",
    jenis: "Turbo",
    kuantitas: "2600 Liter",
    tanggal: "20 Desember 2021",
  },
  {
    no: 5,
    name: "Jessie Clarcson",
    jenis: "Turbo",
    kuantitas: "2600 Liter",
    tanggal: "20 Desember 2021",
  },
  {
    no: 6,
    name: "Brad Simmons",
    jenis: "Pertamax",
    kuantitas: "2600 Liter",
    tanggal: "20 Desember 2021",
  },
];

export const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className={`rounded-lg shadow bg-white flex items-center p-4 space-x-4 ${metric.color}`}
            >
              <div className={`rounded-full p-3 text-2xl ${metric.color}`}>
                {React.createElement(metric.icon)}
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  {metric.title}
                </div>
                <div className="text-xl font-bold">{metric.value}</div>
                {metric.change && (
                  <div className="text-xs text-green-600 font-semibold mt-1">
                    {metric.change}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Revenue Trend" subtitle="Last 6 months">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
              }}
            />
          </ChartContainer>

          <ChartContainer title="Weekly Orders" subtitle="Last 7 days">
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
              }}
            />
          </ChartContainer>

          <ChartContainer title="Product Distribution" subtitle="By category">
            <Doughnut
              data={doughnutChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
              }}
            />
          </ChartContainer>
        </div>

        {/* Overview Table & Top Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tabel Overview Pemesanan */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-base">Statistik Pemesanan</div>
              <button className="flex items-center px-3 py-1.5 rounded bg-gray-100 text-gray-600 text-xs font-medium">
                <FiCalendar className="mr-2" /> 12/12/2021
              </button>
            </div>
            <div className="h-64">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, grid: { color: "#f3f4f6" } },
                  },
                }}
              />
            </div>
          </div>

          {/* Customer Pemesan Terbanyak */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="font-semibold mb-4">Customer Pemesan Terbanyak</div>
            <ul className="space-y-2 text-sm">
              {topCustomers.map((cust) => (
                <li key={cust.name} className="flex justify-between">
                  <span>{cust.name}</span>
                  <span className="font-bold">{cust.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Overview Table */}
        <div className="bg-white rounded-lg p-6 shadow overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Overview Pemesanan</h2>
            <input
              type="text"
              placeholder="Search..."
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">No</th>
                <th className="py-2 px-4 text-left">Nama Customer</th>
                <th className="py-2 px-4 text-left">Jenis</th>
                <th className="py-2 px-4 text-left">Kuantitas</th>
                <th className="py-2 px-4 text-left">Tanggal Pengiriman</th>
              </tr>
            </thead>
            <tbody>
              {orderOverview.map((row) => (
                <tr key={row.no}>
                  <td className="py-2 px-4">{row.no}</td>
                  <td className="py-2 px-4">{row.name}</td>
                  <td className="py-2 px-4">{row.jenis}</td>
                  <td className="py-2 px-4">{row.kuantitas}</td>
                  <td className="py-2 px-4">{row.tanggal}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-end mt-4 space-x-2">
            <button className="px-3 py-1 rounded bg-gray-200 text-gray-600">
              Prev
            </button>
            <button className="px-3 py-1 rounded bg-primary text-white">
              1
            </button>
            <button className="px-3 py-1 rounded bg-gray-200 text-gray-600">
              2
            </button>
            <button className="px-3 py-1 rounded bg-gray-200 text-gray-600">
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
