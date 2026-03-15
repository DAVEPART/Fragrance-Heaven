import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { useAlert } from '../context/AlertContext'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const List = ({ token }) => {
  const alert = useAlert();
  const navigate = useNavigate();

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
        <div className='hidden md:grid grid-cols-[80px_1.5fr_1fr_1fr_1.5fr_1fr_80px_80px_200px] items-center gap-4 py-3 px-4 bg-primary-600 text-white font-semibold rounded-t-lg text-sm'>
          <div>Image</div>
          <div>Name</div>
          <div>Brand</div>
          <div>Category</div>
          <div>Sizes</div>
          <div>Base Price</div>
          <div>Rating</div>
          <div>Reviews</div>
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
                className='grid grid-cols-[80px_2fr] md:grid-cols-[80px_1.5fr_1fr_1fr_1.5fr_1fr_80px_80px_200px] items-center gap-4 py-4 px-4 hover:bg-gray-50 transition-colors'
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
                {/* Rating column */}
                <div className='hidden md:flex items-center gap-1'>
                  <svg className='w-3.5 h-3.5 text-yellow-400 fill-current flex-shrink-0' viewBox='0 0 20 20'>
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                  <span className='text-sm font-medium text-gray-800'>
                    {item.rating != null ? Number(item.rating).toFixed(1) : '—'}
                  </span>
                </div>
                {/* Reviews count column */}
                <p className='hidden md:block text-sm text-gray-600 font-medium'>
                  {item.reviewCount != null ? item.reviewCount : 0}
                </p>
                <div className='flex justify-center gap-2'>
                  <Button
                    onClick={() => navigate(`/edit/${item.id}`)}
                    variant="primary"
                    size="sm"
                    className="flex items-center min-w-[90px]"
                  >
                    <EditIcon /> Update
                  </Button>
                  <Button
                    onClick={() => removeProduct(item.id)}
                    variant="danger"
                    size="sm"
                    className="flex items-center min-w-[90px]"
                  >
                    <TrashIcon /> Delete
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
