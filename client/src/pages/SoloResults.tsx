import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Home, Trophy, Star, Sparkles, Zap, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SoloResults() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [score, setScore] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    // Try to get score from session storage (set by SoloPlaying)
    const storedScore = sessionStorage.getItem("soloGameScore");
    if (storedScore) {
      setScore(parseInt(storedScore, 10));
      // We keep it for a moment to show the result, then clear it
      // sessionStorage.removeItem("soloGameScore"); 
    }
    // Also try URL params as fallback
    const params = new URLSearchParams(window.location.search);
    const urlScore = parseInt(params.get("score") || "0", 10);
    if (urlScore > 0) {
      setScore(urlScore);
    }

    // Delay content showing for a "reveal" effect
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayAgain = () => {
    sessionStorage.removeItem("soloGameScore");
    setLocation("/solo");
  };

  const handleHome = () => {
    sessionStorage.removeItem("soloGameScore");
    setLocation("/role-select");
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#46178f] text-white font-sans selection:bg-yellow-400 selection:text-[#46178f] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Confetti-like Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              top: "-10%", 
              left: `${Math.random() * 100}%`,
              rotate: 0,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              top: "110%", 
              rotate: 360,
              x: [0, Math.random() * 100 - 50, 0]
            }}
            transition={{ 
              duration: Math.random() * 5 + 5, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 5
            }}
            className={`absolute w-4 h-4 rounded-sm opacity-20 ${
              ["bg-yellow-400", "bg-pink-500", "bg-blue-400", "bg-green-400"][i % 4]
            }`}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="bg-white/10 backdrop-blur-2xl border-4 border-white/20 rounded-[4rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
          <CardHeader className="pt-16 pb-8 text-center relative">
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 10, delay: 0.2 }}
              className="inline-block p-6 bg-yellow-400 rounded-[2.5rem] mb-8 shadow-[0_12px_0_0_#b48c00] relative"
            >
              <Trophy className="w-20 h-20 text-[#46178f] fill-[#46178f]" />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white rounded-[2.5rem]"
              />
            </motion.div>

            <CardTitle className="text-6xl md:text-7xl font-black italic tracking-tighter text-white mb-2">
              VICTORY!
            </CardTitle>
            <p className="text-purple-200 font-black text-xl uppercase tracking-[0.4em]">Arena Cleared</p>
          </CardHeader>

          <CardContent className="px-12 pb-16 text-center space-y-12">
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="relative inline-block">
                    <motion.p 
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="text-8xl md:text-9xl font-black text-yellow-400 italic tracking-tighter drop-shadow-[0_10px_0_rgba(0,0,0,0.3)]"
                    >
                      {score.toLocaleString()}
                    </motion.p>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-8 -right-8"
                    >
                      <Sparkles className="w-12 h-12 text-white fill-white opacity-50" />
                    </motion.div>
                  </div>
                  <p className="text-2xl font-bold text-purple-100">TOTAL POINTS EARNED</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95, y: 0 }}
                onClick={handlePlayAgain}
                className="h-20 bg-[#26890c] hover:bg-[#2ea00e] text-white rounded-[2rem] font-black text-2xl shadow-[0_10px_0_0_#1a5e08] active:shadow-none active:translate-y-[10px] transition-all flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-8 h-8" />
                PLAY AGAIN
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95, y: 0 }}
                onClick={handleHome}
                className="h-20 bg-[#1368ce] hover:bg-[#1a76e5] text-white rounded-[2rem] font-black text-2xl shadow-[0_10px_0_0_#0e4da1] active:shadow-none active:translate-y-[10px] transition-all flex items-center justify-center gap-3"
              >
                <Home className="w-8 h-8" />
                EXIT ARENA
              </motion.button>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1 }}
              className="flex justify-center gap-8"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current" />
                <span className="text-xs font-black uppercase tracking-widest">Fastest Finger</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-black uppercase tracking-widest">Elite Tier</span>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center"
        >
          <button className="inline-flex items-center gap-2 text-purple-300 hover:text-white font-black uppercase tracking-widest text-sm transition-colors">
            <Share2 className="w-5 h-5" />
            Brag to your friends
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
