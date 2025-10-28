"use client";

import { Menu, User } from "lucide-react";
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
        {/* Left side - Menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Center - Title or breadcrumbs can go here */}
        <div className="flex-1" />

        {/* Right side - User menu */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              {/* User info */}
              <div className="hidden sm:flex items-center gap-2 text-right">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              {/* User avatar */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white cursor-pointer hover:opacity-90 transition-opacity">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                {/* Online status dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>

              {/* Logout button */}
              <LogoutButton
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                showIcon={true}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
