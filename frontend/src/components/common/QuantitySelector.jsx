import React from 'react';

const QuantitySelector = ({ quantity, onIncrease, onDecrease, className = '' }) => {
    return (
        <div className={`flex items-center border border-gray-300 w-fit rounded ${className}`}>
            <button
                onClick={onDecrease}
                className="px-3 py-1 hover:bg-gray-100 transition-colors text-lg"
                disabled={quantity <= 1}
            >
                −
            </button>
            <span className="px-4 py-1 border-x border-gray-300 min-w-[40px] text-center">
                {quantity}
            </span>
            <button
                onClick={onIncrease}
                className="px-3 py-1 hover:bg-gray-100 transition-colors text-lg"
            >
                +
            </button>
        </div>
    );
};

export default QuantitySelector;
