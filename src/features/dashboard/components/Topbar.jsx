"use client";

import { Menu, Bell, Search } from "lucide-react";
import { CustomAvatar, CustomAvatarImage, CustomAvatarFallback } from "@/components/ui/CustomAvatar";
import { LogoutButton } from "@/features/auth";
import { authStorage } from "@/features/auth";
import { useState, useEffect } from "react";

export function Topbar({ onMenuClick }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = authStorage.getUser();
    setUser(userData);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left side - Menu button for mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-50 rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Center - Search bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Right side - Notifications and User menu */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {user && (
            <>
              {/* User Avatar with dropdown indicator */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <CustomAvatar className="h-9 w-9 cursor-pointer ring-2 ring-gray-100 hover:ring-gray-200 transition-all">
                  {user.avatar ? (
                    <CustomAvatarImage src={user.avatar} alt={user.firstName} />
                  ) : (
                    <CustomAvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </CustomAvatarFallback>
                  )}
                </CustomAvatar>

                {/* Logout button */}
                <LogoutButton
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  showIcon={true}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
