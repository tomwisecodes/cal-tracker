"use client";

import React from "react";
import { useCalorieContext } from "../context/CalorieContext";

const StatsChart = () => {
  const { getWeeklyTotals } = useCalorieContext();
  const weeklyData = getWeeklyTotals();

  const maxCalories = Math.max(...weeklyData.map((day) => day.calories), 1);

  const formatDay = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <h3 className="text-lg font-semibold mb-4">7-Day Overview</h3>

      {/* Calorie Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 text-gray-700">
          Daily Calories
        </h4>
        <div className="flex items-end justify-between h-32 gap-1">
          {weeklyData.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div
                className="bg-blue-500 w-full rounded-t transition-all duration-300"
                style={{
                  height: `${(day.calories / maxCalories) * 100}%`,
                  minHeight: day.calories > 0 ? "4px" : "0px",
                }}
              ></div>
              <div className="text-xs mt-2 text-center">
                <div className="font-medium">{formatDay(day.date)}</div>
                <div className="text-gray-500">{day.calories}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-lg font-semibold text-blue-600">
            {Math.round(
              weeklyData.reduce((sum, day) => sum + day.calories, 0) / 7
            )}
          </div>
          <div className="text-xs text-gray-600">Avg Daily Calories</div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-lg font-semibold text-green-600">
            {weeklyData.reduce((sum, day) => sum + day.entries, 0)}
          </div>
          <div className="text-xs text-gray-600">Total Entries</div>
        </div>
      </div>

      {/* Macro Summary for the Week */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2 text-gray-700">
          Weekly Macros
        </h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-red-50 p-2 rounded">
            <div className="text-sm font-semibold text-red-600">
              {Math.round(
                weeklyData.reduce((sum, day) => sum + day.protein, 0)
              )}
              g
            </div>
            <div className="text-xs text-gray-600">Protein</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded">
            <div className="text-sm font-semibold text-yellow-600">
              {Math.round(weeklyData.reduce((sum, day) => sum + day.carbs, 0))}g
            </div>
            <div className="text-xs text-gray-600">Carbs</div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="text-sm font-semibold text-green-600">
              {Math.round(weeklyData.reduce((sum, day) => sum + day.fat, 0))}g
            </div>
            <div className="text-xs text-gray-600">Fat</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsChart;
