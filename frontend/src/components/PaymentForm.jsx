import React from 'react';
import Input from './common/Input';

const PaymentForm = ({ method, paymentDetails, onDetailsChange, errors }) => {
    if (method === 'cod') return null;

    return (
        <div className="space-y-4 pt-4 border-t border-gray-100 mt-4 animate-in fade-in duration-500">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-800">Payment Details</p>

            <Input
                name="transactionId"
                label="Transaction ID / Reference"
                placeholder="Enter your payment reference"
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
