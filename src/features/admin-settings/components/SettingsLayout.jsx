"use client";

import { SettingsNavigation } from "./SettingsNavigation";

export function SettingsLayout({ children }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-full">
      {/* Side Navigation - Desktop */}
      <aside className="hidden lg:block flex-shrink-0">
        <SettingsNavigation />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto pt-28 sm:pt-28 lg:pt-0">
        {children}
      </main>

      {/* Mobile Navigation - Fixed at top (below topbar) */}
      <div className="lg:hidden fixed top-14 sm:top-16 left-0 right-0 bg-card border-b border-border z-40 shadow-sm h-auto">
        <div className="overflow-x-auto">
          <SettingsNavigation mobile />
        </div>
      </div>
    </div>
  );
}
