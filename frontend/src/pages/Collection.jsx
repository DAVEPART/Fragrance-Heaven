import React, { useContext, useEffect, useState, useCallback } from 'react'
import Title from '../components/Title'
import LuxuryProductCard from '../components/LuxuryProductCard'
import { ShopContext } from '../context/ShopContext'
import FilterSidebar from '../components/FilterSidebar'
import api from '../api/api'

const Collection = () => {

  const { search, showSearch, currency } = useContext(ShopContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [sortType, setSortType] = useState('relevant')
  const [filters, setFilters] = useState({
    category: [],
    brand: [],
    concentration: [],
    character: [],
    season: [],
    occasion: [],
    subCategory: []
  });

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/api/product/filters');
      if (response.data.success) {
        setFilterOptions(response.data.filters);
      } else {
        console.error("Error fetching filters:", response.data.message);
      }
    } catch (error) {
      console.error("API Error fetching filters:", error);
    }
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Map frontend filter keys to backend expected parameter names
      Object.entries(filters).forEach(([key, values]) => {
        if (values.length > 0) {
          params.append(key, values.join(','));
        }
      });

      if (showSearch && search) {
        params.append('search', search);
      }

      params.append('sort', sortType);

      const response = await api.get(`/api/product/filtered?${params.toString()}`);
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, search, showSearch, sortType]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleFilter = (section, value) => {
    setFilters(prev => {
      const current = prev[section] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [section]: updated };
    });
  }

  const removeFilter = (section, value) => {
    setFilters(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item !== value)
    }));
  }

  const clearAllFilters = () => {
    setFilters({
      category: [],
      brand: [],
      concentration: [],
      character: [],
      season: [],
      occasion: [],
      subCategory: []
    });
  }

  const activeFilters = Object.entries(filters).flatMap(([section, values]) =>
    values.map(val => ({ section, val }))
  );

  return (
    <div className='flex flex-col sm:flex-row gap-12 pt-10'>

      {/* Filter Sidebar */}
      <FilterSidebar
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        filters={filters}
        filterOptions={filterOptions}
        toggleFilter={toggleFilter}
      />

      {/* Right Side */}
      <div className='flex-1'>

        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4'>
          <div>
            <Title text1={"THE"} text2={"COLLECTION"} />
            <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2'>
              {loading ? 'Discovering Scents...' : `Explore ${products.length} Masterpiece Scents`}
            </p>
          </div>

          {/* Product Sort */}
          <div className='relative'>
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className='appearance-none border-b border-gray-100 text-[10px] pr-8 py-2 bg-transparent focus:outline-none focus:border-[#FFD1DC] font-bold text-gray-500 uppercase tracking-widest cursor-pointer'
            >
              <option value="relevant">Relevant</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <div className='absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none'>
              <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-8'>
            {activeFilters.map(({ section, val }) => (
              <div key={`${section}-${val}`} className='flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full group hover:border-[#FFD1DC] transition-all cursor-default'>
                <span className='text-[9px] font-bold text-gray-400 uppercase tracking-tighter'>{section}:</span>
                <span className='text-[10px] font-bold text-gray-600'>{val}</span>
                <button
                  onClick={() => removeFilter(section, val)}
                  className='text-gray-400 hover:text-red-400 transition-colors'
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={clearAllFilters}
              className='text-[9px] font-bold text-[#FFD1DC] uppercase tracking-widest border-b border-[#FFD1DC] hover:text-[#ffb6c1] hover:border-[#ffb6c1] transition-all ml-2'
            >
              Clear All
            </button>
          </div>
        )}

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-10 gap-y-16'>
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div className='aspect-[4/5] bg-gray-100 rounded-3xl mb-4'></div>
                <div className='h-4 bg-gray-100 rounded w-2/3 mb-2'></div>
                <div className='h-4 bg-gray-100 rounded w-1/2'></div>
              </div>
            ))
          ) : (
            products.map((item) => (
              <LuxuryProductCard
                key={item.id}
                id={item.id}
                image={item.imageMain}
                name={item.name}
                price={item.priceBase || (item.sizes?.[0]?.price)}
                brand={item.brand?.name}
                concentration={item.concentration}
              />
            ))
          )}
        </div>

        {!loading && products.length === 0 && (
          <div className='py-32 text-center'>
            <p className='prata-regular text-xl text-gray-400 italic'>No fragrances match your refined criteria.</p>
            <button
              onClick={clearAllFilters}
              className='mt-8 text-[10px] uppercase tracking-widest font-bold text-[#FFD1DC] border-b border-[#FFD1DC] pb-1'
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Collection
