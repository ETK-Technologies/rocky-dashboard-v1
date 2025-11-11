"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

/**
 * Tooltip component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Trigger element
 * @param {string} props.content - Tooltip content
 * @param {string} props.side - Tooltip position (top, bottom, left, right)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.usePortal - Whether to render tooltip in a portal (useful for overflow containers)
 */
export function Tooltip({
  children,
  content,
  side = "top",
  className,
  usePortal = false,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (isVisible && usePortal && triggerRef.current) {
      const updatePosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();

        let top = 0;
        let left = 0;

        switch (side) {
          case "top":
            // Position above the trigger, centered
            top = rect.top - 8;
            left = rect.left + rect.width / 2;
            break;
          case "bottom":
            // Position below the trigger, centered
            top = rect.bottom + 8;
            left = rect.left + rect.width / 2;
            break;
          case "left":
            // Position to the left of the trigger, centered vertically
            top = rect.top + rect.height / 2;
            left = rect.left - 8;
            break;
          case "right":
            // Position to the right of the trigger, centered vertically
            top = rect.top + rect.height / 2;
            left = rect.right + 8;
            break;
        }

        setPosition({ top, left });
      };

      // Initial position
      updatePosition();

      // Update position after tooltip renders to get its dimensions
      const timeoutId = setTimeout(updatePosition, 0);

      // Update on scroll and resize
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isVisible, usePortal, side]);

  if (!content) return children;

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const portalSideClasses = {
    top: "-translate-x-1/2 -translate-y-full -mb-2",
    bottom: "-translate-x-1/2 mt-2",
    left: "-translate-x-full -translate-y-1/2 -mr-2",
    right: "-translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-popover",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-popover",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-popover",
    right:
      "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-popover",
  };

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className={cn(
        usePortal
          ? "fixed z-[9999] pointer-events-none"
          : "absolute z-50 pointer-events-none",
        usePortal ? portalSideClasses[side] : sideClasses[side]
      )}
      style={
        usePortal
          ? { top: `${position.top}px`, left: `${position.left}px` }
          : {}
      }
    >
      <div
        className={cn(
          "px-3 py-2 text-xs font-medium bg-popover text-popover-foreground border border-border rounded-lg shadow-lg max-w-xs whitespace-normal break-words",
          className
        )}
      >
        {content}
        <div className={cn("absolute w-0 h-0 border-4", arrowClasses[side])} />
      </div>
    </div>
  );

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {isVisible &&
        (usePortal && typeof window !== "undefined"
          ? createPortal(tooltipContent, document.body)
          : tooltipContent)}
    </div>
  );
}
