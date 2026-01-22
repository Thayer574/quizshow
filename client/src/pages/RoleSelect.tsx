import { useAuth } from "@/_core/hooks/useAuth";
import { useGameRole } from "@/hooks/useGameRole";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, LogOut, Loader2 } from "lucide-react";

export default function RoleSelect() {
  const { user, logout } = useAuth();
  const { selectRole } = useGameRole();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // Provide a default user if useAuth is still loading/missing
  const displayUser = user || { name: "Player" };

  const handleSelectRole = (role: "owner" | "player") => {
    selectRole(role);
    if (role === "owner") {
      setLocation("/room/create");
    } else {
      setLocation("/room/join");
    }
  };

  return (
    <div className="min-h-screen bg-[#46178f] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-7xl font-black text-white mb-4 tracking-tighter italic">K-Quiz</h1>
          <p className="text-2xl font-bold text-white/80">Ready to play?</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Room Owner Card */}
          <Card className="kahoot-card cursor-pointer group" onClick={() => handleSelectRole("owner")}>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="bg-[#eb1041] p-6 rounded-3xl shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-black text-[#333]">HOST</CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6">
              <p className="text-lg font-medium text-gray-500 mb-6">
                Create a room and lead the game!
              </p>
              <Button className="w-full kahoot-button bg-[#eb1041] hover:bg-[#c60d37] text-white border-b-4 border-[#9e0a2c]">
                GO!
              </Button>
            </CardContent>
          </Card>

          {/* Player Card */}
          <Card className="kahoot-card cursor-pointer group" onClick={() => handleSelectRole("player")}>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="bg-[#1368ce] p-6 rounded-3xl shadow-lg group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-black text-[#333]">JOIN</CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6">
              <p className="text-lg font-medium text-gray-500 mb-6">
                Jump into a friend's room!
              </p>
              <Button className="w-full kahoot-button bg-[#1368ce] hover:bg-[#1056a5] text-white border-b-4 border-[#0d4584]">
                PLAY
              </Button>
            </CardContent>
          </Card>

          {/* Solo Card */}
          <Card className="kahoot-card cursor-pointer group" onClick={() => setLocation("/solo")}>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="bg-[#26890c] p-6 rounded-3xl shadow-lg group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-black text-[#333]">SOLO</CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6">
              <p className="text-lg font-medium text-gray-500 mb-6">
                Practice on your own!
              </p>
              <Button className="w-full kahoot-button bg-[#26890c] hover:bg-[#1e6d0a] text-white border-b-4 border-[#185208]">
                START
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Button variant="ghost" onClick={handleLogout} className="text-white/60 hover:text-white hover:bg-white/10 text-lg font-bold">
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
