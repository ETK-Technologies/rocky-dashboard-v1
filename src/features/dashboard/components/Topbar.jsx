"use client";

import { Menu, Bell, Search, Shield, Crown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CustomAvatar,
  CustomAvatarImage,
  CustomAvatarFallback,
} from "@/components/ui/CustomAvatar";
import { LogoutButton } from "@/features/auth";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ThemeToggle } from "@/features/theme";
import { useSearch } from "@/features/search";
import { CacheActionsDropdown } from "@/features/cache";

export function Topbar({ onMenuClick }) {
  const { user, getRoleDisplayName, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const { results, loading, search, clearSearch } = useSearch();

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search input change
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length >= 2) {
      setShowResults(true);
      await search({ q: query, limit: 5 });
    } else {
      setShowResults(false);
      clearSearch();
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/dashboard/products?search=${encodeURIComponent(searchQuery.trim())}`
      );
      setShowResults(false);
      setSearchQuery("");
      setShowMobileSearch(false);
    }
  };

  // Handle result click
  const handleResultClick = (productId) => {
    router.push(`/dashboard/products/${productId}/edit`);
    setShowResults(false);
    setSearchQuery("");
    setShowMobileSearch(false);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    clearSearch();
    searchInputRef.current?.focus();
  };

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
          <form
            ref={searchContainerRef}
            onSubmit={handleSearchSubmit}
            className="relative w-full"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() =>
                searchQuery.trim().length >= 2 && setShowResults(true)
              }
              placeholder="Search products..."
              className="w-full pl-10 pr-10 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {showResults && (results.length > 0 || loading) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : results.length > 0 ? (
                  <>
                    <div className="p-2 border-b border-border">
                      <div className="text-xs font-medium text-muted-foreground">
                        {results.length} result{results.length !== 1 ? "s" : ""}{" "}
                        found
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {results.slice(0, 5).map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleResultClick(product.id)}
                          className="w-full p-3 text-left hover:bg-accent transition-colors"
                        >
                          <div className="font-medium text-sm text-foreground">
                            {product.name}
                          </div>
                          {product.sku && (
                            <div className="text-xs text-muted-foreground mt-1">
                              SKU: {product.sku}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {results.length > 5 && (
                      <div className="p-2 border-t border-border">
                        <button
                          type="submit"
                          className="w-full text-xs text-center text-primary hover:underline"
                        >
                          View all results
                        </button>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </form>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="absolute top-full left-0 right-0 p-3 bg-card border-b border-border sm:hidden z-50">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMobileSearch(false);
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </form>

            {/* Mobile Search Results */}
            {showResults && (results.length > 0 || loading) && (
              <div className="mt-2 max-h-64 overflow-y-auto bg-secondary rounded-lg border border-border">
                {loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : results.length > 0 ? (
                  <div className="divide-y divide-border">
                    {results.slice(0, 5).map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleResultClick(product.id)}
                        className="w-full p-3 text-left hover:bg-accent transition-colors"
                      >
                        <div className="font-medium text-sm text-foreground">
                          {product.name}
                        </div>
                        {product.sku && (
                          <div className="text-xs text-muted-foreground mt-1">
                            SKU: {product.sku}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Right side - Notifications and User menu */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search icon for mobile */}
          <button
            onClick={() => {
              setShowMobileSearch(true);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            className="sm:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Cache management - super admins only */}
          {isSuperAdmin() && <CacheActionsDropdown />}

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
                    {isSuperAdmin() && (
                      <Crown className="h-3 w-3 text-yellow-500" />
                    )}
                    {isAdmin() && !isSuperAdmin() && (
                      <Shield className="h-3 w-3 text-purple-500" />
                    )}
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
                    <CustomAvatarFallback className="bg-gradient-to-br from-[#af7f56] to-[#9d6f46] text-white text-xs sm:text-sm font-semibold">
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
