import React, { useEffect, useState } from 'react'
import Title from './Title'
import ProductItem from './ProductItem'
import api from '../api/api'
import Loader from './Loader'

const LatestCollection = () => {

    const [latestProducts, setLatestProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const fetchProducts = async () => {
            try {
                const response = await api.get('/api/product/list')

                if (response.data.success) {
                    setLatestProducts(response.data.products.slice(0, 10))
                }

            } catch (error) {
                console.error("Error fetching products:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()

    }, [])

    if (loading) {
        return <Loader />
    }

    return (
        <div className='my-10'>
            <div className='text-center py-8 text-3xl'>
                <Title text1={"LATEST"} text2={"COLLECTIONS"} />
                <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
                    At Fragrance Heaven, we believe a fragrance is more than just a pleasant aroma —
                    it's a personal statement, a memory, and an invisible accessory that defines your presence.
                </p>
            </div>

            {/* Products Grid */}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10'>
                {
                    latestProducts.map((item) => (
                        <ProductItem
                            key={item.id}
                            id={item.id}
                            image={item.imageMain || item.image?.[0]}
                            name={item.name}
                            price={item.priceBase || (item.sizes?.[0]?.price)}
                            item={item}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default LatestCollection
