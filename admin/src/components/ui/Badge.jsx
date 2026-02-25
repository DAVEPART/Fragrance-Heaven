import React from 'react';

const Badge = ({
    children,
    variant = 'blue',
    size = 'md',
    className = '',
    ...props
}) => {
    const variants = {
        blue: 'bg-primary-100 text-primary-800',
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
        gray: 'bg-gray-100 text-gray-800',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span
            className={`inline-flex items-center font-medium rounded-md ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
