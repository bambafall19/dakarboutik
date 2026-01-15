
'use client';

import Image from 'next/image';
import { Skeleton } from './ui/skeleton';

export function HeroSection() {
    return (
        <div className="container py-6">
             <div className="relative rounded-lg overflow-hidden w-full aspect-[16/6] bg-secondary">
                <Image 
                    src="https://storage.googleapis.com/studioprod-52595.appspot.com/dakarboutik/can-banner.png" 
                    alt="CAN 2023 - Allez les Lions"
                    data-ai-hint="senegal football supporters"
                    fill 
                    className="object-cover"
                />
            </div>
      </div>
    );
}
