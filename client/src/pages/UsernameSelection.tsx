import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, UserCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function UsernameSelection() {
  const [username, setUsername] = useState("");
  const [, setLocation] = useLocation();
  const { user, refresh } = useAuth();
  const updateNameMutation = trpc.auth.updateName.useMutation({
    onSuccess: async () => {
      console.log("Username updated successfully");
      await refresh();
      // Use a direct redirect if setLocation is too slow or causing issues
      window.location.href = "/role-select";
    },
    onError: (error) => {
      console.error("Failed to update username:", error);
    }
  });

  // Redirect if user already has a name
  useEffect(() => {
    if (user && user.name && user.name !== "Mock User") {
      setLocation("/role-select");
    }
  }, [user, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting username:", username);
    if (username.trim()) {
      updateNameMutation.mutate({ name: username.trim() });
    }
  };

  // If we already have a custom name, don't show this page
  if (user && user.name && user.name !== "Mock User") {
    console.log("User already has a name, redirecting to role-select from UsernameSelection");
    setLocation("/role-select");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-full">
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-gray-600">Let's set up your profile</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Choose your username</CardTitle>
            <CardDescription>This is how other players will see you in games.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <UserCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Enter username"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={updateNameMutation.isPending || !username.trim()}
              >
                {updateNameMutation.isPending ? "Setting up..." : "Start Playing"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
