"use client";

import { cn } from "@/utils/cn";

export function MainWrapper({ children, className }) {
  return (
    <main className={cn("flex-1 overflow-auto bg-[#F5F6F8]", className)}>
      <div className="container mx-auto p-4 lg:p-6">{children}</div>
    </main>
  );
}
