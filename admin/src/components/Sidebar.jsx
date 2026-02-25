import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
            ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600 font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
        }`;

    return (
        <div className='w-64 min-h-screen bg-white border-r border-gray-200 shadow-sm'>
            <div className='flex flex-col gap-2 pt-8 px-4'>

                <NavLink className={navLinkClass} to="/add">
                    <img className='w-5 h-5' src={assets.add_icon} alt="Add" />
                    <p className='hidden md:block'>Add Items</p>
                </NavLink>

                <NavLink className={navLinkClass} to="/list">
                    <img className='w-5 h-5' src={assets.order_icon} alt="List" />
                    <p className='hidden md:block'>List Items</p>
                </NavLink>

                <NavLink className={navLinkClass} to="/orders">
                    <img className='w-5 h-5' src={assets.order_icon} alt="Orders" />
                    <p className='hidden md:block'>Orders</p>
                </NavLink>

                <NavLink className={navLinkClass} to="/category">
                    <img className='w-5 h-5' src={assets.add_icon} alt="Category" />
                    <p className='hidden md:block'>Categories</p>
                </NavLink>

                <NavLink className={navLinkClass} to="/brand">
                    <img className='w-5 h-5' src={assets.add_icon} alt="Brand" />
                    <p className='hidden md:block'>Brands</p>
                </NavLink>

                <NavLink className={navLinkClass} to="/contact">
                    <img className='w-5 h-5' src={assets.add_icon} alt="Contact" />
                    <p className='hidden md:block'>Contact Us</p>
                </NavLink>

            </div>

        </div>
    )
}

export default Sidebar