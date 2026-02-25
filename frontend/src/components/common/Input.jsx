import React from 'react';

const Input = ({ label, type = 'text', value, onChange, placeholder = '', className = '', required = false, name = '', error }) => {
    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            {label && <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 ml-1">{label}</label>}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`border ${error ? 'border-red-400' : 'border-gray-100'} rounded-xl py-3 px-4 text-sm focus:border-[#FFD1DC] outline-none transition-all bg-white shadow-sm`}
            />
            {error && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase tracking-tighter">{error}</p>}
        </div>
    );
};

export default Input;
