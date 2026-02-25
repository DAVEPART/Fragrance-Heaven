import React, { useState, useContext, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import api from '../api/api';
import { ShopContext } from '../context/ShopContext';
import PaymentForm from '../components/PaymentForm';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAlert } from '../context/AlertContext';

const PlaceOrder = () => {
    const { navigate, token, currency, delivery_fee, userData } = useContext(ShopContext);
    const alert = useAlert();
    const [method, setMethod] = useState('cod');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    });

    // Prefill user data when available
    useEffect(() => {
        if (userData) {
            const names = userData.name ? userData.name.split(' ') : ['', ''];
            setFormData(prev => ({
                ...prev,
                firstName: names[0] || '',
                lastName: names.slice(1).join(' ') || '',
                email: userData.email || ''
            }));
        }
    }, [userData]);

    const [paymentDetails, setPaymentDetails] = useState({
        transactionId: '',
        notes: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim() || !emailRegex.test(formData.email)) newErrors.email = 'Valid email is required';
        if (!formData.street.trim()) newErrors.street = 'Street address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipcode.trim()) newErrors.zipcode = 'Zipcode is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

        if (method !== 'cod' && !paymentDetails.transactionId.trim()) {
            newErrors.transactionId = 'Transaction ID is required for online payments';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentDetailsChange = (name, value) => {
        setPaymentDetails(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async () => {
        if (!validate()) {
            alert.error('Please fix the errors in the form');
            return;
        }

        if (!token) {
            alert.error('Please login to place an order.');
            navigate('/login');
            return;
        }

        const cartItemsStored = JSON.parse(localStorage.getItem("order_placed")) || [];
        if (cartItemsStored.length === 0) {
            alert.error('Your cart is empty');
            navigate('/cart');
            return;
        }

        setSubmitting(true);
        const subtotal = cartItemsStored.reduce((total, item) => total + (item.price * item.quantity), 0);
        const totalAmount = subtotal + (cartItemsStored.length > 0 ? delivery_fee : 0);

        const orderData = {
            items: cartItemsStored,
            amount: totalAmount,
            address: formData,
            paymentMethod: method === 'cod' ? 'COD' : (method === 'stripe' ? 'Stripe' : 'Razorpay'),
            transactionId: paymentDetails.transactionId,
            notes: paymentDetails.notes,
            payment: method === 'cod' ? false : true
        };

        try {
            const response = await api.post(
                '/api/order/place',
                orderData,
                { headers: { token } }
            );

            if (response.data.success) {
                alert.success('Order placed successfully! A confirmation email has been sent to ' + formData.email);
                localStorage.removeItem("order_placed");
                setTimeout(() => navigate('/orders'), 2000);
            } else {
                alert.error('Order failed: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Order Placement Error:', error.response?.data || error.message);
            alert.error('An error occurred while placing the order.');
        } finally {
            setSubmitting(false);
        }
    };

    const cartItemsStored = JSON.parse(localStorage.getItem("order_placed")) || [];

    return (
        <div className='flex flex-col lg:flex-row justify-between gap-12 pt-10 min-h-[80vh] border-t border-gray-100 bg-white px-4 md:px-0'>

            {/* Left Side: Delivery Information */}
            <div className='flex flex-col gap-6 w-full lg:max-w-[500px] bg-white p-6 md:p-8 rounded-3xl theme-border shadow-sm'>
                <div className='mb-4'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                    <p className='text-xs text-gray-400 mt-2 uppercase tracking-widest'>Where should we send your fragrance?</p>
                </div>

                <div className='flex flex-col md:flex-row gap-4'>
                    <Input
                        name="firstName"
                        label="First Name"
                        placeholder='John'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        error={errors.firstName}
                        readOnly={!!userData}
                    />
                    <Input
                        name="lastName"
                        label="Last Name"
                        placeholder='Doe'
                        value={formData.lastName}
                        onChange={handleInputChange}
                        error={errors.lastName}
                        readOnly={!!userData}
                    />
                </div>

                <Input
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder='john@example.com'
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    readOnly={!!userData}
                    helper="Order confirmation will be sent here"
                />

                <Input name="street" label="Street Address" placeholder='123 Fragrance Ave' value={formData.street} onChange={handleInputChange} error={errors.street} />

                <div className='flex flex-col md:flex-row gap-4'>
                    <Input name="city" label="City" placeholder='Glace Bay' value={formData.city} onChange={handleInputChange} error={errors.city} />
                    <Input name="state" label="State/Province" placeholder='NS' value={formData.state} onChange={handleInputChange} error={errors.state} />
                </div>

                <div className='flex flex-col md:flex-row gap-4'>
                    <Input name="zipcode" label="Zip/Postal Code" placeholder='B1A 1A1' value={formData.zipcode} onChange={handleInputChange} error={errors.zipcode} />
                    <Input name="country" label="Country" placeholder='Canada' value={formData.country} onChange={handleInputChange} error={errors.country} />
                </div>

                <Input name="phone" label="Phone Number" placeholder='+1 123 456 7890' value={formData.phone} onChange={handleInputChange} error={errors.phone} />
            </div>

            {/* Right Side: Order Summary & Payment */}
            <div className='flex-1 flex flex-col gap-8'>

                <div className='p-6 md:p-8 bg-white theme-border rounded-3xl shadow-sm border border-gray-50'>
                    <div className='mb-8'>
                        <Title text1={'TOTAL'} text2={'SUMMARY'} />
                    </div>
                    <CartTotal cartItems={cartItemsStored} />
                </div>

                <div className='p-6 md:p-8 bg-white theme-border rounded-3xl shadow-lg border border-primary-50'>
                    <div className='mb-6'>
                        <Title text1={'PAYMENT'} text2={'METHOD'} />
                        <p className='text-[10px] text-gray-400 mt-1 uppercase tracking-widest'>Select your preferred secure payment option</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-6'>
                        <div onClick={() => setMethod('stripe')} className={`flex items-center gap-3 border-2 p-4 rounded-2xl cursor-pointer transition-all ${method === 'stripe' ? 'border-primary-300 bg-primary-50/30' : 'border-gray-50 hover:border-primary-100'}`}>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'stripe' ? 'border-primary-500' : 'border-gray-200'}`}>
                                {method === 'stripe' && <div className='w-2 h-2 rounded-full bg-primary-500'></div>}
                            </div>
                            <img className='h-4 grayscale hover:grayscale-0 transition-all' src={assets.stripe_logo} alt="Stripe" />
                        </div>

                        <div onClick={() => setMethod('razorpay')} className={`flex items-center gap-3 border-2 p-4 rounded-2xl cursor-pointer transition-all ${method === 'razorpay' ? 'border-primary-300 bg-primary-50/30' : 'border-gray-50 hover:border-primary-100'}`}>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'razorpay' ? 'border-primary-500' : 'border-gray-200'}`}>
                                {method === 'razorpay' && <div className='w-2 h-2 rounded-full bg-primary-500'></div>}
                            </div>
                            <img className='h-4 grayscale hover:grayscale-0 transition-all' src={assets.razorpay_logo} alt="Razorpay" />
                        </div>

                        <div onClick={() => setMethod('cod')} className={`flex items-center gap-3 border-2 p-4 rounded-2xl cursor-pointer transition-all ${method === 'cod' ? 'border-primary-300 bg-primary-50/30' : 'border-gray-50 hover:border-primary-100'}`}>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'cod' ? 'border-primary-500' : 'border-gray-200'}`}>
                                {method === 'cod' && <div className='w-2 h-2 rounded-full bg-primary-500'></div>}
                            </div>
                            <p className='text-gray-500 text-[10px] font-bold uppercase tracking-widest'>COD</p>
                        </div>
                    </div>

                    <PaymentForm
                        method={method}
                        paymentDetails={paymentDetails}
                        onDetailsChange={handlePaymentDetailsChange}
                        errors={errors}
                    />

                    <div className='mt-8 pt-6 border-t border-gray-50'>
                        <Button
                            onClick={handlePlaceOrder}
                            variant="primary"
                            className="w-full py-4 text-sm font-bold tracking-[0.2em]"
                            disabled={submitting}
                        >
                            {submitting ? 'PROCESSING...' : 'COMPLETE PURCHASE'}
                        </Button>
                        <div className='flex items-center justify-center gap-2 mt-4 opacity-40'>
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                            <p className='text-[9px] text-gray-500 uppercase tracking-widest'>
                                Secured & Encrypted Payment
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;
