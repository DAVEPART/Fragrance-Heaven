import React from 'react';
import QuantitySelector from './common/QuantitySelector';
import { assets } from '../assets/assets';

const CartItemRow = ({ item, currency, getImageUrl, updateQuantity, deleteCartItem }) => {
    return (
        <div className='p-4 sm:p-6 bg-white theme-border rounded-2xl grid grid-cols-[auto_1fr] sm:grid-cols-[100px_1fr_auto] items-center gap-6 shadow-sm border border-gray-50'>

            <div className='w-20 sm:w-24 h-24 sm:h-28 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-2'>
                <img className='w-full h-full object-contain' src={getImageUrl(item.image)} alt={item.name} />
            </div>

            <div className='flex flex-col gap-2'>
                <div className='flex justify-between items-start'>
                    <h3 className='text-sm sm:text-lg font-bold text-gray-800 leading-tight'>{item.name}</h3>
                    <img
                        onClick={() => updateQuantity(item.id, item.size, 0)}
                        className='w-5 cursor-pointer opacity-30 hover:opacity-100 hover:scale-110 transition-all sm:hidden'
                        src={assets.bin_icon}
                        alt="Remove"
                    />
                </div>

                <div className='flex items-center gap-4 text-xs sm:text-sm text-gray-500'>
                    <p className='font-bold text-gray-800'>{currency}{item.price}</p>
                    <span className='px-2 py-0.5 bg-[#FFF0F5] text-[#333333] rounded font-semibold uppercase tracking-tighter'>
                        Size: {item.size}
                    </span>
                </div>

                <div className='mt-2 block sm:hidden'>
                    <QuantitySelector
                        quantity={item.quantity}
                        onIncrease={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        onDecrease={() => updateQuantity(item.id, item.size, Math.max(0, item.quantity - 1))}
                    />
                </div>
            </div>

            <div className='hidden sm:flex items-center gap-8'>
                <QuantitySelector
                    quantity={item.quantity}
                    onIncrease={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                    onDecrease={() => updateQuantity(item.id, item.size, Math.max(0, item.quantity - 1))}
                />

                <div className='w-24 text-right'>
                    <p className='font-bold text-lg text-gray-800'>{currency}{item.price * item.quantity}</p>
                </div>

                <img
                    onClick={() => updateQuantity(item.id, item.size, 0)}
                    className='w-5 cursor-pointer opacity-30 hover:opacity-100 hover:scale-110 transition-all ml-4'
                    src={assets.bin_icon}
                    alt="Remove"
                />
            </div>
        </div>
    );
};

export default CartItemRow;
