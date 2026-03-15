import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../api/api'

const LuxuryProductCard = ({ id, image, name, price, brand, concentration }) => {
    const { currency } = useContext(ShopContext);

    return (
        <Link
            onClick={() => window.scrollTo(0, 0)}
            className='text-gray-700 cursor-pointer group luxury-card-hover block'
            to={`/product/${id}`}
        >
            <div className='relative overflow-hidden bg-[#F9F9F9] rounded-sm aspect-[4/5]'>
                <img
                    className='w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out'
                    src={getImageUrl(image)}
                    alt={name}
                />

                {/* Overlay Quick Add */}
                <div className='absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 glass-effect'>
                    <button className='w-full py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-800 hover:text-[#FFD1DC] transition-colors'>
                        Quick View
                    </button>
                </div>

                {/* Wishlist Icon Placeholder */}
                <div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <svg className="w-5 h-5 text-gray-400 hover:text-[#FFD1DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
            </div>

            <div className='pt-6 pb-2 text-center'>
                <p className='text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-1 font-semibold'>
                    {(typeof brand === 'object' ? brand?.name : brand) || 'Fragrance Heaven'}
                </p>
                <p className='prata-regular text-lg text-gray-800 mb-1 group-hover:text-[#FFD1DC] transition-colors'>{name}</p>
                <div className='flex items-center justify-center gap-2'>
                    <p className='text-sm font-medium text-gray-500'>{concentration || 'Eau de Parfum'}</p>
                    <span className='w-1 h-1 bg-gray-300 rounded-full'></span>
                    <p className='text-sm font-bold text-gray-800'>{currency}{price}</p>
                </div>
            </div>
        </Link>
    )
}

export default LuxuryProductCard
