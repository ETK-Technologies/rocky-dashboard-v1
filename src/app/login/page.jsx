import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth";

/**
 * Login page - Server-side component
 * Handles authentication redirects and renders login form
 */
export default function LoginPage() {
  // Note: Server-side auth check would go here
  // For now, we'll handle redirects client-side in the LoginForm

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
