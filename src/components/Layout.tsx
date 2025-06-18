import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 bg-white shadow">
        <h1 className="text-xl font-bold">Calorie Tracker</h1>
        {/* Settings button (to be implemented) */}
        <button className="bg-gray-200 px-3 py-1 rounded">Settings</button>
      </header>
      <main className="max-w-xl mx-auto p-4">{children}</main>
    </div>
  );
};

export default Layout;
