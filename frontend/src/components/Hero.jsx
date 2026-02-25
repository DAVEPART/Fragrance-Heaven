import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
    return (
        <div className='flex flex-col sm:flex-row border border-[#FEE1E8] bg-[#FFF0F5] rounded-3xl overflow-hidden shadow-sm mb-12'>

            {/* Hero Left Side */}
            <div className='w-full sm:w-1/2 flex items-center justify-center py-12 sm:py-0'>
                <div className='text-[#333333] px-8 sm:px-12'>
                    <div className='flex items-center gap-2 mb-4'>
                        <p className='w-8 md:w-11 h-[2px] bg-[#FFD1DC]'></p>
                        <p className='font-bold text-sm md:text-base uppercase tracking-widest text-[#FFD1DC]'>Our Bestsellers</p>
                    </div>

                    <h1 className='prata-regular text-4xl sm:py-3 lg:text-7xl leading-tight mb-6'>Captivating <br />Fragrances</h1>

                    <div className='flex items-center gap-2 group cursor-pointer w-fit'>
                        <p className='font-bold text-sm md:text-base tracking-widest group-hover:text-[#FFD1DC] transition-colors uppercase'>Shop Now</p>
                        <p className='w-8 md:w-11 h-[2px] bg-[#333333] group-hover:bg-[#FFD1DC] transition-colors'></p>
                    </div>
                </div>
            </div>

            {/* Hero Right Side */}
            <div className='w-full sm:w-1/2'>
                <img className='w-full h-full object-cover hover:scale-105 transition-transform duration-1000' src={assets.hero_img} alt="Premium Fragrance Hero" />
            </div>
        </div>
    )
}

export default Hero
