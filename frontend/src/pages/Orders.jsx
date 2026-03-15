import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import api from '../api/api';
import Button from '../components/common/Button';
import { assets } from '../assets/assets';
import { useAlert } from '../context/AlertContext';

const Orders = () => {
  const { currency, token, navigate } = useContext(ShopContext);
  const alert = useAlert();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const delivery_fee = 100;

  const fetchOrders = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.post('/api/order/userorders', {}, {
        headers: { token }
      });
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleCancelOrder = async (orderId) => {
    const confirmed = await alert.confirm(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone."
    );

    if (!confirmed) return;

    setCancellingId(orderId);
    try {
      const response = await api.post('/api/order/status', { orderId, status: 'Cancelled' });
      if (response.data.success) {
        alert.success("Order cancelled successfully");
        fetchOrders();
      } else {
        alert.error(response.data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancellation error", error);
      alert.error("An error occurred during cancellation");
    } finally {
      setCancellingId(null);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/api/order/${orderId}/invoice`, {
        headers: { token },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
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

  const getDeliveryStatus = (deliveryTimestamp) => {
    if (!deliveryTimestamp) return 'Arrival Date N/A';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const delivery = new Date(deliveryTimestamp);
    delivery.setHours(0, 0, 0, 0);

    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Arriving Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Delivered';

    return delivery.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const canCancel = (deliveryDate, status) => {
    if (status === 'Cancelled' || status === 'Delivered') return false;
    if (!deliveryDate) return true;

    const today = new Date().getTime();
    const diffMs = deliveryDate - today;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays >= 2;
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

  if (loading) {
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
                            {item.size && (
                              <>
                                <div className='w-1 h-1 bg-gray-300 rounded-full'></div>
                                <p>Size: {item.size}</p>
                              </>
                            )}
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
                      <Button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className={`text-[10px] py-2.5 px-6 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all shadow-md flex-1 sm:flex-none font-bold ${cancellingId === order.id ? 'opacity-50' : ''}`}
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </Button>
                    ) : (
                      order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                        <p className='text-[10px] text-gray-400 font-medium italic bg-gray-50 px-3 py-2 rounded-full border border-gray-100 flex-1 sm:flex-none text-center'>
                          Cancellation closed (within 2 days of delivery)
                        </p>
                      )
                    )}
                    <Button
                      onClick={() => handleDownloadInvoice(order.id)}
                      variant="outline"
                      className="text-[10px] py-2.5 px-6 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all font-bold shadow-sm flex-1 sm:flex-none"
                    >
                      Invoice
                    </Button>
                    <Button
                      onClick={fetchOrders}
                      variant="outline"
                      className="text-[10px] py-2.5 px-8 rounded-full bg-white transition-all shadow-sm active:scale-95 flex-1 sm:flex-none"
                    >
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
    </div>
  );
};

export default Orders;
