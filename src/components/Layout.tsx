"use client";

import React, { useState } from "react";
import SettingsModal from "./SettingsModal";

type TabType = "calories" | "weight" | "poo" | "settings";

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

const Layout = ({ children, activeTab = "calories", onTabChange }: LayoutProps) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleTabClick = (tab: TabType) => {
    if (tab === "settings") {
      setShowSettings(true);
    } else {
      onTabChange?.(tab);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="flex items-center justify-center p-4 bg-white shadow sticky top-0 z-10">
        <h1 className="text-xl font-bold">Health Tracker</h1>
      </header>
      
      <main className="max-w-xl mx-auto p-4 pb-6">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
        <div className="max-w-xl mx-auto grid grid-cols-4 h-16">
          <button
            onClick={() => handleTabClick("calories")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "calories"
                ? "text-blue-500"
                : "text-gray-600"
            }`}
          >
            <span className="text-xl">🍽️</span>
            <span className="text-xs font-medium">Calories</span>
          </button>
          
          <button
            onClick={() => handleTabClick("weight")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "weight"
                ? "text-blue-500"
                : "text-gray-600"
            }`}
          >
            <span className="text-xl">⚖️</span>
            <span className="text-xs font-medium">Weight</span>
          </button>
          
          <button
            onClick={() => handleTabClick("poo")}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeTab === "poo"
                ? "text-blue-500"
                : "text-gray-600"
            }`}
          >
            <span className="text-xl">💩</span>
            <span className="text-xs font-medium">Poo</span>
          </button>
          
          <button
            onClick={() => handleTabClick("settings")}
            className="flex flex-col items-center justify-center gap-1 text-gray-600"
          >
            <span className="text-xl">⚙️</span>
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>

      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default Layout;
