import React, { createContext, useState, useCallback, useContext } from 'react';
import { Toast, ConfirmDialog } from '../components/common/AlertComponents';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmConfig, setConfirmConfig] = useState(null);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const confirm = useCallback((title, message, options = {}) => {
        return new Promise((resolve) => {
            setConfirmConfig({
                title,
                message,
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                variant: options.variant || 'brand',
                resolve
            });
        });
    }, []);

    const closeConfirm = (result) => {
        if (confirmConfig?.resolve) {
            confirmConfig.resolve(result);
        }
        setConfirmConfig(null);
    };

    const alertApi = {
        success: (msg, dur) => addToast(msg, 'success', dur),
        error: (msg, dur) => addToast(msg, 'error', dur),
        warning: (msg, dur) => addToast(msg, 'warning', dur),
        info: (msg, dur) => addToast(msg, 'info', dur),
        confirm
    };

    return (
        <AlertContext.Provider value={alertApi}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>

            {/* Confirmation Modal */}
            {confirmConfig && (
                <ConfirmDialog
                    {...confirmConfig}
                    onConfirm={() => closeConfirm(true)}
                    onCancel={() => closeConfirm(false)}
                />
            )}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
