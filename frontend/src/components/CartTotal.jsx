import React, { useContext, useEffect, useState } from 'react';
import Title from './Title';
import { ShopContext } from '../context/ShopContext';

const CartTotal = ({ cartItems }) => {
  const { currency, delivery_fee } = useContext(ShopContext);
  const [cartAmount, setCartAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const calculateCartAmount = () => {
      if (cartItems && cartItems.length > 0) {
        const total = cartItems.reduce((acc, item) => {
          return acc + item.price * item.quantity;
        }, 0);
        setCartAmount(total);
      } else {
        setCartAmount(0);
      }
    };

    calculateCartAmount();
  }, [cartItems]);

  useEffect(() => {
    setTotalAmount(cartAmount + delivery_fee);
  }, [cartAmount, delivery_fee]);

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between">
          <p>Sub Total</p>
          <p>
            {currency}
            {cartAmount.toFixed(2)}
          </p>
        </div>
        <div className="flex justify-between">
          <p>Delivery Fee</p>
          <p>
            {currency}
            {delivery_fee}
          </p>
        </div>
        <hr />
        <div className="flex justify-between font-medium">
          <p>Total</p>
          <p>
            {currency}
            {totalAmount.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;