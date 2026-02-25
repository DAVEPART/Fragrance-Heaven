import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import ShopContextProvider from './context/ShopContext.jsx'
import { AlertProvider } from './context/AlertContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AlertProvider>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </AlertProvider>
  </BrowserRouter>
)
