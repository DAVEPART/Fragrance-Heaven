import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import RecentlyViewed from '../components/RecentlyViewed'

const Home = () => {
  return (
    <div>
      <Hero />
      <LatestCollection />
      <BestSeller />
      <RecentlyViewed />
      <OurPolicy />
    </div>
  )
}

export default Home
