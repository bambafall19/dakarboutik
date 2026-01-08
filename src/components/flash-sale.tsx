"use client";

import { useState, useEffect } from 'react';
import { ProductGrid } from '@/components/product-grid';
import { getProducts } from '@/lib/data';
import { LightningBoltIcon } from '@radix-ui/react-icons'

const allProducts = getProducts();
const flashSaleProducts = allProducts.filter(p => p.salePrice).slice(0, 4);

export function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    hours: '08',
    minutes: '17',
    seconds: '56',
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const saleEndTime = new Date();
      saleEndTime.setHours(saleEndTime.getHours() + 8, 17, 56);

      const interval = setInterval(() => {
        const now = new Date();
        const difference = saleEndTime.getTime() - now.getTime();

        if (difference > 0) {
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / 1000 / 60) % 60);
          const seconds = Math.floor((difference / 1000) % 60);
          setTimeLeft({
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
          });
        } else {
          setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    };

    calculateTimeLeft();
  }, []);

  return (
    <div className="w-full bg-card rounded-lg p-6">
       <div className="flex items-center mb-6">
        <div className="flex items-center gap-2">
            <LightningBoltIcon className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold tracking-tight">Flash Sale</h2>
        </div>
        <div className="flex items-center gap-2 ml-4">
            <span className="bg-red-500 text-white font-bold text-sm px-2 py-1 rounded-md">{timeLeft.hours}</span>
            <span className="font-bold text-red-500">:</span>
            <span className="bg-red-500 text-white font-bold text-sm px-2 py-1 rounded-md">{timeLeft.minutes}</span>
            <span className="font-bold text-red-500">:</span>
            <span className="bg-red-500 text-white font-bold text-sm px-2 py-1 rounded-md">{timeLeft.seconds}</span>
        </div>
      </div>
      <ProductGrid products={flashSaleProducts} title="" />
    </div>
  );
}
