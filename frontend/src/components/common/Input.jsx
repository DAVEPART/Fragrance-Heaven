import React from 'react';

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder = '',
    className = '',
    required = false,
    name = '',
    error,
    helper,
    readOnly = false,
    disabled = false,
    maxLength,
    inputMode,
}) => {
    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            {label && (
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 ml-1">
                    {label}
                    {required && <span className="text-red-400 ml-0.5">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                required={required}
                readOnly={readOnly}
                disabled={disabled}
                maxLength={maxLength}
                inputMode={inputMode}
                className={`border rounded-xl py-3 px-4 text-sm outline-none transition-all shadow-sm
                    ${error
                        ? 'border-red-400 bg-red-50/30 focus:border-red-400'
                        : 'border-gray-100 bg-white focus:border-[#FFD1DC]'}
                    ${readOnly || disabled
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed select-none border-gray-100'
                        : ''}
                `}
            />
            {helper && !error && (
                <p className="text-[9px] text-gray-400 mt-0.5 ml-1 uppercase tracking-wider">{helper}</p>
            )}
            {error && (
                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
