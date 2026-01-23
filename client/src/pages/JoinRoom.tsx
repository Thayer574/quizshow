import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Zap, Users, Star, Rocket } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function JoinRoom() {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [username, setUsername] = useState(user?.name || "");
  const [, setLocation] = useLocation();

  const joinRoomMutation = trpc.room.join.useMutation({
    onSuccess: (room) => {
      toast.success("MISSION COMMENCED! You're in.");
      setLocation(`/room/${room.code}/waiting`);
    },
    onError: (error) => {
      toast.error(error.message || "Access Denied! Check your code.");
    },
  });

  const handleJoin = () => {
    if (!code.trim()) {
      toast.error("The Secret Code is missing!");
      return;
    }
    if (!username.trim()) {
      toast.error("Identify yourself, Challenger!");
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
    <div className="min-h-screen bg-[#46178f] text-white font-sans selection:bg-yellow-400 selection:text-[#46178f] flex flex-col items-center justify-center p-6 overflow-hidden relative">

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-600/20 rounded-full blur-[120px]" 
        />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <button
            onClick={() => setLocation("/")}
            className="mb-8 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-black tracking-widest uppercase flex items-center gap-2 mx-auto transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            ABORT MISSION
          </button>

          <div className="inline-block p-4 bg-yellow-400 rounded-[2rem] mb-6 shadow-[0_8px_0_0_#b48c00]">
            <Rocket className="w-12 h-12 text-[#46178f] fill-[#46178f]" />
          </div>

          <h1 className="text-6xl font-black italic tracking-tighter mb-2 drop-shadow-2xl">
            JOIN THE <span className="text-yellow-400">ARENA</span>
          </h1>
          <p className="text-purple-200 font-bold text-lg uppercase tracking-widest">Prepare for Battle</p>
        </motion.div>

        {/* Join Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
        >
          <div className="space-y-8">
            {/* Room Code Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="roomCode" className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                  SECRET ROOM CODE
                </Label>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
              </div>
              <div className="relative">
                <Input
                  id="roomCode"
                  type="text"
                  placeholder="X-X-X-X"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={joinRoomMutation.isPending}
                  className="h-24 bg-black/20 border-4 border-white/10 focus:border-yellow-400 text-center text-5xl font-black tracking-[0.5em] rounded-3xl transition-all placeholder:text-white/10"
                  maxLength={6}
                />
              </div>
              <p className="text-center text-xs font-bold text-purple-300/60">GET THE CODE FROM THE GAME MASTER</p>
            </div>

            {/* Username Input */}
            <div className="space-y-3">
              <Label htmlFor="username" className="text-xs font-black uppercase tracking-[0.2em] text-pink-300">
                CHALLENGER ALIAS
              </Label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2">
                  <Users className="w-6 h-6 text-white/40 group-focus-within:text-pink-400 transition-colors" />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your name..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={joinRoomMutation.isPending}
                  className="h-16 pl-16 bg-white/5 border-2 border-white/10 focus:border-pink-400 text-xl font-bold rounded-2xl transition-all"
                  maxLength={20}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={joinRoomMutation.isPending || !code.trim() || !username.trim()}
              className="w-full h-20 bg-[#26890c] hover:bg-[#2ea00e] disabled:bg-gray-600 disabled:shadow-none text-white rounded-2xl font-black text-2xl shadow-[0_8px_0_0_#1a5e08] active:shadow-none active:translate-y-[8px] transition-all flex items-center justify-center gap-4 group"
            >
              {joinRoomMutation.isPending ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  WARPING...
                </>
              ) : (
                <>
                  <Zap className="w-8 h-8 fill-current group-hover:scale-125 transition-transform" />
                  ENTER THE GAME
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Bottom Decoration */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex justify-center gap-8 opacity-30"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-[10px] font-black tracking-widest uppercase">Fast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-[10px] font-black tracking-widest uppercase">Fun</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-[10px] font-black tracking-widest uppercase">Fierce</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
