import React from 'react'
import { assets } from '../assets/assets'
import Button from './ui/Button'

const Navbar = ({ setToken }) => {
  return (
    <div className='flex items-center py-4 px-6 justify-between bg-white border-b border-gray-200 shadow-sm'>
      <img className='w-[max(10%,80px)]' src={assets.logo} alt="Logo" />
      <Button
        onClick={() => setToken('')}
        variant="primary"
        size="md"
      >
        Logout
      </Button>
    </div>
  )
}

export default Navbar