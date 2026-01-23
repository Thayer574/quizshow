import { useAuth } from "@/_core/hooks/useAuth";
import { useGameRole } from "@/hooks/useGameRole";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LogOut } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const { role, clearRole } = useGameRole();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  const handleLogout = async () => {
    await logout();
    clearRole();
    setLocation("/");
  };

  const handleCreateRoom = async () => {
    if (role === "owner") {
      setLocation("/room/create");
    }
  };

  const handleJoinRoom = () => {
    if (role === "player") {
      setLocation("/room/join");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">K-Quiz</h1>
            <p className="text-gray-600">Welcome, {user.name}!</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {role === "owner" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Room Owner Dashboard</h2>
            <Card>
              <CardHeader>
                <CardTitle>Create a New Game Room</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Start hosting a game by creating a new room. You'll get a unique code to share with players.
                </p>
                <Button onClick={handleCreateRoom} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {role === "player" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Player Dashboard</h2>
            <Card>
              <CardHeader>
                <CardTitle>Join a Game Room</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Enter a room code to join a game hosted by another player.
                </p>
                <Button onClick={handleJoinRoom} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Join Room
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {!role && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Select a Role</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Please go back to the login page and select your role to continue.
                </p>
                <Button onClick={() => setLocation("/")} className="bg-blue-600 hover:bg-blue-700">
                  Back to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
