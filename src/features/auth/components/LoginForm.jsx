"use client";

import { useLogin } from "../hooks/useLogin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const { form, isLoading, onSubmit } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Enter your credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@rocky.com"
              error={errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              error={errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Demo credentials:</p>
        </div>
        <br />
        <p className="font-mono">Email: moatef@gmail.com </p>
        <p className="font-mono">Password: 123123</p>
      </CardContent>
    </Card>
  );
}
