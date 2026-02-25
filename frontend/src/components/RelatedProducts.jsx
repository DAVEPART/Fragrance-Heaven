import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import LuxuryProductCard from './LuxuryProductCard';

const RelatedProducts = ({ category, subCategory }) => {

    const [related, setRelated] = useState([])
    const { products } = useContext(ShopContext)

    useEffect(() => {
        if (products.length > 0) {
            let productsCopy = products.slice()
            productsCopy = productsCopy.filter(item => category === item.category);
            productsCopy = productsCopy.filter(item => subCategory === item.subCategory);
            setRelated(productsCopy.slice(0, 4)); // Showing 4 for cleaner grid
        }
    }, [products, category, subCategory])

    return (
        <div className='my-24'>
            <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10'>
                {
                    related.map((item) => (
                        <LuxuryProductCard
                            key={item.id}
                            id={item.id}
                            image={item.imageMain || item.imageGallery?.[0]}
                            name={item.name}
                            price={item.priceBase || (item.sizes?.[0]?.price)}
                            brand={item.brand}
                            concentration={item.concentration}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default RelatedProducts
