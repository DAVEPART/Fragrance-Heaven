import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { useAlert } from '../context/AlertContext'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const List = ({ token }) => {
  const alert = useAlert();

  const [list, setList] = useState([])

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products.reverse())
      } else {
        alert.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      alert.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    const confirmed = await alert.confirm(
      "Remove Product",
      "Are you sure you want to remove this product? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { id },
        { headers: { token } }
      )
      if (response.data.success) {
        alert.success(response.data.message)
        await fetchList()
      } else {
        alert.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      alert.error(error.message)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <Card title="All Products">
      <div className='overflow-x-auto'>
        {/* Table Header */}
        <div className='hidden md:grid grid-cols-[80px_1.5fr_1fr_1fr_1.5fr_1fr_100px] items-center gap-4 py-3 px-4 bg-primary-600 text-white font-semibold rounded-t-lg text-sm'>
          <div>Image</div>
          <div>Name</div>
          <div>Brand</div>
          <div>Category</div>
          <div>Sizes</div>
          <div>Base Price</div>
          <div className='text-center'>Action</div>
        </div>

        {/* Product List */}
        <div className='divide-y divide-gray-200'>
          {list.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>
              No products found. Add your first product!
            </div>
          ) : (
            list.map((item, index) => (
              <div
                className='grid grid-cols-[80px_2fr] md:grid-cols-[80px_1.5fr_1fr_1fr_1.5fr_1fr_100px] items-center gap-4 py-4 px-4 hover:bg-gray-50 transition-colors'
                key={index}
              >
                <img
                  className='w-16 h-16 object-cover rounded-lg border border-gray-200'
                  src={item.imageMain || (item.imageGallery && item.imageGallery[0]) || (item.image && item.image[0])}
                  alt={item.name}
                />
                <div>
                  <p className='font-medium text-gray-900'>{item.name}</p>
                  <p className='text-xs text-gray-500 md:hidden'>{item.brand?.name || item.brand || 'N/A'}</p>
                </div>
                <p className='hidden md:block text-sm'>{item.brand?.name || (typeof item.brand === 'string' ? item.brand : 'N/A')}</p>
                <p className='hidden md:block text-sm'>{item.category?.name || (typeof item.category === 'string' ? item.category : 'N/A')}</p>
                <div className='hidden md:flex flex-wrap gap-1.5'>
                  {Array.isArray(item.sizes) ? (
                    item.sizes.map((s, i) => (
                      <Badge key={i} variant="blue" size="sm">
                        {typeof s === 'object' ? s.sizeMl : s}
                      </Badge>
                    ))
                  ) : 'N/A'}
                </div>
                <p className='font-medium text-primary-700'>
                  {currency}{item.priceBase || (Array.isArray(item.sizes) && typeof item.sizes[0] === 'object' ? item.sizes[0].price : (item.price && item.price[0])) || 0}
                </p>
                <div className='flex justify-center'>
                  <Button
                    onClick={() => removeProduct(item.id)}
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}

export default List
