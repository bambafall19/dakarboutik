
'use client';

import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="bg-secondary text-secondary-foreground text-xs h-10 flex items-center justify-center">
      <div className="container flex items-center justify-center">
        <p>Livraison gratuite à partir de 50 000 XOF - C'est parti !</p>
      </div>
    </div>
  );
}
