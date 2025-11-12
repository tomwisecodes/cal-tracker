"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCalorieContext } from "../context/CalorieContext";
import { PooEntry, PooHealthStatus } from "../lib/types";

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

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
};

const PooDiary = () => {
  const { pooEntries, addPooEntry, deletePooEntry } = useCalorieContext();

  const [healthStatus, setHealthStatus] = useState<PooHealthStatus>("healthy");
  const [abdominalPain, setAbdominalPain] = useState(false);
  const [bladderPain, setBladderPain] = useState(false);
  const [notes, setNotes] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [entryTime, setEntryTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const now = new Date();
    const dateStr = formatDateForInput(now);
    const timeStr = formatTimeForInput(now);
    setEntryDate(dateStr);
    setEntryTime(timeStr);
    setSelectedDate(dateStr);
  }, []);

  const entriesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return pooEntries
      .filter((entry) => entry.timestamp.split("T")[0] === selectedDate)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [pooEntries, selectedDate]);

  const weekSummary = useMemo(() => {
    if (pooEntries.length === 0) {
      return {
        totalEntries: 0,
        healthyCount: 0,
        unhealthyCount: 0,
        abdominalPainCount: 0,
        bladderPainCount: 0,
      };
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekEntries = pooEntries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startOfWeek;
    });

    return {
      totalEntries: weekEntries.length,
      healthyCount: weekEntries.filter((e) => e.healthStatus === "healthy")
        .length,
      unhealthyCount: weekEntries.filter((e) => e.healthStatus === "unhealthy")
        .length,
      abdominalPainCount: weekEntries.filter((e) => e.abdominalPain).length,
      bladderPainCount: weekEntries.filter((e) => e.bladderPain).length,
    };
  }, [pooEntries]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!entryDate || !entryTime) return;

    const timestamp = new Date(`${entryDate}T${entryTime}`);
    if (Number.isNaN(timestamp.getTime())) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newEntry: PooEntry = {
        id: createId(),
        timestamp: timestamp.toISOString(),
        healthStatus,
        abdominalPain,
        bladderPain,
        notes: notes.trim() || undefined,
      };

      addPooEntry(newEntry);
      setNotes("");
      setAbdominalPain(false);
      setBladderPain(false);
      setHealthStatus("healthy");
      setSelectedDate(entryDate);
      setIsSubmitting(false);
    }, 0);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Delete this diary entry? This action cannot be undone.")) {
      deletePooEntry(id);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">💩 Poo Diary</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">Health Status</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setHealthStatus("healthy")}
              className={`flex-1 px-4 py-2 rounded border ${
                healthStatus === "healthy"
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white border-gray-300"
              }`}
            >
              ✅ Healthy
            </button>
            <button
              type="button"
              onClick={() => setHealthStatus("unhealthy")}
              className={`flex-1 px-4 py-2 rounded border ${
                healthStatus === "unhealthy"
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-white border-gray-300"
              }`}
            >
              ⚠️ Unhealthy
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={abdominalPain}
              onChange={(e) => setAbdominalPain(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Abdominal pain</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={bladderPain}
              onChange={(e) => setBladderPain(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Bladder pain</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border p-2 rounded resize-none h-20 text-sm"
            placeholder="Additional details..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              type="time"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Logging..." : "Log Entry"}
        </button>
      </form>

      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          7-Day Summary
        </h4>
        {weekSummary.totalEntries === 0 ? (
          <div className="text-sm text-gray-500">
            Log a few entries to see weekly trends.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-lg font-semibold text-blue-600">
                {weekSummary.totalEntries}
              </div>
              <div className="text-xs text-gray-600">Total entries</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-lg font-semibold text-green-600">
                {weekSummary.healthyCount}
              </div>
              <div className="text-xs text-gray-600">Healthy</div>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <div className="text-lg font-semibold text-red-600">
                {weekSummary.unhealthyCount}
              </div>
              <div className="text-xs text-gray-600">Unhealthy</div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="text-lg font-semibold text-orange-600">
                {weekSummary.abdominalPainCount}
              </div>
              <div className="text-xs text-gray-600">Abdominal pain</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-lg font-semibold text-purple-600">
                {weekSummary.bladderPainCount}
              </div>
              <div className="text-xs text-gray-600">Bladder pain</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h4 className="text-sm font-medium text-gray-700">Daily Log</h4>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
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
              const entryTimeDisplay = new Date(
                entry.timestamp
              ).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={entry.id}
                  className="border rounded p-3 text-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          entry.healthStatus === "healthy"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {entry.healthStatus === "healthy"
                          ? "✅ Healthy"
                          : "⚠️ Unhealthy"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {entryTimeDisplay}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Delete
                    </button>
                  </div>

                  {(entry.abdominalPain || entry.bladderPain) && (
                    <div className="flex flex-wrap gap-2">
                      {entry.abdominalPain && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                          Abdominal pain
                        </span>
                      )}
                      {entry.bladderPain && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          Bladder pain
                        </span>
                      )}
                    </div>
                  )}

                  {entry.notes && (
                    <div className="text-xs text-gray-600 italic">
                      {entry.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PooDiary;

