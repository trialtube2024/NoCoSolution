import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";

// Form validation schema
const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Extract token from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const resetToken = queryParams.get("token");
    setToken(resetToken);
    
    // Verify token validity
    if (resetToken) {
      verifyToken(resetToken);
    } else {
      setIsVerifyingToken(false);
      setError("No reset token provided");
    }
  }, []);

  // Verify token with the server
  const verifyToken = async (resetToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-reset-token?token=${resetToken}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid or expired token");
      }
      
      setIsTokenValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired token");
      setIsTokenValid(false);
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setError("No reset token available");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error resetting password");
      }
      
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while resetting your password");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while verifying token
  if (isVerifyingToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Verifying Reset Link</CardTitle>
            <CardDescription className="text-center">
              Please wait while we verify your password reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSuccess ? "Password Reset Successfully" : "Reset Your Password"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSuccess ? 
              "Your password has been reset successfully" : 
              isTokenValid ? "Enter your new password below" : "There was a problem with your reset link"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-center text-gray-600">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
            </div>
          ) : isTokenValid ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          ) : (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error || "The password reset link is invalid or has expired. Please request a new password reset link."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            <Button
              variant="link"
              className="px-0"
              onClick={() => setLocation("/auth/login")}
            >
              {isSuccess ? "Go to login" : "Back to login"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}