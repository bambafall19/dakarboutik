"use client";

import { useContext } from 'react';
import { SnowContext } from '@/context/snow-provider';

export const useSnow = () => {
  const context = useContext(SnowContext);
  if (context === undefined) {
    throw new Error('useSnow must be used within a SnowProvider');
  }
  return context;
};
