"use client";

import { Menu, Bell, Search, Shield, Crown } from "lucide-react";
import {
  CustomAvatar,
  CustomAvatarImage,
  CustomAvatarFallback,
} from "@/components/ui/CustomAvatar";
import { LogoutButton } from "@/features/auth";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ThemeToggle } from "@/features/theme";

export function Topbar({ onMenuClick }) {
  const { user, getRoleDisplayName, isAdmin, isSuperAdmin } = useAuth();

  return (
    <header className="h-14 sm:h-16 bg-card border-b border-border sticky top-0 z-30 shadow-sm transition-colors">
      <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-8">
        {/* Left side - Menu button for mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-accent rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Center - Search bar (hidden on small mobile) */}
        <div className="hidden sm:flex flex-1 max-w-2xl mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right side - Notifications and User menu */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search icon for mobile */}
          <button className="sm:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
            <Search className="h-5 w-5" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-accent"
          />

          {/* Notification Bell - hidden on mobile */}
          <button className="hidden sm:block relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {user && (
            <>
              {/* User Info & Avatar */}
              <div className="flex items-center gap-1 sm:gap-3 pl-2 border-l border-border">
                {/* User name and role - hidden on mobile */}
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-foreground">
                    {user.firstName || user.email}
                  </span>
                  <div className="flex items-center gap-1">
                    {isSuperAdmin() && <Crown className="h-3 w-3 text-yellow-500" />}
                    {isAdmin() && !isSuperAdmin() && <Shield className="h-3 w-3 text-purple-500" />}
                    <span className="text-xs text-muted-foreground">
                      {getRoleDisplayName()}
                    </span>
                  </div>
                </div>

                {/* User Avatar */}
                <CustomAvatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer ring-2 ring-border hover:ring-ring transition-all">
                  {user.avatar ? (
                    <CustomAvatarImage src={user.avatar} alt={user.firstName} />
                  ) : (
                    <CustomAvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs sm:text-sm font-semibold">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </CustomAvatarFallback>
                  )}
                </CustomAvatar>

                {/* Logout button - hidden on small mobile */}
                <LogoutButton
                  variant="ghost"
                  size="icon"
                  className="hidden sm:block text-muted-foreground hover:text-foreground hover:bg-accent"
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
