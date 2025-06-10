import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type PasswordForm = z.infer<typeof passwordSchema>;

interface HoldingPageProps {
  onAuthenticated: () => void;
}

export default function HoldingPage({ onAuthenticated }: HoldingPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (data: PasswordForm) => {
    // Simple password check - you can change this password
    const correctPassword = "dev2025"; // Change this to your desired password
    
    if (data.password === correctPassword) {
      // Store authentication in sessionStorage
      sessionStorage.setItem("dev_authenticated", "true");
      onAuthenticated();
      setError(null);
    } else {
      setError("Incorrect password. Please try again.");
      form.reset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Development Access
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Context-Aware Fact Checking Platform
            </p>
          </div>
        </div>

        {/* Authentication Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center">
              <Lock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <CardTitle className="text-xl">Protected Development Environment</CardTitle>
            <CardDescription>
              This application is currently in development. Please enter the access password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Access Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter development password"
                    {...form.register("password")}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <Button type="submit" className="w-full" size="lg">
                Access Development Environment
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>This is a password-protected development environment.</p>
          <p className="mt-1">Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
}