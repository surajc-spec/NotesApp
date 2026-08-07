import React from 'react';
import Hero from '../components/Hero';
import Testimonials from '../components/Testimonials';
import Features from '../components/Features';

const Home = () => {
  return (
    <div className="w-full">
      <Hero />
      <Testimonials />
      <Features />
    </div>
  );
};

export default Home;
