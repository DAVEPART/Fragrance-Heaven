import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import api from '../api/api';
import Button from '../components/common/Button';
import { assets } from '../assets/assets';
import { useAlert } from '../context/AlertContext';

const REPORT_RANGES = [
  { key: 'all', label: 'All Orders' },
  { key: 'last-week', label: 'Last 7 Days' },
  { key: 'last-month', label: 'Last Month' },
  { key: 'last-year', label: 'Last Year' },
];

const Orders = () => {
  const { currency, token, navigate } = useContext(ShopContext);
  const alert = useAlert();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Report state
  const [activeRange, setActiveRange] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [emailingSent, setEmailingSent] = useState(false);

  const delivery_fee = 100;

  // ──────────────────────────────────────
  //  FETCH ALL ORDERS (default tab)
  // ──────────────────────────────────────
  const fetchOrders = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const response = await api.post('/api/order/userorders', {}, { headers: { token } });
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────
  //  FETCH REPORT (range tabs)
  // ──────────────────────────────────────
  const fetchReport = async (range) => {
    if (!token) { alert.error('Please log in to view your report'); return; }
    setReportLoading(true);
    setReportData(null);
    try {
      const res = await api.get(`/api/orders/user/report?range=${range}`, { headers: { token } });
      if (res.data.success) {
        setReportData(res.data.report);
      } else {
        alert.error(res.data.message || 'Failed to fetch report');
      }
    } catch (err) {
      console.error('Report fetch error:', err);
      alert.error('Failed to load report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeRange === 'all') {
      fetchOrders();
    } else {
      fetchReport(activeRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeRange]);

  const handleRangeChange = (rangeKey) => {
    setActiveRange(rangeKey);
    if (rangeKey === 'all') setReportData(null);
  };

  // ──────────────────────────────────────
  //  CANCEL ORDER
  // ──────────────────────────────────────
  const handleCancelOrder = async (orderId) => {
    const confirmed = await alert.confirm('Cancel Order', 'Are you sure you want to cancel this order? This action cannot be undone.');
    if (!confirmed) return;
    setCancellingId(orderId);
    try {
      const response = await api.post('/api/order/status', { orderId, status: 'Cancelled' });
      if (response.data.success) {
        alert.success('Order cancelled successfully');
        fetchOrders();
      } else {
        alert.error(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      alert.error('An error occurred during cancellation');
    } finally {
      setCancellingId(null);
    }
  };

  // ──────────────────────────────────────
  //  INVOICE DOWNLOAD
  // ──────────────────────────────────────
  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/api/order/${orderId}/invoice`, { headers: { token }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert.error('Failed to download invoice');
    }
  };

  // ──────────────────────────────────────
  //  REPORT PDF DOWNLOAD
  // ──────────────────────────────────────
  const handleDownloadReport = async () => {
    if (!token) { alert.error('Login required'); return; }
    setDownloadingPdf(true);
    try {
      const res = await api.get(`/api/orders/user/report/pdf?range=${activeRange}`, {
        headers: { token },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PurchaseReport-${activeRange}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      alert.success('Report downloaded!');
    } catch (err) {
      console.error('PDF download error:', err);
      alert.error('Failed to download PDF report');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ──────────────────────────────────────
  //  EMAIL REPORT
  // ──────────────────────────────────────
  const handleEmailReport = async () => {
    if (!token) { alert.error('Login required'); return; }
    setEmailingSent(true);
    try {
      const res = await api.post(`/api/orders/user/report/email?range=${activeRange}`, {}, { headers: { token } });
      if (res.data.success) {
        alert.success(res.data.message || 'Report sent to your email!');
      } else {
        alert.error(res.data.message || 'Failed to send report email');
      }
    } catch (err) {
      console.error('Email error:', err);
      alert.error('Failed to send report. Please try again.');
    } finally {
      setEmailingSent(false);
    }
  };

  // ──────────────────────────────────────
  //  HELPERS
  // ──────────────────────────────────────
  const getDeliveryStatus = (deliveryTimestamp) => {
    if (!deliveryTimestamp) return 'Arrival Date N/A';
    const today = new Date(); today.setHours(0,0,0,0);
    const delivery = new Date(deliveryTimestamp); delivery.setHours(0,0,0,0);
    const diffDays = Math.ceil((delivery.getTime() - today.getTime()) / 86400000);
    if (diffDays === 0) return 'Arriving Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Delivered';
    return delivery.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const canCancel = (deliveryDate, status) => {
    if (status === 'Cancelled' || status === 'Delivered') return false;
    if (!deliveryDate) return true;
    return (deliveryDate - Date.now()) / 86400000 >= 2;
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      'Pending': 'bg-orange-50 text-orange-600 border-orange-100',
      'Order Placed': 'bg-blue-50 text-blue-600 border-blue-100',
      'Processing': 'bg-yellow-50 text-yellow-600 border-yellow-100',
      'Shipped': 'bg-indigo-50 text-indigo-600 border-indigo-100',
      'Delivered': 'bg-green-50 text-green-600 border-green-100',
      'Cancelled': 'bg-red-50 text-red-600 border-red-100'
    };
    const currentStyle = styles[status] || 'bg-gray-50 text-gray-600 border-gray-100';
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${currentStyle} text-[10px] font-bold uppercase tracking-wider`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Delivered' ? 'bg-green-500' : status === 'Cancelled' ? 'bg-red-500' : 'bg-current animate-pulse'}`}></span>
        {status}
      </div>
    );
  };

  // ══════════════════════════════════════
  //  RENDER — Loading
  // ══════════════════════════════════════
  if (loading && activeRange === 'all') {
    return (
      <div className='flex items-center justify-center min-h-[40vh]'>
        <div className='w-12 h-12 border-4 border-[#FFF0F5] border-t-[#FFD1DC] rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='pt-10 mb-20'>
      <div className='text-2xl font-semibold mb-8 text-center sm:text-left'>
        <Title text1='MY' text2='ORDERS' />
      </div>

      {/* ── RANGE FILTER TABS ── */}
      <div className='mb-8'>
        <div className='flex flex-wrap gap-2 p-1.5 bg-[#FFF0F5]/60 rounded-2xl border border-[#FFD1DC]/30 w-fit'>
          {REPORT_RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => handleRangeChange(r.key)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeRange === r.key
                  ? 'bg-[#FFD1DC] text-[#7d1f3d] shadow-sm scale-[1.02]'
                  : 'text-gray-500 hover:bg-[#FFD1DC]/30 hover:text-[#b0395e]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Report action buttons (only when a range is selected) */}
        {activeRange !== 'all' && (
          <div className='flex flex-wrap gap-3 mt-4'>
            <button
              onClick={handleDownloadReport}
              disabled={downloadingPdf || reportLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#b0395e] text-white hover:bg-[#922e4d] transition-all shadow-md active:scale-95 ${downloadingPdf ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              {downloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}
            </button>
            <button
              onClick={handleEmailReport}
              disabled={emailingSent || reportLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white text-[#b0395e] border-2 border-[#FFD1DC] hover:bg-[#FFF0F5] transition-all shadow-sm active:scale-95 ${emailingSent ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {emailingSent ? 'Sending...' : 'Email Me This Report'}
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════ */}
      {/* REPORT MODE (range tabs)              */}
      {/* ══════════════════════════════════════ */}
      {activeRange !== 'all' && (
        <div>
          {reportLoading ? (
            <div className='flex items-center justify-center min-h-[30vh]'>
              <div className='w-10 h-10 border-4 border-[#FFF0F5] border-t-[#FFD1DC] rounded-full animate-spin'></div>
            </div>
          ) : reportData ? (
            <div className='flex flex-col gap-6'>
              {/* Report Summary Cards */}
              <div className='grid grid-cols-3 gap-4'>
                <div className='bg-gradient-to-br from-[#ffe0ea] to-[#fff5f8] rounded-2xl p-5 border border-[#ffd6e5] text-center shadow-sm'>
                  <p className='text-[9px] text-[#c07090] font-bold uppercase tracking-wider mb-1'>Total Orders</p>
                  <p className='text-3xl font-extrabold text-[#b0395e]'>{reportData.totalOrders}</p>
                </div>
                <div className='bg-gradient-to-br from-[#ffe0ea] to-[#fff5f8] rounded-2xl p-5 border border-[#ffd6e5] text-center shadow-sm'>
                  <p className='text-[9px] text-[#c07090] font-bold uppercase tracking-wider mb-1'>Items Bought</p>
                  <p className='text-3xl font-extrabold text-[#b0395e]'>{reportData.totalItems}</p>
                </div>
                <div className='bg-gradient-to-br from-[#ffe0ea] to-[#fff5f8] rounded-2xl p-5 border border-[#ffd6e5] text-center shadow-sm'>
                  <p className='text-[9px] text-[#c07090] font-bold uppercase tracking-wider mb-1'>Total Spent</p>
                  <p className='text-3xl font-extrabold text-[#b0395e]'>{currency}{reportData.totalAmount?.toFixed(2)}</p>
                </div>
              </div>

              {/* Orders in report */}
              {reportData.orders && reportData.orders.length > 0 ? (
                <div className='flex flex-col gap-5'>
                  {reportData.orders.map((order) => (
                    <div key={order.orderId} className='bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300'>
                      {/* Header row */}
                      <div className='bg-gray-50/50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100'>
                        <div className='flex flex-wrap items-center gap-y-3 gap-x-8'>
                          <div>
                            <p className='text-[10px] text-gray-400 font-bold uppercase tracking-tighter'>Order ID</p>
                            <p className='text-xs font-mono font-medium text-[#b0395e]'>#{order.orderId}</p>
                          </div>
                          <div>
                            <p className='text-[10px] text-gray-400 font-bold uppercase tracking-tighter'>Date</p>
                            <p className='text-xs font-medium text-gray-600'>{order.orderDate}</p>
                          </div>
                          <div>
                            <p className='text-[10px] text-gray-400 font-bold uppercase tracking-tighter'>Payment</p>
                            <p className='text-xs font-medium text-gray-600'>{order.paymentMethod}</p>
                          </div>
                          <div>
                            <p className='text-[10px] text-gray-400 font-bold uppercase tracking-tighter'>Total</p>
                            <p className='text-xs font-bold text-gray-800'>{currency}{order.totalAmount?.toFixed(2)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-green-50 text-green-600 border border-green-100'
                            : order.paymentStatus === 'FAILED'
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>

                      {/* Items */}
                      <div className='p-6 flex flex-col gap-4'>
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className='flex items-center gap-5'>
                            <img
                              src={Array.isArray(item.image) ? item.image[0] : item.image}
                              className='w-14 h-14 rounded-2xl object-cover bg-gray-50 shadow-sm'
                              alt={item.name}
                              onError={(e) => { e.target.src = assets.product_img1 }}
                            />
                            <div className='flex-1'>
                              <p className='text-sm font-bold text-gray-800 line-clamp-1'>{item.name}</p>
                              <div className='flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium'>
                                <p>{currency}{item.price}</p>
                                <span className='w-1 h-1 bg-gray-300 rounded-full'></span>
                                <p>Qty: {item.quantity}</p>
                                {item.size && <><span className='w-1 h-1 bg-gray-300 rounded-full'></span><p>Size: {item.size}</p></>}
                              </div>
                            </div>
                            <p className='text-sm font-bold text-[#b0395e]'>{currency}{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Totals footer */}
                      <div className='px-6 py-4 bg-[#FFF0F5]/30 border-t border-[#FFD1DC]/20 flex flex-wrap gap-4 text-[10px] text-gray-500'>
                        <span>Subtotal: <strong className='text-gray-700'>{currency}{order.subtotal?.toFixed(2)}</strong></span>
                        <span>Shipping: <strong className='text-gray-700'>{currency}{order.shippingFee}</strong></span>
                        <span className='ml-auto font-bold text-[#b0395e]'>Total: {currency}{order.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty state for report */
                <div className='flex flex-col items-center justify-center py-20 bg-[#FFF8FA] rounded-[3rem] border-2 border-dashed border-[#FFD1DC]/50'>
                  <div className='text-5xl mb-4'>🌸</div>
                  <p className='text-[#c07090] font-semibold text-sm'>No purchases found for <strong>{REPORT_RANGES.find(r => r.key === activeRange)?.label}</strong></p>
                  <p className='text-[#d0a0b0] text-xs mt-1 mb-6'>Try selecting a different time period</p>
                  <Button variant="secondary" className="text-sm px-8" onClick={() => navigate('/collection')}>
                    Shop Now
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* ALL ORDERS MODE                       */}
      {/* ══════════════════════════════════════ */}
      {activeRange === 'all' && (
        <div className='flex flex-col gap-8'>
          {orders.length > 0 ? (
            orders.map((order) => {
              const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              const isCancellable = canCancel(order.deliveryDate, order.status);
              return (
                <div key={order.id} className='bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300'>
                  <div className='bg-gray-50/50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100'>
                    <div className='flex flex-wrap items-center gap-y-4 gap-x-8'>
                      <div>
                        <p className='text-[10px] text-gray-400 font-bold uppercase tracking-tighter'>Order ID</p>
                        <p className='text-xs font-mono font-medium text-gray-600'>#{order.id}</p>
                      </div>
                      <div>
                        <p className='text-[10px] text-gray-400 font-bold uppercase tracking-tighter'>Placed On</p>
                        <p className='text-xs font-medium text-gray-600'>{new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className='text-[10px] text-gray-400 font-bold uppercase tracking-tighter'>Total Amount</p>
                        <p className='text-xs font-bold text-gray-800'>{currency}{order.amount + delivery_fee}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>

                  <div className='p-6'>
                    <div className='flex flex-col gap-6'>
                      {items.map((item, idx) => (
                        <div key={idx} className='flex items-center gap-6'>
                          <img
                            src={Array.isArray(item.image) ? item.image[0] : item.image}
                            className='w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-gray-50 shadow-sm'
                            alt={item.name}
                            onError={(e) => { e.target.src = assets.product_img1 }}
                          />
                          <div className='flex-1'>
                            <p className='text-sm font-bold text-gray-800 line-clamp-1'>{item.name}</p>
                            <div className='flex items-center gap-4 mt-1 text-xs text-gray-500 font-medium'>
                              <p>{currency}{item.price}</p>
                              <div className='w-1 h-1 bg-gray-300 rounded-full'></div>
                              <p>Qty: {item.quantity}</p>
                              {item.size && (<><div className='w-1 h-1 bg-gray-300 rounded-full'></div><p>Size: {item.size}</p></>)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='px-6 py-5 bg-[#FFF0F5]/20 flex flex-wrap justify-between items-center gap-6'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2.5 bg-white rounded-2xl shadow-sm border border-[#FFD1DC]/20'>
                        <svg className="w-4 h-4 text-[#FFD1DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <p className='text-[9px] text-gray-400 font-bold uppercase'>Estimated Delivery</p>
                        <p className='text-xs font-bold text-[#FFD1DC]'>{getDeliveryStatus(order.deliveryDate)}</p>
                      </div>
                    </div>
                    <div className='flex flex-wrap items-center gap-3 w-full sm:w-auto'>
                      {isCancellable ? (
                        <Button onClick={() => handleCancelOrder(order.id)} disabled={cancellingId === order.id}
                          className={`text-[10px] py-2.5 px-6 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all shadow-md flex-1 sm:flex-none font-bold ${cancellingId === order.id ? 'opacity-50' : ''}`}>
                          {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </Button>
                      ) : (
                        order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                          <p className='text-[10px] text-gray-400 font-medium italic bg-gray-50 px-3 py-2 rounded-full border border-gray-100 flex-1 sm:flex-none text-center'>
                            Cancellation closed (within 2 days of delivery)
                          </p>
                        )
                      )}
                      <Button onClick={() => handleDownloadInvoice(order.id)} variant="outline"
                        className="text-[10px] py-2.5 px-6 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all font-bold shadow-sm flex-1 sm:flex-none">
                        Invoice
                      </Button>
                      <Button onClick={fetchOrders} variant="outline"
                        className="text-[10px] py-2.5 px-8 rounded-full bg-white transition-all shadow-sm active:scale-95 flex-1 sm:flex-none">
                        Track Order
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100'>
              <img src={assets.cart_icon} className='w-16 opacity-10 mb-4' alt="" />
              <p className='text-gray-400 font-medium'>No orders found.</p>
              <Button variant="secondary" className="mt-6 text-sm px-8" onClick={() => navigate('/collection')}>
                Shop Now
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
