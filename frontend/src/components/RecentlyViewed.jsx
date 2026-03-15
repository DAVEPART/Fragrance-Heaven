import React, { useEffect, useState } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import { getRecentProducts } from '../utils/recentProducts';

const RecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    // Fetch products from local storage when the component mounts
    const products = getRecentProducts();
    setRecentProducts(products);
  }, []); // Only run once on mount for the home page

  // Do not render the section at all if there are no recent products
  if (!recentProducts || recentProducts.length === 0) {
    return null;
  }

  return (
    <div className='my-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'RECENTLY'} text2={'VIEWED'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-400 font-medium mt-2'>
          Rediscover your favorite fragrances
        </p>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 gap-y-6'>
        {recentProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item.id || item._id}
            image={item.imageMain || item.image}
            name={item.name}
            price={item.priceBase || item.price}
            item={item} // Pass the minimal item representation
          />
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
