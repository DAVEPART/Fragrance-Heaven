import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import { useAlert } from "../context/AlertContext";

const Orders = () => {
  const alert = useAlert();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const DELIVERY_FEE = 100;

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:8080/api/order/list");
      if (res.data.success) {
        setOrders(res.data.orders.reverse());
      } else {
        setError(res.data.message || "Failed to fetch orders.");
      }
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await axios.post("http://localhost:8080/api/order/status", {
        orderId,
        status: newStatus
      });
      if (res.data.success) {
        alert.success("Status updated");
        fetchUserOrders();
      } else {
        alert.error(res.data.message);
      }
    } catch (err) {
      alert.error("Failed to update status");
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      // Allow passing admin token if applicable, though endpoint currently works
      const res = await axios.get(`http://localhost:8080/api/order/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert.error("Failed to download invoice");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Order Placed': 'blue',
      'Processing': 'yellow',
      'Shipped': 'indigo',
      'Delivered': 'green',
      'Cancelled': 'red',
    };
    return statusMap[status] || 'gray';
  };

  const renderItemsSummary = (items) => {
    const itemList = typeof items === 'string' ? JSON.parse(items) : items;
    if (!itemList || itemList.length === 0) return "No items";

    return (
      <div className="flex flex-col gap-1">
        {itemList.map((item, i) => (
          <div key={i} className="text-[11px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
            {item.name} x {item.quantity}
          </div>
        ))}
      </div>
    );
  };

  const renderAddress = (address) => {
    if (!address) return "N/A";
    return (
      <div className="text-[11px] leading-tight">
        <p className="font-bold text-gray-800">{address.firstName} {address.lastName}</p>
        <p className="text-gray-500">{address.email}</p>
        <p className="text-gray-400 mt-1">{address.street}, {address.city}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <Card title="Orders">
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Orders">
        <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100 mx-4">
          <p className="font-bold">Error Occurred</p>
          <p className="text-sm">{error}</p>
          <button onClick={fetchUserOrders} className="mt-4 text-xs bg-red-500 text-white px-4 py-2 rounded-lg">Retry</button>
        </div>
      </Card>
    );
  }

  return (
    <div className="p-1 sm:p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <button onClick={fetchUserOrders} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      <Card>
        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl italic">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider text-left border-b border-gray-100">
                  <th className="py-4 px-6 font-bold">Order Details</th>
                  <th className="py-4 px-6 font-bold">Customer</th>
                  <th className="py-4 px-6 font-bold">Items</th>
                  <th className="py-4 px-6 font-bold">Payment</th>
                  <th className="px-6 py-4 font-semibold text-gray-500">Invoice</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 rounded-tr-xl">Status</th>
                  <th className="py-4 px-6 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-6">
                      <p className="text-xs font-mono text-primary-600 mb-1">#{order.id}</p>
                      <p className="text-[10px] text-gray-400">{new Date(order.date).toLocaleString()}</p>
                      <p className="text-sm font-bold text-gray-800 mt-2">₹{order.amount + DELIVERY_FEE}</p>
                    </td>
                    <td className="py-5 px-6">
                      {renderAddress(order.address)}
                    </td>
                    <td className="py-5 px-6">
                      {renderItemsSummary(order.items)}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-1">
                        <Badge variant={order.payment ? 'green' : 'yellow'} size="sm">
                          {order.payment ? "Paid" : "Pending"}
                        </Badge>
                        <p className="text-[10px] text-gray-400 font-medium">{order.paymentMethod}</p>
                        {order.paymentStatus && order.paymentStatus !== 'PENDING' && (
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full w-fit
                            ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                            {order.paymentStatus}
                          </span>
                        )}
                        {order.razorpayPaymentId && (
                          <div className="mt-1 p-1.5 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-[9px] text-blue-400 uppercase tracking-wide font-bold">Payment ID</p>
                            <p className="text-[9px] font-mono text-blue-700 break-all">{order.razorpayPaymentId}</p>
                          </div>
                        )}
                        {order.razorpayOrderId && (
                          <div className="mt-0.5 p-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                            <p className="text-[9px] text-indigo-400 uppercase tracking-wide font-bold">RZP Order ID</p>
                            <p className="text-[9px] font-mono text-indigo-700 break-all">{order.razorpayOrderId}</p>
                          </div>
                        )}
                        {order.transactionDate && (
                          <p className="text-[9px] text-gray-400 mt-0.5">
                            Txn: {new Date(order.transactionDate).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <button
                        onClick={() => handleDownloadInvoice(order.id)}
                        className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors border border-indigo-100"
                      >
                        Download
                      </button>
                    </td>
                    <td className="py-5 px-6">
                      <Badge variant={getStatusBadge(order.status)} size="sm">
                        {order.status || "Order Placed"}
                      </Badge>
                      <p className="text-[10px] text-indigo-400 mt-1 font-bold">
                        {order.deliveryDate ? `Del: ${new Date(order.deliveryDate).toLocaleDateString()}` : 'No date'}
                      </p>
                    </td>
                    <td className="py-5 px-6">
                      <select
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white shadow-sm"
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      >
                        <option value="Order Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Orders;
