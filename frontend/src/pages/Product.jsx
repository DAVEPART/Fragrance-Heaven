import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import api from '../api/api';
import { useAlert } from '../context/AlertContext';
import Loader from '../components/Loader';
import Button from '../components/common/Button';
import NotesPyramid from '../components/NotesPyramid';
import FragranceProfile from '../components/FragranceProfile';
import QuantitySelector from '../components/common/QuantitySelector';
import ReviewSection from '../components/ReviewSection';
import { saveRecentProduct } from '../utils/recentProducts';

const Product = () => {
  const { productId } = useParams();
  const { currency, getImageUrl, navigate, token, addToCart: contextAddToCart } = useContext(ShopContext);
  const alert = useAlert();
  const [productData, setProductData] = useState(null);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    // Reset quantity when size or product changes
    setQuantity(1);
  }, [productId, selectedSizeIndex]);

  const fetchProductData = React.useCallback(async () => {
    try {
      const response = await api.post('/api/product/single', { productId });
      if (response.data.success) {
        setProductData(response.data.product);
        saveRecentProduct(response.data.product);
        setImage(response.data.product.imageMain || response.data.product.imageGallery?.[0] || '');
      } else {
        alert.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleAddToCart = async () => {
    if (!token) {
      alert.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const selectedSize = productData.sizes?.[selectedSizeIndex];
    if (!selectedSize) {
      alert.error('Please select a size first');
      return;
    }

    setAddingToCart(true);
    await contextAddToCart(productId, selectedSize.sizeMl, quantity);
    setAddingToCart(false);
  };

  if (loading) return <Loader />;
  if (!productData) return <div className="text-center py-20 font-medium">Product not found</div>;

  const currentPrice = productData.sizes?.[selectedSizeIndex]?.price || productData.priceBase;
  const currentStock = productData.sizes?.[selectedSizeIndex]?.stock || 0; // Assuming backend might provide stock

  return (
    <div className="pt-10 transition-opacity duration-1000 opacity-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* HERO SECTION */}
      <div className="flex flex-col lg:flex-row gap-16 mb-24">
        {/* Image Gallery */}
        <div className="flex-1 flex flex-col md:flex-row gap-6">
          <div className="order-2 md:order-1 flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto max-h-[600px] scrollbar-hide">
            {[productData.imageMain, ...(productData.imageGallery || [])].filter(Boolean).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setImage(img)}
                className={`flex-shrink-0 w-20 h-24 cursor-pointer overflow-hidden transition-all duration-300 ${image === img ? 'opacity-100 ring-1 ring-[#FFD1DC]' : 'opacity-40 hover:opacity-100'}`}
              >
                <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2 flex-1 bg-[#F9F9F9] flex items-center justify-center p-12 overflow-hidden">
            <img
              src={getImageUrl(image)}
              alt={productData.name}
              className="max-w-full max-h-[600px] object-contain mix-blend-multiply hover:scale-110 transition-transform duration-1000 ease-out"
            />
          </div>
        </div>

        {/* Purchase Panel (Sticky on Desktop) */}
        <div className="lg:w-[400px]">
          <div className="lg:sticky lg:top-32 space-y-8">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 mb-2 font-bold">{productData.brand?.name || productData.brand || 'Luxury Collection'}</p>
              <h1 className="prata-regular text-4xl text-gray-800 leading-tight mb-2">{productData.name}</h1>
              <p className="text-sm italic text-gray-500 tracking-wide">{productData.concentration || 'Eau de Parfum'}</p>
            </div>

            <div className="flex items-center gap-4 py-4 border-b border-gray-100">
              <span className="text-2xl font-light text-gray-800 tracking-wider">
                {currency}{currentPrice}
              </span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-3 h-3 ${i < Math.floor(productData.rating || 4.5) ? 'text-[#FFD1DC] fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-[10px] text-gray-400 font-bold ml-2 uppercase">({productData.reviewCount || 48} Reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-800">Select Size</p>
              <div className="flex gap-4">
                {productData.sizes?.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`px-6 py-3 text-xs tracking-widest transition-all ${selectedSizeIndex === idx ? 'bg-[#FFD1DC] text-white' : 'border border-gray-100 text-gray-400 hover:border-gray-300'}`}
                  >
                    {size.sizeMl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-800">Quantity</p>
              <QuantitySelector
                quantity={quantity}
                onIncrease={() => setQuantity(prev => (currentStock > 0 && prev >= currentStock) ? prev : prev + 1)}
                onDecrease={() => setQuantity(prev => Math.max(1, prev - 1))}
              />
              {currentStock > 0 && currentStock < 10 && (
                <p className="text-[10px] text-red-400 font-bold uppercase">Only {currentStock} left in stock</p>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full premium-button py-4"
            >
              {addingToCart ? 'Preserving...' : 'Add to Shopping Bag'}
            </Button>

            <div className="pt-8 space-y-4">
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <span className="w-8 h-[1px] bg-gray-200"></span>
                Complimentary Shipping
              </div>
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <span className="w-8 h-[1px] bg-gray-200"></span>
                Personalized Gifting
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STORY SECTION */}
      <div className="max-w-3xl mx-auto text-center mb-32">
        <h2 className="prata-regular text-3xl mb-12 uppercase tracking-[0.2em] text-gray-800">The Scent Story</h2>
        <p className="text-lg text-gray-600 leading-relaxed italic mb-8">
          "{productData.shortDescription || 'An invisible accessory, the final touch, the first impression.'}"
        </p>
        <div className="h-12 w-[1px] bg-gray-200 mx-auto mb-8"></div>
        <p className="text-gray-500 whitespace-pre-line leading-loose text-base">
          {productData.fullDescription || productData.description}
        </p>
      </div>

      {/* OLFACTORY PYRAMID */}
      <NotesPyramid notes={productData.notes} />

      {/* FRAGRANCE PROFILE */}
      <FragranceProfile
        longevity={productData.longevity}
        sillage={productData.sillage}
        character={productData.fragranceCharacter}
        season={productData.season}
        occasion={productData.occasion}
      />

      {/* CUSTOMER REVIEWS */}
      <ReviewSection productId={Number(productId)} onReviewAdded={fetchProductData} />

      {/* BRAND / CRAFTSMANSHIP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center my-32">
        <div className="bg-[#FFF0F5] aspect-[4/5] overflow-hidden">
          <img src="https://images.unsplash.com/photo-1541604193435-22287d32c2c2?auto=format&fit=crop&q=80" alt="Craftsmanship" className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
        </div>
        <div className="space-y-8">
          <h3 className="prata-regular text-3xl text-gray-800 uppercase tracking-widest">Heritage of Craft</h3>
          <p className="text-gray-500 leading-loose">
            Every bottle reflects our commitment to the art of niche perfumery. Sourced from the finest ingredients in Grasse and around the globe, our scents are aged to perfection to ensure depth, complexity, and soul.
          </p>
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 pt-8">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-800 mb-2">Sustainable</h4>
              <p className="text-xs text-gray-500">Ethically sourced raw materials from local harvesters.</p>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-800 mb-2">Artisanal</h4>
              <p className="text-xs text-gray-500">Hand-finished bottles with meticulous attention to detail.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="mt-32 pb-24 border-t border-gray-100 pt-24">
        <h3 className="prata-regular text-2xl text-center mb-16 uppercase tracking-widest text-gray-800">You May Also Desire</h3>
        <RelatedProducts category={productData.category?.name || productData.category} subCategory={productData.subCategory} />
      </div>
    </div>
  );
};

export default Product;
