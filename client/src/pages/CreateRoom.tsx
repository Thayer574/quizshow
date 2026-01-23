import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Copy, Check, Sparkles, Share2, ArrowRight, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateRoom() {
  const [, setLocation] = useLocation();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createRoomMutation = trpc.room.create.useMutation({
    onSuccess: (room) => {
      setRoomCode(room.code);
      toast.success("THE ARENA IS READY!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to forge the room");
    },
  });

  const handleCreateRoom = () => {
    createRoomMutation.mutate();
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast.success("Code copied! Send it to your rivals.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinue = () => {
    if (roomCode) {
      setLocation(`/room/${roomCode}/waiting`);
    }
  };

  return (
    <div className="min-h-screen bg-[#46178f] text-white font-sans selection:bg-yellow-400 selection:text-[#46178f] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-purple-500 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-blue-500 rounded-full blur-[150px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl relative z-10"
      >
        <Card className="bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
          <CardHeader className="pt-12 pb-6 text-center">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="inline-block p-4 bg-yellow-400 rounded-3xl mb-6 shadow-[0_8px_0_0_#b48c00]"
            >
              <Crown className="w-12 h-12 text-[#46178f] fill-[#46178f]" />
            </motion.div>
            <CardTitle className="text-5xl font-black italic tracking-tighter text-white">
              HOST THE <span className="text-yellow-400">SHOW</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="px-10 pb-12">
            <AnimatePresence mode="wait">
              {!roomCode ? (
                <motion.div 
                  key="initial"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 text-center"
                >
                  <p className="text-xl font-bold text-purple-100 leading-relaxed">
                    Ready to become the Game Master? Forge a new arena and invite your challengers to the ultimate showdown.
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateRoom}
                    disabled={createRoomMutation.isPending}
                    className="w-full bg-blue-500 hover:bg-blue-400 text-white h-24 rounded-[2rem] font-black text-3xl shadow-[0_10px_0_0_#1e40af] active:shadow-none active:translate-y-[10px] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {createRoomMutation.isPending ? (
                      <>
                        <Loader2 className="w-10 h-10 animate-spin" />
                        FORGING...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-10 h-10 fill-current" />
                        CREATE ROOM
                      </>
                    )}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  key="created"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-4">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400">YOUR SECRET ACCESS CODE</p>

                    <motion.div 
                      initial={{ rotate: -2 }}
                      animate={{ rotate: 0 }}
                      className="bg-white text-[#46178f] rounded-[2.5rem] p-10 shadow-[0_15px_0_0_#cbd5e1] relative group"
                    >
                      <motion.p 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-7xl font-black tracking-[0.2em] italic"
                      >
                        {roomCode}
                      </motion.p>
                      <div className="absolute -top-4 -right-4 bg-pink-500 text-white p-3 rounded-2xl shadow-lg rotate-12">
                        <Zap className="w-6 h-6 fill-current" />
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCopyCode}
                      className="w-full h-16 bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-6 h-6 text-green-400" />
                          COPIED TO CLIPBOARD!
                        </>
                      ) : (
                        <>
                          <Share2 className="w-6 h-6" />
                          SHARE WITH PLAYERS
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinue}
                      className="w-full h-20 bg-[#26890c] hover:bg-[#2ea00e] text-white rounded-2xl font-black text-2xl shadow-[0_8px_0_0_#1a5e08] active:shadow-none active:translate-y-[8px] transition-all flex items-center justify-center gap-3"
                    >
                      ENTER WAITING ROOM
                      <ArrowRight className="w-8 h-8" />
                    </motion.button>
                  </div>

                  <p className="text-center text-sm font-bold text-purple-300 animate-pulse">
                    Waiting for challengers to join the arena...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer Branding */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-xs font-black tracking-[0.5em] uppercase opacity-30">K-Quiz Master Console v1.0</p>
        </motion.div>
      </motion.div>
    </div>
  );
}