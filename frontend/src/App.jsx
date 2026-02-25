import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Product from './pages/Product'
import Footer from './components/Footer'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import SearchBar from './components/SearchBar'
import OurPolicy from './components/OurPolicy';
import { useNavigate, Navigate } from 'react-router-dom'
import { ShopContext } from './context/ShopContext'
import { useContext } from 'react'

const App = () => {
  const { token } = useContext(ShopContext);

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] min-h-screen flex flex-col'>
      <Navbar />
      <SearchBar />

      <main className="flex-grow">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/product/:productId' element={<Product />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={token ? <Navigate to='/' /> : <Login />} />
          <Route path='/place-order' element={<PlaceOrder />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/ourPolicy' element={<OurPolicy />} />
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
