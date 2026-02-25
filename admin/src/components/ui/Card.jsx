import React from 'react';

const Card = ({
    children,
    title,
    className = '',
    headerAction,
    ...props
}) => {
    return (
        <div className={`bg-white rounded-xl shadow-card ${className}`} {...props}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

export default Card;
