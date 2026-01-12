
import Image from 'next/image';
import Link from 'next/link';
import { getBanners } from '@/lib/data';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function HeroSection() {
  const banners = getBanners();

  // Assuming first banner is the main hero and second is the side banner
  const mainBanner = banners[0];
  const sideBanner = banners.find(b => b.id === 'banner-sale') || banners[1];

  return (
    <section className="w-full bg-background mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Banner */}
          <div className="md:col-span-2">
            <Card className="overflow-hidden h-full border-0">
              <div className="relative aspect-[16/8] w-full">
                <Image
                  src={mainBanner.image.imageUrl}
                  alt={mainBanner.title}
                  data-ai-hint={mainBanner.image.imageHint}
                  fill
                  priority
                  className="object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col items-start justify-center p-8 md:p-12">
                  <div className="max-w-md text-white">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      {mainBanner.title}
                    </h1>
                    {mainBanner.subtitle && (
                      <p className="mt-4 max-w-xl text-base md:text-lg text-white/90">
                        {mainBanner.subtitle}
                      </p>
                    )}
                      <Button asChild className="mt-6" size="lg">
                      <Link href={mainBanner.linkUrl}>Acheter maintenant</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Side Banner */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden h-full border-0">
              <div className="relative aspect-[9/10] w-full h-full">
                <Image
                  src={sideBanner.image.imageUrl}
                  alt={sideBanner.title}
                  data-ai-hint={sideBanner.image.imageHint}
                  fill
                  className="object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center rounded-lg">
                    <div className="text-white">
                      <h2 className="text-3xl font-bold tracking-tight">
                          {sideBanner.title}
                        </h2>
                        {sideBanner.subtitle && (
                          <p className="mt-2 text-lg text-white/90">
                            {sideBanner.subtitle}
                          </p>
                        )}
                        <Button asChild className="mt-4" variant="secondary">
                          <Link href={sideBanner.linkUrl}>Profiter</Link>
                        </Button>
                    </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
    </section>
  );
}
