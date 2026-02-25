import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Category from './pages/Category'
import Brand from './pages/Brand'
import Contact from './pages/Contact'
import Orders from './pages/Orders'
import Login from './components/Login'

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '₹'

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');

  useEffect(() => {
    localStorage.setItem('token', token)
  }, [token])

  return (
    <div className='bg-gray-50 min-h-screen'>
      {token === ""
        ? <Login setToken={setToken} />
        : <>
          <Navbar setToken={setToken} />
          <div className='flex w-full'>
            <Sidebar />
            <div className='flex-1 mx-auto px-8 py-8 text-gray-600 text-base max-w-7xl'>
              <Routes>
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/category' element={<Category token={token} />} />
                <Route path='/brand' element={<Brand token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
                <Route path='/contact' element={<Contact token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default App