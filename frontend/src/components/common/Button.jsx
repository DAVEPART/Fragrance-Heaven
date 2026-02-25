import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) => {
    const baseStyles = 'px-8 py-3 text-sm font-medium transition-all duration-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest';

    const variants = {
        primary: 'bg-black text-white hover:bg-gray-800',
        secondary: 'bg-[#FFD1DC] text-[#333333] hover:bg-[#ffb6c1]',
        outline: 'border border-gray-300 text-[#333333] hover:bg-gray-50',
        ghost: 'text-[#333333] hover:bg-[#FFF0F5]'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
