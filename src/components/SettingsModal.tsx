"use client";

import React, { useState, useEffect } from "react";
import { validateApiKey } from "../lib/openai";

const LOCAL_STORAGE_KEY = "openai_api_key";

const SettingsModal = () => {
  const [apiKey, setApiKey] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem(LOCAL_STORAGE_KEY)
        : null;
    if (!stored) {
      setShow(true);
    } else {
      setApiKey(stored);
      setShow(false);
    }
  }, []);

  const handleSave = () => {
    if (!validateApiKey(apiKey)) {
      setError("Invalid OpenAI API key format.");
      return;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, apiKey);
    setShow(false);
    setError("");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white p-6 rounded shadow max-w-sm w-full">
        <h2 className="text-lg font-bold mb-2">Enter your OpenAI API Key</h2>
        <input
          type="password"
          className="w-full border p-2 rounded mb-2"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          onClick={handleSave}
        >
          Save Key
        </button>
        <div className="text-xs text-gray-500 mt-2">
          Your key is only stored in your browser.
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
