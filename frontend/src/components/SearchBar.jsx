import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';

const SearchBar = () => {

  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);

  useEffect(() => {
    if (location.pathname.includes('collection') && showSearch) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [location, showSearch])

  return showSearch && visible ? (
    <div className='border-t border-b border-gray-100 bg-white text-center py-6'>
      <div className='inline-flex items-center justify-center border-2 border-gray-100 px-6 py-3 mx-3 rounded-2xl w-3/4 sm:w-1/2 bg-gray-50/50 focus-within:border-[#FFD1DC] transition-all shadow-sm'>
        <input
          className='flex-1 outline-none bg-transparent text-sm font-medium text-gray-700 placeholder:text-gray-300'
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder='Search our collection...'
        />
        <img className='w-4 opacity-40' src={assets.search_icon} alt="Search" />
      </div>
      <div
        onClick={() => setShowSearch(false)}
        className='inline-flex items-center justify-center w-10 h-10 bg-[#FFF0F5] hover:bg-[#FFD1DC] transition-colors rounded-xl cursor-pointer ml-2'
      >
        <img className='w-3 invert opacity-60' src={assets.cross_icon} alt="Close" />
      </div>
    </div>
  ) : null
}

export default SearchBar
