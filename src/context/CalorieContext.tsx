"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CalorieEntry, DailyTotal, UserSettings } from "../lib/types";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface CalorieContextType {
  entries: CalorieEntry[];
  dailyTotals: DailyTotal[];
  settings: UserSettings;
  addEntry: (entry: CalorieEntry) => void;
  updateEntry: (id: string, entry: Partial<CalorieEntry>) => void;
  deleteEntry: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  getTodaysTotal: () => number;
  getEntriesForDate: (date: string) => CalorieEntry[];
  getTodaysMacros: () => { protein: number; carbs: number; fat: number };
  getWeeklyTotals: () => DailyTotal[];
}

export const CalorieContext = createContext<CalorieContextType | undefined>(
  undefined
);

export function useCalorieContext() {
  const context = useContext(CalorieContext);
  if (!context) {
    throw new Error("useCalorieContext must be used within CalorieProvider");
  }
  return context;
}

interface CalorieProviderProps {
  children: ReactNode;
}

export function CalorieProvider({ children }: CalorieProviderProps) {
  const [entries, setEntries] = useLocalStorage<CalorieEntry[]>(
    "calorie_entries",
    []
  );
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    "user_settings",
    {}
  );
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);

  // Calculate daily totals whenever entries change
  useEffect(() => {
    const totals = calculateDailyTotals(entries);
    setDailyTotals(totals);
  }, [entries]);

  const addEntry = (entry: CalorieEntry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  const updateEntry = (id: string, updatedEntry: Partial<CalorieEntry>) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, ...updatedEntry } : entry
      )
    );
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const getTodaysTotal = (): number => {
    const today = new Date().toISOString().split("T")[0];
    const todaysEntries = entries.filter(
      (entry) => entry.timestamp.split("T")[0] === today
    );
    return todaysEntries.reduce((sum, entry) => sum + entry.total_calories, 0);
  };

  const getTodaysMacros = () => {
    const today = new Date().toISOString().split("T")[0];
    const todaysEntries = entries.filter(
      (entry) => entry.timestamp.split("T")[0] === today
    );
    return todaysEntries.reduce(
      (totals, entry) => ({
        protein: totals.protein + entry.total_protein,
        carbs: totals.carbs + entry.total_carbs,
        fat: totals.fat + entry.total_fat,
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );
  };

  const getEntriesForDate = (date: string): CalorieEntry[] => {
    return entries.filter((entry) => entry.timestamp.split("T")[0] === date);
  };

  const getWeeklyTotals = (): DailyTotal[] => {
    const today = new Date();
    const weekTotals: DailyTotal[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayEntries = getEntriesForDate(dateStr);
      const dayTotal: DailyTotal = {
        date: dateStr,
        calories: dayEntries.reduce(
          (sum, entry) => sum + entry.total_calories,
          0
        ),
        protein: dayEntries.reduce(
          (sum, entry) => sum + entry.total_protein,
          0
        ),
        carbs: dayEntries.reduce((sum, entry) => sum + entry.total_carbs, 0),
        fat: dayEntries.reduce((sum, entry) => sum + entry.total_fat, 0),
        entries: dayEntries.length,
      };
      weekTotals.push(dayTotal);
    }

    return weekTotals;
  };

  const value: CalorieContextType = {
    entries,
    dailyTotals,
    settings,
    addEntry,
    updateEntry,
    deleteEntry,
    updateSettings,
    getTodaysTotal,
    getEntriesForDate,
    getTodaysMacros,
    getWeeklyTotals,
  };

  return (
    <CalorieContext.Provider value={value}>{children}</CalorieContext.Provider>
  );
}

function calculateDailyTotals(entries: CalorieEntry[]): DailyTotal[] {
  const dailyMap = new Map<string, DailyTotal>();

  entries.forEach((entry) => {
    const date = entry.timestamp.split("T")[0];
    const existing = dailyMap.get(date) || {
      date,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      entries: 0,
    };

    dailyMap.set(date, {
      date,
      calories: existing.calories + entry.total_calories,
      protein: existing.protein + entry.total_protein,
      carbs: existing.carbs + entry.total_carbs,
      fat: existing.fat + entry.total_fat,
      entries: existing.entries + 1,
    });
  });

  return Array.from(dailyMap.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}
