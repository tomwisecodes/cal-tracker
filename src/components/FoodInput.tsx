"use client";

import React, { useState, useRef } from "react";
import { useCalorieContext } from "../context/CalorieContext";
import { analyzeFood } from "../lib/openai";

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

const FoodInput = () => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const { addEntry } = useCalorieContext();

  const startListening = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      // Auto-submit after voice input
      handleSubmit(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSubmit = async (text = input) => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const apiKey = localStorage.getItem("openai_api_key");
      if (!apiKey) {
        throw new Error("OpenAI API key not found");
      }

      const entry = await analyzeFood(text, apiKey);
      addEntry(entry);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze food");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <div className="flex gap-2 mb-2">
        <textarea
          placeholder="Describe your meal..."
          className="w-full p-2 border rounded resize-none h-20"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-4 py-2 rounded text-white ${
            isListening ? "bg-red-500" : "bg-green-500"
          }`}
          disabled={isLoading}
        >
          {isListening ? "🔴" : "🎤"}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      <button
        onClick={() => handleSubmit()}
        disabled={!input.trim() || isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full disabled:bg-gray-300"
      >
        {isLoading ? "Analyzing..." : "Add Entry"}
      </button>

      {isListening && (
        <div className="text-center text-gray-500 mt-2">
          Listening... Speak now!
        </div>
      )}
    </div>
  );
};

export default FoodInput;
