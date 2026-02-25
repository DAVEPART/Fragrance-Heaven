import React, { useEffect, useState } from 'react';

export const Toast = ({ message, type, onClose }) => {
    const variants = {
        success: 'bg-green-50 border-green-200 text-green-700 font-bold',
        error: 'bg-red-50 border-red-200 text-red-700 font-bold',
        warning: 'bg-amber-50 border-amber-200 text-amber-700 font-bold',
        info: 'bg-[#FFF0F5] border-[#FFD1DC] text-[#FFB6C1] font-bold'
    };

    const icons = {
        success: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
        error: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
        warning: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
        info: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    };

    return (
        <div className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border animate-slide-in-right ${variants[type] || variants.info}`}>
            <span className="flex-shrink-0">{icons[type] || icons.info}</span>
            <p className="text-sm tracking-tight">{message}</p>
            <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};

export const ConfirmDialog = ({ title, message, confirmText, cancelText, onConfirm, onCancel }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleConfirm = () => {
        onConfirm();
    };

    const handleCancel = () => {
        setIsClosing(true);
        setTimeout(onCancel, 200);
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') handleCancel();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-sm w-full overflow-hidden transform transition-all ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} animate-pop-in`}>
                <div className="px-8 pt-10 pb-6 text-center">
                    <div className="w-16 h-16 bg-[#FFF0F5] rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-[#FFD1DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed px-2">{message}</p>
                </div>

                <div className="px-8 pb-10 flex flex-col gap-3">
                    <button
                        onClick={handleConfirm}
                        className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="w-full py-4 rounded-2xl bg-white border border-gray-100 text-gray-400 font-bold text-sm hover:bg-gray-50 transition-all active:scale-95"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};
