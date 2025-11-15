"use client";

import { useState, createContext, useContext } from "react";
import { cn } from "@/utils/cn";

const TabsContext = createContext({
  activeTab: "",
  setActiveTab: () => {},
  variant: "default",
  disableScroll: false,
});

export function Tabs({
  children,
  defaultValue,
  value,
  onValueChange,
  className,
  variant = "default",
  disableScroll = false,
}) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultValue || ""
  );

  // Use controlled value if provided, otherwise use internal state
  const activeTab = value !== undefined ? value : internalActiveTab;
  const setActiveTab = (newValue) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalActiveTab(newValue);
    }
  };

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab, variant, disableScroll }}
    >
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className, orientation = "horizontal" }) {
  const { variant } = useContext(TabsContext);

  return (
    <div
      className={cn(
        "inline-flex",
        orientation === "vertical" && "flex-col",
        orientation === "horizontal" && "flex-row",
        variant === "default" &&
          orientation === "horizontal" &&
          "h-10 items-center justify-start rounded-md bg-muted p-1",
        variant === "default" &&
          orientation === "vertical" &&
          "min-w-[200px] w-full",
        variant === "pills" && orientation === "horizontal" && "gap-2",
        variant === "pills" && orientation === "vertical" && "gap-2 flex-col",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className, icon: Icon }) {
  const { activeTab, setActiveTab, variant, disableScroll } =
    useContext(TabsContext);
  const isActive = activeTab === value;

  const handleClick = () => {
    setActiveTab(value);
    // Scroll to top of the page when tab is clicked (unless disabled)
    if (!disableScroll) {
      // The dashboard uses a <main> element with overflow-auto as the scrollable container
      setTimeout(() => {
        // First try to find and scroll the main element (dashboard scroll container)
        const mainElement = document.querySelector("main");

        if (mainElement) {
          // Scroll the main element to top - this is the actual scrollable container
          mainElement.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          // Fallback to window scroll if main element not found
          window.scrollTo({ top: 0, behavior: "smooth" });
          document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
          document.body.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "rounded-md px-3 py-2 text-left justify-start w-full",
        variant === "default" &&
          isActive &&
          "bg-primary/10 text-primary border-l-2 border-primary",
        variant === "default" &&
          !isActive &&
          "text-muted-foreground hover:bg-muted hover:text-foreground",
        variant === "pills" && "rounded-full px-4 py-2",
        variant === "pills" && isActive && "bg-primary text-primary-foreground",
        variant === "pills" &&
          !isActive &&
          "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
  alwaysRender = false,
}) {
  const { activeTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  // For components that need refs (like editors), always render but hide with CSS
  // For other content, we can return null for better performance
  if (!alwaysRender && !isActive) {
    return null;
  }

  return (
    <div
      className={cn(
        "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        !isActive && alwaysRender && "hidden", // Hide but keep in DOM if alwaysRender is true
        className
      )}
    >
      {children}
    </div>
  );
}
