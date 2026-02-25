import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price, item }) => {

  const { currency, getImageUrl } = useContext(ShopContext);

  // If the full item object is passed, use its fields as primary source
  const displayImage = item?.imageMain || item?.image?.[0] || image;
  const displayPrice = item?.priceBase || (item?.sizes?.[0]?.price) || price;

  return (
    <Link
      to={`/product/${id}`}
      onClick={() => window.scrollTo(0, 0)}
      className='text-gray-700 cursor-pointer group bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#FEE1E8]'
    >

      <div className='overflow-hidden rounded-xl bg-gray-50 aspect-square flex items-center justify-center relative'>
        <img
          className='hover:scale-110 transition duration-700 object-cover w-full h-full'
          src={getImageUrl(displayImage)}
          alt={name}
        />
        <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
          <div className='bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm'>
            <p className='text-[10px] font-bold text-[#FFD1DC] uppercase tracking-tighter'>View Details</p>
          </div>
        </div>
      </div>

      <div className='pt-4 pb-1'>
        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>Fragrance</p>
        <p className='text-sm sm:text-base font-bold text-gray-800 line-clamp-1 mb-2'>{name}</p>
        <div className='flex items-center justify-between'>
          <p className='text-base font-extrabold text-[#333333]'>
            <span className='text-xs mr-0.5'>{currency}</span>{displayPrice}
          </p>
          <div className='w-6 h-6 rounded-full bg-[#FFF0F5] flex items-center justify-center text-[#FFD1DC] font-bold'>+</div>
        </div>
      </div>

    </Link>
  )
}

export default ProductItem
