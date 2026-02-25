import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const Navbar = () => {

    const [visible, setVisble] = useState(false)

    const { setShowSearch, navigate, getCartCount, token, logout, userData } = useContext(ShopContext);

    return (
        <div className='flex items-center justify-between py-5 font-medium border-b border-gray-100 mb-5 relative' >

            <Link to='/' className='flex-shrink-0'>
                <img className='w-32 sm:w-40' src={assets.logo} alt="Fragrance Heaven Logo" />
            </Link>

            <ul className='hidden lg:flex gap-8 text-sm text-gray-700 font-semibold tracking-wider'>
                <NavLink to="/" className='flex flex-col items-center gap-1 hover:text-[#FFD1DC] transition-colors'>
                    <p>HOME</p>
                    <hr className='w-full border-none h-[2px] bg-[#FFD1DC] hidden' />
                </NavLink>
                <NavLink to='/collection' className='flex flex-col items-center gap-1 hover:text-[#FFD1DC] transition-colors'>
                    <p>COLLECTION</p>
                    <hr className='w-full border-none h-[2px] bg-[#FFD1DC] hidden' />
                </NavLink>
                <NavLink to='/about' className='flex flex-col items-center gap-1 hover:text-[#FFD1DC] transition-colors'>
                    <p>ABOUT</p>
                    <hr className='w-full border-none h-[2px] bg-[#FFD1DC] hidden' />
                </NavLink>
                <NavLink to='/contact' className='flex flex-col items-center gap-1 hover:text-[#FFD1DC] transition-colors'>
                    <p>CONTACT</p>
                    <hr className='w-full border-none h-[2px] bg-[#FFD1DC] hidden' />
                </NavLink>
            </ul>

            <div className='flex items-center gap-4 sm:gap-6'>
                <img onClick={() => { setShowSearch(true); navigate('/collection') }} className='w-5 cursor-pointer hover:opacity-70' src={assets.search_icon} alt="Search" />

                <div className='group relative'>
                    <div className='flex items-center gap-2 cursor-pointer'>
                        <img className='w-5' src={assets.profile_icon} alt="Profile" />
                        {token && userData && (
                            <span className='hidden sm:block text-xs font-semibold text-gray-600 truncate max-w-[80px]'>
                                {userData.name.split(' ')[0]}
                            </span>
                        )}
                    </div>

                    {/* Dropdown Menu */}
                    <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-50'>
                        <div className='flex flex-col gap-2 w-40 py-4 px-5 bg-white shadow-xl theme-border rounded-lg text-gray-600'>
                            {token ? (
                                <>
                                    <p className='text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1'>Account</p>
                                    <p onClick={() => navigate('/orders')} className='cursor-pointer hover:text-[#FFD1DC] py-1'>My Orders</p>
                                    <hr className='border-gray-100 my-1' />
                                    <p onClick={logout} className='cursor-pointer hover:text-red-400 py-1 font-semibold'>Logout</p>
                                </>
                            ) : (
                                <p onClick={() => navigate('/login')} className='cursor-pointer hover:text-[#FFD1DC] py-1 font-semibold'>Login / Register</p>
                            )}
                        </div>
                    </div>
                </div>

                <Link to='/cart' className='relative hover:opacity-70'>
                    <img className='w-6 min-w-6' src={assets.cart_icon} alt="Cart" />
                    <p className='absolute right-[-8px] top-[-8px] w-5 text-center leading-5 bg-[#FFD1DC] text-gray-800 aspect-square rounded-full text-[10px] font-bold shadow-sm'>{getCartCount()}</p>
                </Link>

                <div onClick={() => setVisble(true)} className='lg:hidden cursor-pointer hover:opacity-70'>
                    <img className='w-6' src={assets.menu_icon} alt="Menu" />
                </div>
            </div>

            {/* Sidebar Menu For Small Screens */}
            <div className={`fixed top-0 right-0 bottom-0 z-[100] bg-white shadow-2xl transition-all duration-300 ${visible ? 'w-full' : 'w-0'}`} >
                <div className='flex flex-col text-gray-700 h-full'>
                    <div onClick={() => setVisble(false)} className='flex items-center gap-4 p-6 border-b border-gray-100'>
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="Back" />
                        <p className='font-bold uppercase tracking-widest'>Close Menu</p>
                    </div>
                    <div className='flex flex-col py-4'>
                        <NavLink onClick={() => setVisble(false)} to="/" className='py-4 pl-10 border-b border-gray-50 hover:bg-[#FFF0F5]'>HOME</NavLink>
                        <NavLink onClick={() => setVisble(false)} to='/collection' className='py-4 pl-10 border-b border-gray-50 hover:bg-[#FFF0F5]'>COLLECTION</NavLink>
                        <NavLink onClick={() => setVisble(false)} to='/about' className='py-4 pl-10 border-b border-gray-50 hover:bg-[#FFF0F5]'>ABOUT</NavLink>
                        <NavLink onClick={() => setVisble(false)} to='/contact' className='py-4 pl-10 border-b border-gray-50 hover:bg-[#FFF0F5]'>CONTACT</NavLink>
                        {!token && (
                            <NavLink onClick={() => setVisble(false)} to='/login' className='py-4 pl-10 text-[#FFD1DC] font-bold'>LOGIN / REGISTER</NavLink>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar
