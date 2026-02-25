import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom';


const Footer = () => {
  return (
    <footer className='pt-20 pb-10 border-t border-gray-100'>
      <div className='flex flex-col sm:grid grid-cols-[2fr_1fr_1fr] gap-14 my-10 text-sm'>

        <div className='flex flex-col gap-6'>
          <img className='w-32' src={assets.logo} alt="Fragrance Heaven Logo" />
          <p className='w-full md:w-2/3 text-gray-500 leading-relaxed'>
            Discover your signature scent at Fragrance Heaven. Our curated collection of premium fragrances is designed to leave a lasting impression, ensuring your satisfaction is our top priority.
          </p>
          <div className='flex gap-4'>
            <div className='w-10 h-10 bg-[#FFF0F5] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FFD1DC] transition-colors'>
              <span className='text-[#FFD1DC] group-hover:text-white font-bold'>f</span>
            </div>
            <div className='w-10 h-10 bg-[#FFF0F5] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FFD1DC] transition-colors'>
              <span className='text-[#FFD1DC] group-hover:text-white font-bold'>i</span>
            </div>
            <div className='w-10 h-10 bg-[#FFF0F5] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FFD1DC] transition-colors'>
              <span className='text-[#FFD1DC] group-hover:text-white font-bold'>t</span>
            </div>
          </div>
        </div>

        <div>
          <p className='text-sm font-bold text-gray-800 mb-6 uppercase tracking-widest'>Company</p>
          <ul className='flex flex-col gap-3 text-gray-500 font-medium'>
            <li><Link to="/collection" className='hover:text-[#FFD1DC] transition-colors'>Discover Collection</Link></li>
            <li><Link to="/about" className='hover:text-[#FFD1DC] transition-colors'>Our Story</Link></li>
            <li><Link to="/orders" className='hover:text-[#FFD1DC] transition-colors'>Track Delivery</Link></li>
            <li><Link to="/ourpolicy" className='hover:text-[#FFD1DC] transition-colors'>Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <p className='text-sm font-bold text-gray-800 mb-6 uppercase tracking-widest'>Get in Touch</p>
          <ul className='flex flex-col gap-3 text-gray-500 font-medium'>
            <li className='hover:text-gray-800 transition-colors cursor-pointer'>+1-212-456-7890</li>
            <li className='hover:text-gray-800 transition-colors cursor-pointer underline'>concierge@fragranceheaven.com</li>
            <li className='mt-2'>
              <p className='text-xs text-gray-400 font-bold uppercase tracking-tighter'>Visit Our Boutique</p>
              <p className='mt-1 text-gray-500'>123 Luxury Lane, New York, NY</p>
            </li>
          </ul>
        </div>

      </div>

      <div className='border-t border-gray-100 mt-16'>
        <p className='py-8 text-xs text-center text-gray-400 uppercase tracking-[0.2em]'>
          © {new Date().getFullYear()} Fragrance Heaven - All Rights Reserved.
        </p>
      </div>

    </footer>
  )
}

export default Footer
