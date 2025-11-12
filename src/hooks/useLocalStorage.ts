"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const isInitializedRef = useRef(false);
  const isUpdatingRef = useRef(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined" || isInitializedRef.current) return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item) as T;
        setStoredValue(parsed);
      }
    } catch (error: unknown) {
      console.error("Error parsing localStorage item:", error);
    }
    isInitializedRef.current = true;
  }, [key]);

  // Custom setter that updates both state and localStorage atomically
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;

      setStoredValue((currentValue) => {
        const valueToStore = value instanceof Function ? value(currentValue) : value;
        
        if (typeof window !== "undefined" && isInitializedRef.current) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        
        isUpdatingRef.current = false;
        return valueToStore;
      });
    } catch (error) {
      console.error("Error setting localStorage value:", error);
      isUpdatingRef.current = false;
    }
  }, [key]);

  return [storedValue, setValue] as const;
}
