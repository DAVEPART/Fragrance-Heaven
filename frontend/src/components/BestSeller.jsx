import React, { useEffect, useState } from 'react'
import Title from './Title'
import LuxuryProductCard from './LuxuryProductCard';
import api from '../api/api';

const BestSeller = () => {

    const [bestSeller, setBestSeller] = useState([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const response = await api.get('/api/product/best-sellers');
                if (response.data.success) {
                    setBestSeller(response.data.bestSellers);
                }
            } catch (error) {
                console.error("Error fetching best sellers:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBestSellers();
    }, [])

    return (
        <div className='my-10'>
            <div className='text-center text-3xl py-8'>
                <Title text1={"BEST"} text2={"SELLERS"} />
                <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>A best seller refers to a fragrance that consistently has high demand, strong customer reviews, and repeat purchases. These perfumes often become the backbone of a store's sales and are important for inventory planning, marketing, and promotions.

                </p>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-10 gap-y-16'>
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className='animate-pulse'>
                            <div className='aspect-[4/5] bg-gray-100 rounded-3xl mb-4'></div>
                            <div className='h-4 bg-gray-100 rounded w-2/3 mb-2'></div>
                            <div className='h-4 bg-gray-100 rounded w-1/2'></div>
                        </div>
                    ))
                ) : (
                    bestSeller.map((item) => (
                        <LuxuryProductCard
                            key={item.productId}
                            id={item.productId}
                            image={item.image}
                            name={item.name}
                            price={item.price}
                            brand={item.brand}
                            concentration={item.concentration}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

export default BestSeller
