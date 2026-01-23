import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Login() {
  const { refresh } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const updateNameMutation = trpc.auth.updateName.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success("Welcome, " + name + "!");
      setLocation("/role-select");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save username");
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a username");
      return;
    }
    updateNameMutation.mutate({ name: name.trim() });
  };

  return (
    <div className="min-h-screen bg-[#46178f] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-black text-white mb-4 tracking-tighter italic">K-Quiz</h1>
          <p className="text-2xl font-bold text-white/80">Enter your nickname</p>
        </div>
        
        <Card className="kahoot-card overflow-hidden">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-black text-[#333]">SIGN IN</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                placeholder="USERNAME"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                className="text-2xl font-black text-center h-16 rounded-xl border-2 border-gray-200 focus:border-[#46178f] focus:ring-0 uppercase text-black"
                maxLength={15}
                autoFocus
              />
              <Button 
                type="submit"
                disabled={updateNameMutation.isPending}
                className="w-full kahoot-button bg-[#333] hover:bg-black text-white border-b-4 border-black"
              >
                {updateNameMutation.isPending ? "LOADING..." : "ENTER"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
