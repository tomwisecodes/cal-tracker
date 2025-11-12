"use client";

import React from "react";
import { useCalorieContext } from "../context/CalorieContext";

const TodaysSummary = () => {
  const { getTodaysTotal, getTodaysMacros, settings } = useCalorieContext();

  const totalCalories = getTodaysTotal();
  const macros = getTodaysMacros();
  const dailyGoal = settings.daily_goal || 2000;
  const progress = Math.min((totalCalories / dailyGoal) * 100, 100);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <div className="text-lg font-bold mb-2">{formatDate(new Date())}</div>

      {/* Calories */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold">{totalCalories} kcal</span>
          <span className="text-gray-500">{dailyGoal} goal</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full">
          <div
            className="h-3 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {dailyGoal - totalCalories > 0
            ? `${dailyGoal - totalCalories} kcal remaining`
            : "Goal reached!"}
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-red-50 p-3 rounded">
          <div className="text-lg font-semibold text-red-600">
            {Math.round(macros.protein)}g
          </div>
          <div className="text-xs text-gray-600">Protein</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <div className="text-lg font-semibold text-yellow-600">
            {Math.round(macros.carbs)}g
          </div>
          <div className="text-xs text-gray-600">Carbs</div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-lg font-semibold text-green-600">
            {Math.round(macros.fat)}g
          </div>
          <div className="text-xs text-gray-600">Fat</div>
        </div>
      </div>
    </div>
  );
};

export default TodaysSummary;
