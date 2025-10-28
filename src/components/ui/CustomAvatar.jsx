"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

const CustomAvatar = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
        )}
        {...props}
    />
));
CustomAvatar.displayName = "CustomAvatar";

const CustomAvatarImage = React.forwardRef(({ className, ...props }, ref) => (
    <img
        ref={ref}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
    />
));
CustomAvatarImage.displayName = "CustomAvatarImage";

const CustomAvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium",
            className
        )}
        {...props}
    />
));
CustomAvatarFallback.displayName = "CustomAvatarFallback";

export { CustomAvatar, CustomAvatarImage, CustomAvatarFallback };
