
"use client";

import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";

const LOCAL_STORAGE_KEY = 'dakarboutik_snow_effect';

type SnowContextType = {
  isSnowing: boolean;
  toggleSnow: () => void;
};

export const SnowContext = createContext<SnowContextType | undefined>(undefined);

export const SnowProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSnowing, setIsSnowing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedValue) {
        setIsSnowing(JSON.parse(storedValue));
      }
    } catch (error) {
      console.error("Failed to load snow effect state from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(isSnowing));
        } catch (error) {
            console.error("Failed to save snow effect state to localStorage", error);
        }
    }
  }, [isSnowing, isLoaded]);

  const toggleSnow = useCallback(() => {
    setIsSnowing(prev => !prev);
  }, []);

  const value = useMemo(() => ({
    isSnowing,
    toggleSnow,
  }), [isSnowing, toggleSnow]);

  return (
    <SnowContext.Provider value={value}>
      {children}
    </SnowContext.Provider>
  );
};
