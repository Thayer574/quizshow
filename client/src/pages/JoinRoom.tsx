import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function JoinRoom() {
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [, setLocation] = useLocation();

  const joinRoomMutation = trpc.room.join.useMutation({
    onSuccess: (room) => {
      toast.success("Joined room successfully!");
      setLocation(`/room/${room.code}/waiting`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join room");
    },
  });

  const handleJoin = () => {
    if (!code.trim()) {
      toast.error("Please enter a room code");
      return;
    }
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    joinRoomMutation.mutate({ code: code.toUpperCase(), playerName: username });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Join a Room</h1>
          <p className="text-gray-600 mt-2">Enter the room code and your username</p>
        </div>

        {/* Join Form */}
        <Card>
          <CardHeader>
            <CardTitle>Room Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Room Code Input */}
              <div className="space-y-2">
                <Label htmlFor="roomCode">Room Code</Label>
                <Input
                  id="roomCode"
                  type="text"
                  placeholder="e.g., ABC123"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={joinRoomMutation.isPending}
                  className="text-center text-lg font-bold tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500">Ask the room owner for the code</p>
              </div>

              {/* Username Input */}
              <div className="space-y-2">
                <Label htmlFor="username">Your Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={joinRoomMutation.isPending}
                  maxLength={20}
                />
                <p className="text-xs text-gray-500">This is how you'll appear in the leaderboard</p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleJoin}
                disabled={joinRoomMutation.isPending || !code.trim() || !username.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {joinRoomMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Room"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
