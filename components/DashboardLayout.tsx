"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import SettingsModal from "./SettingsModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onSettingsUpdate?: () => void;
}

export default function DashboardLayout({
  children,
  onSettingsUpdate,
}: DashboardLayoutProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingsSuccess = () => {
    setShowSettings(false);
    if (onSettingsUpdate) {
      onSettingsUpdate();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar onSettingsClick={() => setShowSettings(true)} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto ml-20 lg:ml-64 transition-all duration-300">
        {children}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onSuccess={handleSettingsSuccess}
          onCancel={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
