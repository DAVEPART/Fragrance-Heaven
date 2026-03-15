import React from 'react';
import Input from './common/Input';

const PaymentForm = ({ method, paymentDetails, onDetailsChange, errors }) => {
    // Razorpay: popup handles everything — just show an info message
    if (method === 'razorpay') {
        return (
            <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </div>
                <div>
                    <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Razorpay Secure Checkout</p>
                    <p className="text-[10px] text-blue-500 mt-1">
                        A secure Razorpay payment window will open after you click <strong>Complete Purchase</strong>.
                        You can pay via UPI, card, netbanking, or wallet.
                    </p>
                </div>
            </div>
        );
    }

    // COD: no extra fields needed
    if (method === 'cod') return null;

    // Stripe: keep manual transaction ID input
    return (
        <div className="space-y-4 pt-4 border-t border-gray-100 mt-4 animate-in fade-in duration-500">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-800">Payment Details</p>

            <Input
                name="transactionId"
                label="Transaction ID / Reference"
                placeholder="Enter your Stripe payment reference"
                value={paymentDetails.transactionId || ''}
                onChange={(e) => onDetailsChange('transactionId', e.target.value)}
                error={errors.transactionId}
            />

            <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Additional Notes (Optional)</label>
                <textarea
                    className="w-full border border-gray-100 rounded-xl p-4 text-sm focus:border-[#FFD1DC] outline-none transition-all min-h-[100px] resize-none"
                    placeholder="Any specific instructions or payment notes..."
                    value={paymentDetails.notes || ''}
                    onChange={(e) => onDetailsChange('notes', e.target.value)}
                />
            </div>
        </div>
    );
};

export default PaymentForm;
