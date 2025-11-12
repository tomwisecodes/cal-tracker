"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCalorieContext } from "../context/CalorieContext";
import { WeightEntry, WeightUnit } from "../lib/types";

const KG_TO_LB = 2.20462;

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimeForInput = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const toKg = (value: number, unit: WeightUnit) =>
  unit === "kg" ? value : value / KG_TO_LB;

const fromKg = (value: number, unit: WeightUnit) =>
  unit === "kg" ? value : value * KG_TO_LB;

const WeightTracker = () => {
  const {
    weightEntries,
    addWeightEntry,
    deleteWeightEntry,
    settings,
    updateSettings,
  } = useCalorieContext();

  const [weightValue, setWeightValue] = useState("");
  const [unit, setUnit] = useState<WeightUnit>(
    settings.weight_unit ?? "lb"
  );
  const [entryDate, setEntryDate] = useState("");
  const [entryTime, setEntryTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const now = new Date();
    const dateStr = formatDateForInput(now);
    const timeStr = formatTimeForInput(now);
    setEntryDate(dateStr);
    setEntryTime(timeStr);
    setSelectedDate((current) => current || dateStr);
  }, []);

  useEffect(() => {
    if (settings.weight_unit && settings.weight_unit !== unit) {
      setUnit(settings.weight_unit);
    }
  }, [settings.weight_unit, unit]);

  useEffect(() => {
    if (!selectedDate && weightEntries.length > 0) {
      setSelectedDate(weightEntries[0].timestamp.split("T")[0]);
    }
  }, [weightEntries, selectedDate]);

  const entriesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return weightEntries.filter(
      (entry) => entry.timestamp.split("T")[0] === selectedDate
    );
  }, [weightEntries, selectedDate]);

  const weekSummary = useMemo(() => {
    if (weightEntries.length === 0) {
      return {
        currentAverage: null,
        previousAverage: null,
        delta: null,
        trend: "flat" as const,
      };
    }

    const today = new Date();
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );
    const startOfCurrentWeek = new Date(endOfToday);
    startOfCurrentWeek.setDate(startOfCurrentWeek.getDate() - 6);

    const endOfPreviousWeek = new Date(startOfCurrentWeek);
    endOfPreviousWeek.setMilliseconds(endOfPreviousWeek.getMilliseconds() - 1);
    const startOfPreviousWeek = new Date(endOfPreviousWeek);
    startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 6);

    const withinRange = (entry: WeightEntry, start: Date, end: Date) => {
      const timestamp = new Date(entry.timestamp);
      return timestamp >= start && timestamp <= end;
    };

    const currentWeekEntries = weightEntries.filter((entry) =>
      withinRange(entry, startOfCurrentWeek, endOfToday)
    );
    const previousWeekEntries = weightEntries.filter((entry) =>
      withinRange(entry, startOfPreviousWeek, endOfPreviousWeek)
    );

    const average = (entries: WeightEntry[]) => {
      if (entries.length === 0) return null;
      const sum = entries.reduce((acc, entry) => acc + entry.weightKg, 0);
      return sum / entries.length;
    };

    const currentAverage = average(currentWeekEntries);
    const previousAverage = average(previousWeekEntries);

    if (currentAverage === null || previousAverage === null) {
      return {
        currentAverage,
        previousAverage,
        delta: null,
        trend: "flat" as const,
      };
    }

    const delta = currentAverage - previousAverage;
    const trend =
      Math.abs(delta) < 0.1 ? "flat" : delta < 0 ? "down" : "up";

    return {
      currentAverage,
      previousAverage,
      delta,
      trend,
    };
  }, [weightEntries]);

  const handleUnitChange = (nextUnit: WeightUnit) => {
    setUnit(nextUnit);
    updateSettings({ weight_unit: nextUnit });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    setError("");

    const parsedWeight = parseFloat(weightValue);
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setError("Enter a valid weight above zero.");
      return;
    }

    if (!entryDate) {
      setError("Select a date for this entry.");
      return;
    }

    if (!entryTime) {
      setError("Select a time for this entry.");
      return;
    }

    const timestamp = new Date(`${entryDate}T${entryTime}`);
    if (Number.isNaN(timestamp.getTime())) {
      setError("Invalid date or time provided.");
      return;
    }

    const weightKg = toKg(parsedWeight, unit);
    const timestampIso = timestamp.toISOString();

    setIsSubmitting(true);
    
    // Use setTimeout to ensure the state update happens in next tick
    setTimeout(() => {
      addWeightEntry(timestampIso, weightKg);
      setWeightValue("");
      setSelectedDate(entryDate);
      setIsSubmitting(false);
    }, 0);
  };

  const handleDeleteEntry = (timestamp: string) => {
    if (
      confirm("Delete this weight entry? This action cannot be undone.")
    ) {
      deleteWeightEntry(timestamp);
    }
  };

  const displayCurrentAverage =
    weekSummary.currentAverage !== null
      ? fromKg(weekSummary.currentAverage, unit)
      : null;
  const displayPreviousAverage =
    weekSummary.previousAverage !== null
      ? fromKg(weekSummary.previousAverage, unit)
      : null;
  const displayDelta =
    weekSummary.delta !== null ? fromKg(weekSummary.delta, unit) : null;

  const trendLabel =
    weekSummary.trend === "up"
      ? "Upward trend"
      : weekSummary.trend === "down"
      ? "Downward trend"
      : "Stable trend";

  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-semibold">Weight Tracker</h3>
        <div className="flex border rounded overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => handleUnitChange("lb")}
            className={`px-3 py-1 ${
              unit === "lb" ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
          >
            lb
          </button>
          <button
            type="button"
            onClick={() => handleUnitChange("kg")}
            className={`px-3 py-1 ${
              unit === "kg" ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
          >
            kg
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Weight ({unit})
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={weightValue}
            onChange={(event) => setWeightValue(event.target.value)}
            className="w-full border p-2 rounded"
            placeholder={`e.g. ${unit === "lb" ? "180" : "82"}`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={entryDate}
              onChange={(event) => setEntryDate(event.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              type="time"
              value={entryTime}
              onChange={(event) => setEntryTime(event.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging..." : "Log Weight"}
        </button>
      </form>

      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Weekly Summary
        </h4>
        {displayCurrentAverage === null ? (
          <div className="text-sm text-gray-500">
            Log a few entries to see weekly trends.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-lg font-semibold text-blue-600">
                {displayCurrentAverage.toFixed(1)} {unit}
              </div>
              <div className="text-xs text-gray-600">Current 7-day avg</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-lg font-semibold text-gray-700">
                {displayPreviousAverage !== null
                  ? `${displayPreviousAverage.toFixed(1)} ${unit}`
                  : "—"}
              </div>
              <div className="text-xs text-gray-600">Previous 7-day avg</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-lg font-semibold text-green-600">
                {displayDelta !== null
                  ? `${displayDelta > 0 ? "+" : ""}${displayDelta.toFixed(1)} ${
                      unit
                    }`
                  : "—"}
              </div>
              <div className="text-xs text-gray-600">{trendLabel}</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h4 className="text-sm font-medium text-gray-700">
            Daily Log
          </h4>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="border p-2 rounded text-sm"
          />
        </div>

        {entriesForSelectedDate.length === 0 ? (
          <div className="text-sm text-gray-500">
            No entries for this day yet.
          </div>
        ) : (
          <div className="space-y-2">
            {entriesForSelectedDate.map((entry) => {
              const entryTimeDisplay = new Date(entry.timestamp).toLocaleTimeString(
                undefined,
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );
              const entryWeight = fromKg(entry.weightKg, unit);

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between border rounded p-2 text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {entryWeight.toFixed(1)} {unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      Logged at {entryTimeDisplay}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteEntry(entry.timestamp)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightTracker;

