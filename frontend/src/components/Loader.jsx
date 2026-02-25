import React, { useState, useEffect } from 'react';

const Loader = ({ show }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 2000); // Show for 2 seconds

            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
                <p className="text-white mt-4 text-lg">Loading...</p>
            </div>
        </div>
    );
};

export default Loader; 