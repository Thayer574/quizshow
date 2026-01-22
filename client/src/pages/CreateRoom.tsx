import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function CreateRoom() {
  const [, setLocation] = useLocation();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createRoomMutation = trpc.room.create.useMutation({
    onSuccess: (room) => {
      setRoomCode(room.code);
      toast.success("Room created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create room");
    },
  });

  const handleCreateRoom = () => {
    createRoomMutation.mutate();
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast.success("Room code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinue = () => {
    if (roomCode) {
      setLocation(`/room/${roomCode}/waiting`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create a Game Room</CardTitle>
        </CardHeader>
        <CardContent>
          {!roomCode ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Click the button below to create a new game room. You'll receive a unique code to share with players.
              </p>
              <Button
                onClick={handleCreateRoom}
                disabled={createRoomMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {createRoomMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Room
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Your Room Code</p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
                  <p className="text-4xl font-bold text-blue-600 tracking-widest">{roomCode}</p>
                </div>
                <p className="text-sm text-gray-600">Share this code with players to let them join</p>
              </div>

              <Button
                onClick={handleCopyCode}
                variant="outline"
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>

              <Button
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Go to Waiting Room
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
