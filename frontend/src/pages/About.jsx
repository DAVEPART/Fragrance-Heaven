import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
// import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div className='pt-10 border-t border-gray-100'>
      <div className='text-3xl font-bold mb-12'>
        <Title text1={'OUR'} text2={'STORY'} />
      </div>

      <div className='flex flex-col md:flex-row gap-16 items-center mb-24'>
        <div className='w-full md:w-1/2'>
          <img className='w-full rounded-3xl shadow-xl theme-border' src={assets.about_img} alt="About Fragrance Heaven" />
        </div>
        <div className='flex flex-col gap-8 w-full md:w-1/2 text-gray-500 leading-relaxed'>
          <h2 className='prata-regular text-2xl text-gray-800'>Where Scent Meets Soul.</h2>

          <p>
            At Fragrance Heaven, we believe a fragrance is more than just a pleasant aroma — it's a personal statement, a memory, and an invisible accessory that defines your presence. Our mission is to help you discover the perfect scent that reflects your individuality, mood, and lifestyle.
          </p>

          <div className='bg-[#FFF0F5] p-6 rounded-2xl border-l-4 border-[#FFD1DC]'>
            <b className='text-gray-800 block mb-2'>Who We Are</b>
            <p className='text-sm'>
              Fragrance Heaven is a curated destination for premium, designer, and niche perfumes. Founded with a passion for perfumery, we aim to bring luxury and elegance together in one space.
            </p>
          </div>

          <p>
            Since our inception, we've worked tirelessly to curate a diverse selection of high-quality products that cater to every taste and preference. We offer an extensive collection sourced from trusted brands and master perfumers.
          </p>

          <div className='flex flex-col gap-2'>
            <b className='text-gray-800'>Our Commitment</b>
            <p>We're dedicated to providing a seamless shopping experience that exceeds expectations, from the first spray to the final delivery.</p>
          </div>
        </div>
      </div>

      <div className='text-2xl font-bold mb-8'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-24'>
        <div className='bg-white p-10 theme-border rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-50'>
          <div className='w-12 h-12 bg-[#FFF0F5] rounded-xl flex items-center justify-center mb-6 text-[#FFD1DC] font-bold'>01</div>
          <b className='text-gray-800 block mb-4'>Quality Assurance</b>
          <p className='text-gray-500 text-sm'>We meticulously select and vet each product to ensure it meets our stringent quality standards.</p>
        </div>

        <div className='bg-white p-10 theme-border rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-50'>
          <div className='w-12 h-12 bg-[#FFF0F5] rounded-xl flex items-center justify-center mb-6 text-[#FFD1DC] font-bold'>02</div>
          <b className='text-gray-800 block mb-4'>Seamless Experience</b>
          <p className='text-gray-500 text-sm'>With our intuitive interface and hassle-free ordering process, shopping for your signature scent is a breeze.</p>
        </div>

        <div className='bg-white p-10 theme-border rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-50'>
          <div className='w-12 h-12 bg-[#FFF0F5] rounded-xl flex items-center justify-center mb-6 text-[#FFD1DC] font-bold'>03</div>
          <b className='text-gray-800 block mb-4'>Exceptional Service</b>
          <p className='text-gray-500 text-sm'>Our team of dedicated professionals is here to assist you, ensuring your satisfaction is always our top priority.</p>
        </div>
      </div>

    </div>
  )
}

export default About
