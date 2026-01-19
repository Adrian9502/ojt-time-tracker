"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import SettingsModal from "@/components/SettingsModal";
import { useTheme } from "@/components/ThemeProvider";

interface HeaderProps {
  onSettingsUpdate?: () => void;
}

export default function Header({ onSettingsUpdate }: HeaderProps) {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();

  if (!session?.user) return null;

  const handleSettingsSuccess = () => {
    setShowSettings(false);
    if (onSettingsUpdate) {
      onSettingsUpdate();
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              OJT Time Tracker
            </h1>
          </div>

          <div className="relative flex">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-colors"
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {session.user.name?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                {session.user.name}
              </span>
              <svg
                className="w-4 h-4 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-12 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session.user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}

            {showSettings && (
              <SettingsModal
                onSuccess={handleSettingsSuccess}
                onCancel={() => setShowSettings(false)}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
