"use client";

import { FileQuestion } from "lucide-react";

export function CustomEmptyState({
    icon: Icon = FileQuestion,
    title = "No data found",
    description = "Get started by creating your first item.",
    action,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="rounded-full bg-muted p-6 mb-4">
                <Icon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                {description}
            </p>
            {action && <div>{action}</div>}
        </div>
    );
}
