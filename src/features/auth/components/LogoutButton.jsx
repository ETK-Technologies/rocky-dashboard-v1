"use client";

import { useState } from "react";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomConfirmationDialog } from "@/components/ui/CustomConfirmationDialog";
import { useLogout } from "@/features/auth";
import { LogOut } from "lucide-react";

/**
 * Logout button component with confirmation dialog
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant
 * @param {string} props.size - Button size
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showIcon - Whether to show logout icon
 * @param {string} props.children - Button content
 */
export function LogoutButton({
    variant = "outline",
    size = "default",
    className = "",
    showIcon = true,
    children = "Logout",
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { logout } = useLogout();

    const handleLogoutClick = () => {
        setIsDialogOpen(true);
    };

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error("Logout error:", error);
            // Error handling is done in the logout hook
        } finally {
            setIsLoggingOut(false);
            setIsDialogOpen(false);
        }
    };

    const handleCancelLogout = () => {
        setIsDialogOpen(false);
    };

    return (
        <>
            <CustomButton
                variant={variant}
                size={size}
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
                className={className}
                title="Logout"
            >
                {showIcon && (
                    <LogOut
                        className={
                            size === "icon"
                                ? "h-4 w-4"
                                : "mr-2 h-4 w-4"
                        }
                    />
                )}
                {size !== "icon" && (isLoggingOut ? "Logging out..." : children)}
            </CustomButton>

            <CustomConfirmationDialog
                isOpen={isDialogOpen}
                onClose={handleCancelLogout}
                onConfirm={handleConfirmLogout}
                title="Confirm Logout"
                description="Are you sure you want to logout? You will need to sign in again to access your account."
                confirmText="Yes, Logout"
                cancelText="Cancel"
                isLoading={isLoggingOut}
                variant="warning"
            />
        </>
    );
}
