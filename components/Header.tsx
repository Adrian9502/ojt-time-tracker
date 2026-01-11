"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SettingsModal from "@/components/SettingsModal";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!session?.user) return null;

  // show setting modal
  const handleSettingsSuccess = () => {
    setShowSettings(false);
    // Refresh the page to reload data with new settings
    router.refresh();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              OJT Time Tracker
            </h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-2 transition-colors"
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
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {session.user.name}
              </span>
              <svg
                className="w-4 h-4 text-gray-600"
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-200">
                  {/* current user name */}
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.user.email}
                    </p>
                  </div>
                  {/* settings button */}
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-slate-50 transition-colors"
                  >
                    Settings
                  </button>
                  {/* sign out button */}
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
