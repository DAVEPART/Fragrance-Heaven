import React, { useContext, useEffect, useState } from 'react'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import CartTotal from '../components/CartTotal'
import Button from '../components/common/Button'
import CartItemRow from '../components/CartItemRow'

const Cart = () => {
  const { products, currency, navigate, cartItems, updateQuantity, getImageUrl, token, deleteCartItem } = useContext(ShopContext)
  const [cartData, setCartData] = useState([])

  useEffect(() => {
    const tempData = []

    if (products.length > 0 && cartItems) {
      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          if (cartItems[productId][size] > 0) {
            const productData = products.find((product) => product.id === Number(productId))
            if (productData) {
              // Find the size object in the new schema or match by size string in old schema
              let price = 0;
              let image = productData.imageMain || productData.image?.[0] || '';

              if (Array.isArray(productData.sizes) && typeof productData.sizes[0] === 'object') {
                const sizeObj = productData.sizes.find(s => s.sizeMl === size);
                price = sizeObj ? sizeObj.price : (productData.priceBase || 0);
              } else if (Array.isArray(productData.price)) {
                const sizeIndex = productData.sizes?.findIndex((s) => s === size);
                price = productData.price[sizeIndex] || 0;
              }

              tempData.push({
                id: productId,
                size,
                quantity: cartItems[productId][size],
                price: price,
                image: image,
                name: productData.name,
              })
            }
          }
        }
      }
    }

    setCartData(tempData)
  }, [cartItems, products])

  const proceedCheckOut = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Sync current cart state to localStorage for the checkout flow
    if (cartData.length > 0) {
      localStorage.setItem("order_placed", JSON.stringify(cartData));
    }
    navigate('/place-order')
  }

  return (
    <div className='border-t border-gray-100 pt-14'>
      <div className='text-3xl font-bold mb-8'>
        <Title text1={'YOUR'} text2={'SHOPPING BAG'} />
      </div>

      <div className='flex flex-col gap-4'>
        {cartData.length > 0 ? (
          cartData.map((item, index) => (
            <CartItemRow
              key={`${item.id}-${item.size}`}
              item={item}
              currency={currency}
              getImageUrl={getImageUrl}
              updateQuantity={updateQuantity}
              deleteCartItem={deleteCartItem}
            />
          ))
        ) : (
          <div className='flex flex-col items-center justify-center py-20 gap-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200'>
            <img className='w-20 opacity-20' src={assets.cart_icon} alt="Empty Cart" />
            <p className='text-gray-400 font-medium'>Your bag is currently empty.</p>
            <Button variant='outline' onClick={() => navigate('/collection')} className='mt-2'>
              Start Shopping
            </Button>
          </div>
        )}
      </div>

      {cartData.length > 0 && (
        <div className='flex justify-end my-20'>
          <div className='w-full sm:w-[500px] bg-white p-8 rounded-3xl shadow-xl theme-border border border-gray-50'>
            <CartTotal cartItems={cartData} />
            <div className='w-full mt-8'>
              <Button
                onClick={proceedCheckOut}
                className='w-full'
                variant='secondary'
              >
                Secure Checkout
              </Button>
              <p className='text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest'>
                Free Shipping & 30-Day Returns Included
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
