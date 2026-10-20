'use client';

import React, { useEffect, useState } from 'react';

const Snowfall = () => {
  const [snowflakes, setSnowflakes] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const generateSnowflakes = () => {
      const newSnowflakes = Array.from({ length: 150 }).map(() => ({
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 3 + 1}px`,
        height: `${Math.random() * 3 + 1}px`,
        animationDuration: `${Math.random() * 5 + 5}s`,
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random(),
      }));
      setSnowflakes(newSnowflakes);
    };

    generateSnowflakes();
  }, []);


  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]">
      {snowflakes.map((style, index) => (
        <div key={index} className="snowflake" style={style}></div>
      ))}
    </div>
  );
};

export default Snowfall;
