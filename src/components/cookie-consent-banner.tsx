'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const COOKIE_CONSENT_KEY = 'dakarboutik_cookie_consent';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Could not access localStorage for cookie consent.", error);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
      setIsVisible(false);
    } catch (error) {
       console.error("Could not save cookie consent to localStorage.", error);
       // Still hide the banner for this session
       setIsVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-full duration-500">
        <Card className="container flex flex-col md:flex-row items-center justify-between gap-4 py-4 shadow-2xl">
            <p className="text-sm text-muted-foreground text-center md:text-left">
                Nous utilisons des cookies pour améliorer votre expérience sur notre site. En continuant, vous acceptez notre{' '}
                <Link href="/politique-de-confidentialite" className="underline hover:text-primary">
                politique de cookies
                </Link>.
            </p>
            <Button onClick={handleAccept} className="flex-shrink-0">Accepter</Button>
        </Card>
    </div>
  );
}
