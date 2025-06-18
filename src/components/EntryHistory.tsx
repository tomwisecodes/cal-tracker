"use client";

import React, { useState } from "react";
import { useCalorieContext } from "../context/CalorieContext";
import { CalorieEntry } from "../lib/types";

const EntryHistory = () => {
  const { entries, deleteEntry } = useCalorieContext();
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const toggleExpanded = (entryId: string) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId);
  };

  const handleDelete = (entryId: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteEntry(entryId);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Recent Entries</h3>
        <div className="text-gray-500 text-center py-8">
          No entries yet. Add your first meal above!
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>

      <div className="space-y-3">
        {entries.slice(0, 10).map((entry: CalorieEntry) => (
          <div key={entry.id} className="border rounded p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">
                    {formatDate(entry.timestamp)} •{" "}
                    {formatTime(entry.timestamp)}
                  </span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>

                <div className="text-gray-800 mb-2">{entry.input}</div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm">
                    <span className="font-semibold">
                      {entry.total_calories} kcal
                    </span>
                    <span className="text-red-600">
                      P: {Math.round(entry.total_protein)}g
                    </span>
                    <span className="text-yellow-600">
                      C: {Math.round(entry.total_carbs)}g
                    </span>
                    <span className="text-green-600">
                      F: {Math.round(entry.total_fat)}g
                    </span>
                  </div>

                  <button
                    onClick={() => toggleExpanded(entry.id)}
                    className="text-blue-500 text-sm hover:text-blue-700"
                  >
                    {expandedEntry === entry.id ? "Less" : "More"}
                  </button>
                </div>
              </div>
            </div>

            {expandedEntry === entry.id && (
              <div className="mt-3 pt-3 border-t">
                {/* Reasoning */}
                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-1">AI Reasoning:</h4>
                  <p className="text-sm text-gray-600">{entry.reasoning}</p>
                </div>

                {/* Food Items Breakdown */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Food Breakdown:</h4>
                  <div className="space-y-2">
                    {entry.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-2 rounded text-sm"
                      >
                        <div className="font-medium">
                          {item.food} ({item.quantity})
                        </div>
                        <div className="text-gray-600">
                          {item.calories} kcal • P: {Math.round(item.protein)}g
                          • C: {Math.round(item.carbs)}g • F:{" "}
                          {Math.round(item.fat)}g
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Confidence: {entry.confidence}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntryHistory;
