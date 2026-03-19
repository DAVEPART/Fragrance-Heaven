import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import api from '../api/api';
import { ShopContext } from '../context/ShopContext';
import PaymentForm from '../components/PaymentForm';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAlert } from '../context/AlertContext';

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION RULES
// ─────────────────────────────────────────────────────────────────────────────
const INDIAN_PHONE_REGEX = /^[6-9][0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a single field by name. Returns error string or '' if valid.
 */
const validateField = (name, value, method, paymentDetails) => {
    const v = typeof value === 'string' ? value.trim() : '';

    switch (name) {
        case 'firstName':
            return v ? '' : 'First name is required';
        case 'lastName':
            return v ? '' : 'Last name is required';
        case 'email':
            if (!v) return 'Email is required';
            if (!EMAIL_REGEX.test(v)) return 'Enter a valid email address';
            return '';
        case 'phone':
            if (!v) return 'Mobile number is required';
            if (!INDIAN_PHONE_REGEX.test(v))
                return 'Enter a valid Indian mobile number (10 digits, start with 6–9)';
            return '';
        case 'street':
            return v ? '' : 'Street address is required';
        case 'city':
            return v ? '' : 'City is required';
        case 'state':
            return v ? '' : 'State is required';
        case 'zipcode':
            return v ? '' : 'Zip / postal code is required';
        case 'country':
            return v ? '' : 'Country is required';
        case 'transactionId':
            if (method === 'stripe' && !v)
                return 'Transaction ID is required for Stripe payments';
            return '';
        default:
            return '';
    }
};

/**
 * Validates all form fields. Returns { errors, firstErrorField }
 */
const validateAll = (formData, method, paymentDetails) => {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state', 'zipcode', 'country'];
    const errors = {};

    for (const field of fields) {
        const error = validateField(field, formData[field], method, paymentDetails);
        if (error) errors[field] = error;
    }

    // Stripe transaction ID
    if (method === 'stripe') {
        const err = validateField('transactionId', paymentDetails.transactionId, method, paymentDetails);
        if (err) errors.transactionId = err;
    }

    const firstErrorField = fields.find(f => errors[f]) || Object.keys(errors)[0] || null;
    return { errors, firstErrorField };
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const PlaceOrder = () => {
    const { navigate, token, delivery_fee, userData } = useContext(ShopContext);
    const alert = useAlert();
    const [method, setMethod] = useState('cod');
    const fieldRefs = useRef({});

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

    // Prefill user data — email is always from userData (read-only)
    useEffect(() => {
        if (userData) {
            const names = userData.name ? userData.name.split(' ') : ['', ''];
            setFormData(prev => ({
                ...prev,
                firstName: names[0] || '',
                lastName: names.slice(1).join(' ') || '',
                email: userData.email || ''
            }));
            // Auto-clear any stale email error the moment userData populates it
            if (userData.email) {
                setErrors(prev => ({ ...prev, email: '' }));
            }
        }
    }, [userData]);

    const [paymentDetails, setPaymentDetails] = useState({ transactionId: '', notes: '' });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [earnedCoupon, setEarnedCoupon] = useState(null);

    // ── Single-field blur validation ──────────────────────────────────────────
    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        // Skip email — it's read-only, populated from userData asynchronously
        if (name === 'email') return;
        const error = validateField(name, value, method, paymentDetails);
        setErrors(prev => ({ ...prev, [name]: error }));
    }, [method, paymentDetails]);

    // ── Live clear-on-fix while typing ───────────────────────────────────────
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;

        // Phone: only allow digits, max 10 chars
        if (name === 'phone') {
            const digits = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, phone: digits }));
            // Clear error live once valid
            if (INDIAN_PHONE_REGEX.test(digits)) {
                setErrors(prev => ({ ...prev, phone: '' }));
            }
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error live once the field has a value
        if (errors[name] && value.trim()) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    const handlePaymentDetailsChange = useCallback((name, value) => {
        setPaymentDetails(prev => ({ ...prev, [name]: value }));
        if (errors[name] && value.trim()) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    // ── Scroll to first invalid field ────────────────────────────────────────
    const scrollToFirstError = (firstField) => {
        const el = fieldRefs.current[firstField];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus?.();
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // COD ORDER
    // ─────────────────────────────────────────────────────────────────────────
    const handleCodOrder = async (cartItemsStored, totalAmount, finalCouponCode) => {
        const orderData = {
            items: cartItemsStored,
            amount: totalAmount,
            address: formData,
            paymentMethod: 'COD',
            transactionId: '',
            notes: paymentDetails.notes,
            payment: false,
            couponCode: finalCouponCode
        };
        const response = await api.post('/api/order/place', orderData, { headers: { token } });
        if (response.data.success) {
            alert.success('Order placed! Confirmation email sent to ' + formData.email);
            localStorage.removeItem('order_placed');
            if (response.data.earnedCouponDetails) {
                setEarnedCoupon(response.data.earnedCouponDetails);
            } else {
                setTimeout(() => navigate('/orders'), 2000);
            }
        } else {
            alert.error('Order failed: ' + (response.data.message || 'Unknown error'));
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RAZORPAY FLOW
    // ─────────────────────────────────────────────────────────────────────────
    const loadRazorpayScript = () =>
        new Promise((resolve) => {
            if (window.Razorpay) { resolve(true); return; }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const rzpRef = useRef(null); // guards against double-click / duplicate Razorpay instances

    const handleRazorpayOrder = async (cartItemsStored, totalAmount, finalCouponCode) => {
        // ── Step 1: Create Razorpay order on backend (NO DB order yet) ──
        const createRes = await api.post(
            '/api/order/razorpay',
            { items: cartItemsStored, amount: totalAmount, address: formData, notes: paymentDetails.notes, couponCode: finalCouponCode },
            { headers: { token } }
        );
        if (!createRes.data.success) throw new Error(createRes.data.message || 'Failed to initiate payment');

        const razorpayOrderData = createRes.data.order;
        const rzpOrderId = razorpayOrderData.id; // used for cancel + verify

        // ── Step 2: Load Razorpay script ──
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error('Failed to load Razorpay. Check your internet connection.');

        // ── Helper: call cancel endpoint to clean up pending session ──
        const cleanupSession = async () => {
            try {
                await api.post('/api/order/razorpay/cancel', { razorpayOrderId: rzpOrderId }, { headers: { token } });
            } catch (_) { /* best-effort */ }
        };

        // ── Step 3: Open Razorpay checkout ──
        return new Promise((resolve, reject) => {
            // Guard: prevent duplicate instances
            if (rzpRef.current) {
                rzpRef.current.close?.();
                rzpRef.current = null;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: razorpayOrderData.amount,
                currency: razorpayOrderData.currency || 'INR',
                name: 'Fragrance Heaven',
                description: 'Premium Fragrance Purchase',
                order_id: rzpOrderId,
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: formData.email,
                    contact: formData.phone
                },
                theme: { color: '#FFD1DC' },

                // ── SUCCESS: verify HMAC on backend, create DB order only here ──
                handler: async (response) => {
                    rzpRef.current = null;
                    try {
                        const verifyRes = await api.post(
                            '/api/order/verifyRazorpay',
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                // NOTE: no orderId — backend uses razorpay_order_id to find pending session
                            },
                            { headers: { token } }
                        );
                        if (verifyRes.data.success) {
                            localStorage.removeItem('order_placed');
                            resolve({ success: true, data: verifyRes.data });
                        } else {
                            resolve({ success: false, message: verifyRes.data.message || 'Payment verification failed.' });
                        }
                    } catch (err) { reject(err); }
                },

                // ── CANCEL: user dismissed popup — clean up session, show message ──
                modal: {
                    ondismiss: async () => {
                        rzpRef.current = null;
                        await cleanupSession();
                        resolve({ success: false, cancelled: true, message: 'Payment cancelled. Your order was not placed.' });
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzpRef.current = rzp;

            // ── FAILED: card declined / network error — clean up session ──
            rzp.on('payment.failed', async (r) => {
                rzpRef.current = null;
                await cleanupSession();
                resolve({ success: false, message: r.error?.description || 'Payment failed. Please try again.' });
            });

            rzp.open();
        });
    };


    // ─────────────────────────────────────────────────────────────────────────
    // MAIN SUBMIT
    // ─────────────────────────────────────────────────────────────────────────
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a code');
            return;
        }
        setCouponLoading(true);
        setCouponError('');
        try {
            const subtotal = cartItemsStored.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const res = await api.post('/api/coupon/validate', { code: couponCode, subtotal }, { headers: { token } });
            if (res.data.success) {
                setAppliedCoupon({ code: couponCode, amount: res.data.discountAmount });
                alert.success('Promo code applied!');
            } else {
                setCouponError(res.data.message);
                setAppliedCoupon(null);
            }
        } catch (err) {
            setCouponError('Failed to validate coupon');
            setAppliedCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        const { errors: newErrors, firstErrorField } = validateAll(formData, method, paymentDetails);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            alert.error('Please fix the errors highlighted below.');
            if (firstErrorField) scrollToFirstError(firstErrorField);
            return;
        }

        if (!token) {
            alert.error('Please login to place an order.');
            navigate('/login');
            return;
        }

        const cartItemsStored = JSON.parse(localStorage.getItem('order_placed')) || [];
        if (cartItemsStored.length === 0) {
            alert.error('Your cart is empty.');
            navigate('/cart');
            return;
        }

        setSubmitting(true);
        const subtotal = cartItemsStored.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discountAmount = appliedCoupon ? appliedCoupon.amount : 0;
        const totalAmount = subtotal + (cartItemsStored.length > 0 ? delivery_fee : 0) - discountAmount;
        const finalCouponCode = appliedCoupon ? appliedCoupon.code : null;

        try {
            if (method === 'cod') {
                await handleCodOrder(cartItemsStored, totalAmount, finalCouponCode);
            } else if (method === 'razorpay') {
                const result = await handleRazorpayOrder(cartItemsStored, totalAmount, finalCouponCode);
                if (result.success) {
                    alert.success('Payment successful! Your order has been placed.');
                    if (result.data?.earnedCouponDetails) {
                        setEarnedCoupon(result.data.earnedCouponDetails);
                    } else {
                        setTimeout(() => navigate('/orders'), 2000);
                    }
                } else if (result.cancelled) {
                    alert.error('Payment cancelled. Your order was not placed.');
                } else {
                    alert.error(result.message || 'Payment failed. Please try again.');
                }
            } else if (method === 'stripe') {
                const orderData = {
                    items: cartItemsStored,
                    amount: totalAmount,
                    address: formData,
                    paymentMethod: 'Stripe',
                    transactionId: paymentDetails.transactionId,
                    notes: paymentDetails.notes,
                    payment: true,
                    couponCode: finalCouponCode
                };
                const response = await api.post('/api/order/place', orderData, { headers: { token } });
                if (response.data.success) {
                    alert.success('Order placed successfully!');
                    localStorage.removeItem('order_placed');
                    if (response.data.earnedCouponDetails) {
                        setEarnedCoupon(response.data.earnedCouponDetails);
                    } else {
                        setTimeout(() => navigate('/orders'), 2000);
                    }
                } else {
                    alert.error('Order failed: ' + (response.data.message || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error('Order Error:', error);
            alert.error(error.message || 'An error occurred while placing the order.');
        } finally {
            setSubmitting(false);
        }
    };

    const cartItemsStored = JSON.parse(localStorage.getItem('order_placed')) || [];

    // Helper: ref setter for scroll-to-error
    const setRef = (name) => (el) => { fieldRefs.current[name] = el; };

    return (
        <div className='flex flex-col lg:flex-row justify-between gap-12 pt-10 min-h-[80vh] border-t border-gray-100 bg-white px-4 md:px-0'>

            {/* ── Left: Delivery Information ──────────────────────────────── */}
            <div className='flex flex-col gap-6 w-full lg:max-w-[500px] bg-white p-6 md:p-8 rounded-3xl theme-border shadow-sm'>
                <div className='mb-4'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                    <p className='text-xs text-gray-400 mt-2 uppercase tracking-widest'>Where should we send your fragrance?</p>
                </div>

                {/* Name Row */}
                <div className='flex flex-col md:flex-row gap-4'>
                    <div ref={setRef('firstName')} className="w-full">
                        <Input
                            name="firstName"
                            label="First Name"
                            placeholder='John'
                            value={formData.firstName}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            error={errors.firstName}
                            required
                        />
                    </div>
                    <div ref={setRef('lastName')} className="w-full">
                        <Input
                            name="lastName"
                            label="Last Name"
                            placeholder='Doe'
                            value={formData.lastName}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            error={errors.lastName}
                            required
                        />
                    </div>
                </div>

                {/* Email — read-only, prefilled from account */}
                <div ref={setRef('email')}>
                    <Input
                        name="email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={() => {}} // read-only — locked to logged-in account
                        error={errors.email}
                        readOnly
                        helper="Locked to your account · Order confirmation sent here"
                        required
                    />
                </div>

                {/* Street */}
                <div ref={setRef('street')}>
                    <Input
                        name="street"
                        label="Street Address"
                        placeholder='123 Fragrance Ave'
                        value={formData.street}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={errors.street}
                        required
                    />
                </div>

                {/* City + State */}
                <div className='flex flex-col md:flex-row gap-4'>
                    <div ref={setRef('city')} className="w-full">
                        <Input
                            name="city"
                            label="City"
                            placeholder='Mumbai'
                            value={formData.city}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            error={errors.city}
                            required
                        />
                    </div>
                    <div ref={setRef('state')} className="w-full">
                        <Input
                            name="state"
                            label="State"
                            placeholder='Maharashtra'
                            value={formData.state}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            error={errors.state}
                            required
                        />
                    </div>
                </div>

                {/* Zip + Country */}
                <div className='flex flex-col md:flex-row gap-4'>
                    <div ref={setRef('zipcode')} className="w-full">
                        <Input
                            name="zipcode"
                            label="Zip / Postal Code"
                            placeholder='400001'
                            value={formData.zipcode}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            error={errors.zipcode}
                            required
                        />
                    </div>
                    <div ref={setRef('country')} className="w-full">
                        <Input
                            name="country"
                            label="Country"
                            placeholder='India'
                            value={formData.country}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            error={errors.country}
                            required
                        />
                    </div>
                </div>

                {/* Mobile — Indian validation */}
                <div ref={setRef('phone')}>
                    <Input
                        name="phone"
                        label="Mobile Number"
                        type="tel"
                        inputMode="numeric"
                        placeholder='9876543210'
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={errors.phone}
                        maxLength={10}
                        helper="10-digit Indian mobile number"
                        required
                    />
                </div>

                {/* Validation summary banner */}
                {Object.keys(errors).some(k => errors[k]) && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                            Please fix the errors above before placing your order.
                        </p>
                    </div>
                )}
            </div>

            {/* ── Right: Summary + Payment ─────────────────────────────────── */}
            <div className='flex-1 flex flex-col gap-8'>

                <div className='p-6 md:p-8 bg-white theme-border rounded-3xl shadow-sm border border-gray-50'>
                    <div className='mb-8'>
                        <Title text1={'TOTAL'} text2={'SUMMARY'} />
                    </div>
                    <CartTotal cartItems={cartItemsStored} discountAmount={appliedCoupon ? appliedCoupon.amount : 0} />
                    
                    {/* Promo Code Input */}
                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <p className="text-sm font-medium text-gray-700 mb-2">Have a Promo Code?</p>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Enter code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                disabled={appliedCoupon !== null}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm uppercase focus:outline-none focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                            {appliedCoupon ? (
                                <button
                                    onClick={() => {
                                        setAppliedCoupon(null);
                                        setCouponCode('');
                                        setCouponError('');
                                    }}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                                >
                                    REMOVE
                                </button>
                            ) : (
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading || !couponCode.trim()}
                                    className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    {couponLoading ? 'APPLYING...' : 'APPLY'}
                                </button>
                            )}
                        </div>
                        {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
                        {appliedCoupon && <p className="text-xs text-green-600 mt-2 font-medium">Coupon applied successfully!</p>}
                    </div>
                </div>

                <div className='p-6 md:p-8 bg-white theme-border rounded-3xl shadow-lg border border-primary-50'>
                    <div className='mb-6'>
                        <Title text1={'PAYMENT'} text2={'METHOD'} />
                        <p className='text-[10px] text-gray-400 mt-1 uppercase tracking-widest'>Select your preferred secure payment option</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-6'>
                        {/* Stripe */}
                        <div
                            onClick={() => setMethod('stripe')}
                            className={`flex items-center gap-3 border-2 p-4 rounded-2xl cursor-pointer transition-all
                                ${method === 'stripe' ? 'border-primary-300 bg-primary-50/30' : 'border-gray-50 hover:border-primary-100'}`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'stripe' ? 'border-primary-500' : 'border-gray-200'}`}>
                                {method === 'stripe' && <div className='w-2 h-2 rounded-full bg-primary-500' />}
                            </div>
                            <img className='h-4 grayscale hover:grayscale-0 transition-all' src={assets.stripe_logo} alt="Stripe" />
                        </div>

                        {/* Razorpay */}
                        <div
                            onClick={() => setMethod('razorpay')}
                            className={`flex items-center gap-3 border-2 p-4 rounded-2xl cursor-pointer transition-all
                                ${method === 'razorpay' ? 'border-primary-300 bg-primary-50/30' : 'border-gray-50 hover:border-primary-100'}`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'razorpay' ? 'border-primary-500' : 'border-gray-200'}`}>
                                {method === 'razorpay' && <div className='w-2 h-2 rounded-full bg-primary-500' />}
                            </div>
                            <img className='h-4 grayscale hover:grayscale-0 transition-all' src={assets.razorpay_logo} alt="Razorpay" />
                        </div>

                        {/* COD */}
                        <div
                            onClick={() => setMethod('cod')}
                            className={`flex items-center gap-3 border-2 p-4 rounded-2xl cursor-pointer transition-all
                                ${method === 'cod' ? 'border-primary-300 bg-primary-50/30' : 'border-gray-50 hover:border-primary-100'}`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'cod' ? 'border-primary-500' : 'border-gray-200'}`}>
                                {method === 'cod' && <div className='w-2 h-2 rounded-full bg-primary-500' />}
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
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <p className='text-[9px] text-gray-500 uppercase tracking-widest'>
                                Secured &amp; Encrypted Payment
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Earned Coupon Modal */}
            {earnedCoupon && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl animate-fadeIn relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
                        <p className="text-sm text-gray-600 mb-6">You've unlocked a discount code for your next purchase.</p>
                        
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Promo Code</p>
                            <p className="text-3xl font-black text-primary-600 tracking-wider font-mono">{earnedCoupon.code}</p>
                            <p className="text-xs font-semibold text-gray-700 mt-2">Get {earnedCoupon.discountPercent}% OFF</p>
                            <p className="text-[10px] text-gray-400 mt-1">Valid until {new Date(earnedCoupon.expireAt).toLocaleDateString()}</p>
                        </div>
                        
                        <Button
                            onClick={() => {
                                setEarnedCoupon(null);
                                navigate('/orders');
                            }}
                            variant="primary"
                            className="w-full tracking-wider"
                        >
                            AWESOME, THANKS!
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaceOrder;
