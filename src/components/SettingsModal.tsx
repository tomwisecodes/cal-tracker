"use client";

import React, { useState, useEffect } from "react";
import { validateApiKey } from "../lib/openai";
import { useCalorieContext } from "../context/CalorieContext";

const LOCAL_STORAGE_KEY = "openai_api_key";

interface SettingsModalProps {
  show?: boolean;
  onClose?: () => void;
}

const SettingsModal = ({
  show: propShow,
  onClose,
}: SettingsModalProps = {}) => {
  const [apiKey, setApiKey] = useState("");
  const [tempApiKey, setTempApiKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"api" | "goals" | "data">("api");
  const [dailyGoal, setDailyGoal] = useState(2000);

  const { settings, updateSettings, entries, dailyTotals } =
    useCalorieContext();

  // Check if we should show the modal (either forced by no API key or opened manually)
  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem(LOCAL_STORAGE_KEY)
        : null;
    if (!stored) {
      setShowModal(true); // Force show if no API key
    } else {
      setApiKey(stored);
      setTempApiKey(stored);
      setShowModal(propShow || false); // Show based on prop
    }
  }, [propShow]);

  // Sync daily goal with settings
  useEffect(() => {
    if (settings.daily_goal) {
      setDailyGoal(settings.daily_goal);
    }
  }, [settings]);

  const handleSaveApiKey = () => {
    if (!validateApiKey(tempApiKey)) {
      setError("Invalid OpenAI API key format.");
      return;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, tempApiKey);
    setApiKey(tempApiKey);
    updateSettings({ openai_api_key: tempApiKey });
    setError("");

    // Close modal if this was the blocking one
    if (!propShow) {
      setShowModal(false);
    }
  };

  const handleSaveGoal = () => {
    updateSettings({ daily_goal: dailyGoal });
    setError("");
  };

  const handleExportData = () => {
    const data = {
      entries,
      dailyTotals,
      settings,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calorie-tracker-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (
      confirm("Are you sure you want to clear all data? This cannot be undone.")
    ) {
      localStorage.removeItem("calorie_entries");
      localStorage.removeItem("user_settings");
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  };

  const closeModal = () => {
    if (apiKey) {
      // Only allow close if API key exists
      setShowModal(false);
      onClose?.();
    }
  };

  if (!showModal) return null;

  const isBlocking = !apiKey; // Blocking if no API key exists

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white p-6 rounded shadow max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {isBlocking ? "Setup Required" : "Settings"}
          </h2>
          {!isBlocking && (
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex mb-4 border-b">
          <button
            onClick={() => setActiveTab("api")}
            className={`px-3 py-2 text-sm ${
              activeTab === "api"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            API Key
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className={`px-3 py-2 text-sm ${
              activeTab === "goals"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`px-3 py-2 text-sm ${
              activeTab === "data"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            Data
          </button>
        </div>

        {/* API Key Tab */}
        {activeTab === "api" && (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Enter your OpenAI API key to enable food analysis
            </p>
            <input
              type="password"
              className="w-full border p-2 rounded mb-2"
              placeholder="sk-..."
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
            />
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-2"
              onClick={handleSaveApiKey}
            >
              Save API Key
            </button>
            <div className="text-xs text-gray-500">
              Your key is only stored in your browser and never shared.
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === "goals" && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Daily Calorie Goal
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                min="1000"
                max="5000"
              />
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              onClick={handleSaveGoal}
            >
              Save Goal
            </button>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === "data" && (
          <div className="space-y-3">
            <div>
              <h3 className="font-medium mb-2">Export Data</h3>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded w-full"
                onClick={handleExportData}
              >
                Download JSON Export
              </button>
            </div>

            <div>
              <h3 className="font-medium mb-2 text-red-600">Danger Zone</h3>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded w-full"
                onClick={handleClearData}
              >
                Clear All Data
              </button>
              <div className="text-xs text-gray-500 mt-1">
                This will delete all entries, settings, and your API key.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
