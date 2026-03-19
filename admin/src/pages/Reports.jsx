import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import { useAlert } from "../context/AlertContext";

const RANGES = [
  { key: "last-week", label: "Last 7 Days" },
  { key: "last-month", label: "Last Month" },
  { key: "last-year", label: "Last Year" },
];

const BASE_URL = "http://localhost:8080";
const currency = "₹";

const Reports = () => {
  const alert = useAlert();
  const [activeRange, setActiveRange] = useState("last-month");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    fetchReport(activeRange);
  }, [activeRange]);

  const fetchReport = async (range) => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/reports/purchases?range=${range}`);
      if (res.data.success) {
        setReport(res.data.report);
      } else {
        setError(res.data.message || "Failed to load report.");
      }
    } catch (err) {
      console.error("Admin report error:", err);
      setError("Failed to load business report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/reports/purchases/pdf?range=${activeRange}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `AdminReport-${activeRange}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      alert.success("PDF exported successfully!");
    } catch (err) {
      console.error("PDF export error:", err);
      alert.error("Failed to export PDF. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  const formatCurrency = (val) =>
    val !== undefined && val !== null ? `${currency}${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "₹0";

  return (
    <div className="p-1 sm:p-4">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Business Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analytics & purchase summary for selected period</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchReport(activeRange)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || loading || !!error}
            className={`bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-md ${(exportingPdf || loading) ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {exportingPdf ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* ── Range Selector ── */}
      <div className="flex gap-2 mb-6 p-1.5 bg-white rounded-xl border border-gray-200 w-fit shadow-sm">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setActiveRange(r.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeRange === r.key
                ? "bg-primary-500 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-primary-600"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <Card>
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" />
          </div>
        </Card>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <Card>
          <div className="text-center py-16 text-red-500 bg-red-50 rounded-xl border border-red-100 mx-4">
            <p className="text-lg font-bold mb-1">Failed to Load Report</p>
            <p className="text-sm mb-4">{error}</p>
            <button onClick={() => fetchReport(activeRange)} className="text-xs bg-red-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-600">
              Retry
            </button>
          </div>
        </Card>
      )}

      {/* ── Report Content ── */}
      {report && !loading && (
        <div className="flex flex-col gap-6">

          {/* ── KPI Summary Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 border-t-4 border-t-primary-400">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Total Orders</p>
              <p className="text-4xl font-extrabold text-gray-800">{report.totalOrders}</p>
              <p className="text-xs text-gray-400 mt-1">orders received</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 border-t-4 border-t-green-400">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Total Revenue</p>
              <p className="text-4xl font-extrabold text-gray-800">{formatCurrency(report.totalRevenue)}</p>
              <p className="text-xs text-gray-400 mt-1">incl. delivery charges</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 border-t-4 border-t-blue-400">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Items Sold</p>
              <p className="text-4xl font-extrabold text-gray-800">{report.totalItemsSold}</p>
              <p className="text-xs text-gray-400 mt-1">units across all orders</p>
            </div>
          </div>

          {/* ── Best Selling Products ── */}
          {report.bestSellingProducts && report.bestSellingProducts.length > 0 && (
            <Card title="Best Selling Products">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider text-left border-b border-gray-100">
                      <th className="py-3 px-4 font-bold">#</th>
                      <th className="py-3 px-4 font-bold">Product</th>
                      <th className="py-3 px-4 font-bold text-right">Units Sold</th>
                      <th className="py-3 px-4 font-bold text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {report.bestSellingProducts.map((prod, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold
                            ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-700" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-500"}`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-800 text-sm">{prod.name}</td>
                        <td className="py-3 px-4 text-right font-bold text-gray-700">{prod.quantity}</td>
                        <td className="py-3 px-4 text-right font-bold text-primary-600">{formatCurrency(prod.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── Payment Analytics ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Payment Method Breakdown */}
            {report.paymentMethodBreakdown && (
              <Card title="Payment Method Breakdown">
                <div className="divide-y divide-gray-50">
                  {Object.entries(report.paymentMethodBreakdown).map(([method, count]) => (
                    <div key={method} className="flex justify-between items-center py-3 px-1">
                      <span className="text-sm font-semibold text-gray-700">{method}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-400 rounded-full"
                            style={{ width: `${Math.min(100, (count / report.totalOrders) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Payment Status Breakdown */}
            {report.paymentStatusBreakdown && (
              <Card title="Payment Status Breakdown">
                <div className="divide-y divide-gray-50">
                  {Object.entries(report.paymentStatusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center py-3 px-1">
                      <Badge variant={status === "PAID" ? "green" : status === "FAILED" ? "red" : "yellow"} size="sm">
                        {status}
                      </Badge>
                      <span className="text-sm font-bold text-gray-700">{count} orders</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* ── Orders By Date ── */}
          {report.ordersByDate && Object.keys(report.ordersByDate).length > 0 && (
            <Card title="Orders By Date">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider text-left border-b border-gray-100">
                      <th className="py-3 px-4 font-bold">Date</th>
                      <th className="py-3 px-4 font-bold text-right">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {Object.entries(report.ordersByDate).map(([date, count]) => (
                      <tr key={date} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-700 font-medium">{date}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 font-bold text-primary-600">
                            {count}
                            <span className="text-[9px] text-gray-400 font-normal">orders</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── No orders empty state ── */}
          {report.totalOrders === 0 && (
            <Card>
              <div className="text-center py-20 text-gray-400">
                <p className="text-3xl mb-3">📊</p>
                <p className="text-lg font-semibold">No orders found</p>
                <p className="text-sm mt-1">No orders were placed during <strong>{RANGES.find(r => r.key === activeRange)?.label}</strong></p>
              </div>
            </Card>
          )}

        </div>
      )}
    </div>
  );
};

export default Reports;
