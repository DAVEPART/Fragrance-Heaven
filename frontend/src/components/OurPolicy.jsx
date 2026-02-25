import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 px-4 mt-10 bg-[#FFF0F5] rounded-[3rem] shadow-sm mb-20'>

      <div className='group cursor-default'>
        <div className='w-16 h-16 bg-white rounded-2xl flex items-center justify-center m-auto mb-6 shadow-sm group-hover:scale-110 transition-transform'>
          <img className='w-8' src={assets.exchange_icon} alt="Exchange" />
        </div>
        <p className='font-bold text-gray-800 text-lg'>Easy Exchange</p>
        <p className='text-gray-500 mt-2 text-sm'>Worry-free replacement policy</p>
      </div>

      <div className='group cursor-default'>
        <div className='w-16 h-16 bg-white rounded-2xl flex items-center justify-center m-auto mb-6 shadow-sm group-hover:scale-110 transition-transform'>
          <img className='w-8' src={assets.quality_icon} alt="Quality" />
        </div>
        <p className='font-bold text-gray-800 text-lg'>7 Days Return</p>
        <p className='text-gray-500 mt-2 text-sm'>Full refund within 7 days</p>
      </div>

      <div className='group cursor-default'>
        <div className='w-16 h-16 bg-white rounded-2xl flex items-center justify-center m-auto mb-6 shadow-sm group-hover:scale-110 transition-transform'>
          <img className='w-8' src={assets.support_img} alt="Support" />
        </div>
        <p className='font-bold text-gray-800 text-lg'>Premium Support</p>
        <p className='text-gray-500 mt-2 text-sm'>Dedicated 24/7 assistance</p>
      </div>

    </div>
  )
}

export default OurPolicy
