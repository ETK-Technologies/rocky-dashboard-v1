"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/utils/cn";

const CardContext = createContext(null);

function useCardContext() {
    return useContext(CardContext);
}

export function CustomCard({
    children,
    className,
    collapsible = false,
    defaultCollapsed = false,
    collapsed: collapsedProp,
    onToggle,
    ...props
}) {
    const isControlled = collapsible && collapsedProp !== undefined;

    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);

    const setCollapsed = useCallback(
        (value) => {
            if (!collapsible) {
                return;
            }

            if (isControlled) {
                const nextValue =
                    typeof value === "function" ? value(Boolean(collapsedProp)) : value;
                const next = Boolean(nextValue);
                onToggle?.(next);
                return;
            }

            setInternalCollapsed((prev) => {
                const resolved =
                    typeof value === "function" ? value(Boolean(prev)) : value;
                const next = Boolean(resolved);
                onToggle?.(next);
                return next;
            });
        },
        [collapsible, isControlled, collapsedProp, onToggle]
    );

    const toggleCollapsed = useCallback(() => {
        setCollapsed((prev) => !prev);
    }, [setCollapsed]);

    const effectiveCollapsed = useMemo(() => {
        if (!collapsible) {
            return false;
        }

        if (isControlled) {
            return Boolean(collapsedProp);
        }

        return Boolean(internalCollapsed);
    }, [collapsible, isControlled, collapsedProp, internalCollapsed]);

    const contextValue = useMemo(
        () => ({
            collapsible,
            collapsed: effectiveCollapsed,
            setCollapsed,
            toggleCollapsed,
        }),
        [collapsible, effectiveCollapsed, setCollapsed, toggleCollapsed]
    );

    return (
        <CardContext.Provider value={contextValue}>
            <div
                className={cn(
                    "rounded-lg border bg-card text-card-foreground shadow-sm transition-colors",
                    collapsible && "data-[state=collapsed]:border-muted",
                    className
                )}
                data-state={
                    collapsible
                        ? effectiveCollapsed
                            ? "collapsed"
                            : "expanded"
                        : undefined
                }
                {...props}
            >
                {children}
            </div>
        </CardContext.Provider>
    );
}

export function CustomCardHeader({
    children,
    className,
    disableToggle = false,
    showIndicator = false,
    onClick,
    onKeyDown,
    role,
    tabIndex,
    ...props
}) {
    const cardContext = useCardContext();
    const isCollapsible = cardContext?.collapsible && !disableToggle;

    const handleToggle = useCallback(
        (event) => {
            onClick?.(event);
            if (event.defaultPrevented) {
                return;
            }

            if (!isCollapsible) {
                return;
            }

            const target = event.target;
            if (
                target instanceof HTMLElement &&
                target.closest(
                    'button, a, input, select, textarea, [data-card-toggle="false"], [data-card-toggle-ignore="true"]'
                )
            ) {
                return;
            }

            cardContext?.toggleCollapsed();
        },
        [cardContext, isCollapsible, onClick]
    );

    const handleKeyDown = useCallback(
        (event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || !isCollapsible) {
                return;
            }

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                cardContext?.toggleCollapsed();
            }
        },
        [cardContext, isCollapsible, onKeyDown]
    );

    const clickableProps = isCollapsible
        ? {
              role: role ?? "button",
              tabIndex: tabIndex ?? 0,
              "aria-expanded": !(cardContext?.collapsed ?? false),
          }
        : {
              role,
              tabIndex,
          };

    return (
        <div
            className={cn(
                "flex flex-col space-y-1.5 p-6",
                isCollapsible && "cursor-pointer select-none",
                className
            )}
            data-state={cardContext?.collapsed ? "collapsed" : "expanded"}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            {...clickableProps}
            {...props}
        >
            {children}
            {isCollapsible && showIndicator && (
                <span
                    aria-hidden="true"
                    className={cn(
                        "ml-auto flex h-5 w-5 items-center justify-center text-muted-foreground transition-transform",
                        cardContext?.collapsed && "-rotate-90"
                    )}
                >
                    <ChevronDown className="h-4 w-4" />
                </span>
            )}
        </div>
    );
}

export function CustomCardTitle({ children, className, ...props }) {
    return (
        <h3
            className={cn(
                "text-2xl font-semibold leading-none tracking-tight",
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CustomCardDescription({ children, className, ...props }) {
    return (
        <p className={cn("text-sm text-muted-foreground", className)} {...props}>
            {children}
        </p>
    );
}

export function CustomCardContent({
    children,
    className,
    forceMount = false,
    ...props
}) {
    const cardContext = useCardContext();
    const isCollapsed = cardContext?.collapsible && cardContext?.collapsed;

    if (isCollapsed && !forceMount) {
        return null;
    }

    return (
        <div
            className={cn(
                "p-6 pt-0",
                isCollapsed && forceMount && "hidden",
                className
            )}
            data-state={isCollapsed ? "collapsed" : "expanded"}
            aria-hidden={isCollapsed}
            {...props}
        >
            {children}
        </div>
    );
}

export function CustomCardFooter({
    children,
    className,
    forceMount = false,
    ...props
}) {
    const cardContext = useCardContext();
    const isCollapsed = cardContext?.collapsible && cardContext?.collapsed;

    if (isCollapsed && !forceMount) {
        return null;
    }

    return (
        <div
            className={cn(
                "flex items-center p-6 pt-0",
                isCollapsed && forceMount && "hidden",
                className
            )}
            data-state={isCollapsed ? "collapsed" : "expanded"}
            aria-hidden={isCollapsed}
            {...props}
        >
            {children}
        </div>
    );
}
