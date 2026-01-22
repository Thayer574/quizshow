import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnswerButton } from "@/components/AnswerButton";
import { trpc } from "@/lib/trpc";
import { Loader2, Users, Zap, Timer, Trophy, Star, ArrowRight, AlertCircle, Sparkles, Crown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTION_TIME_LIMIT, POINTS_PER_CORRECT, MAX_SPEED_BONUS } from "@shared/gameConstants";

export default function Playing() {
  const { code } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  const recordAnswerMutation = trpc.game.recordAnswer.useMutation();
  const advanceQuestionMutation = trpc.room.advanceQuestion.useMutation({
    onSuccess: () => {
      roomQuery.refetch();
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
      toast.success("NEW CHALLENGE UNLOCKED!", {
        icon: <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />,
      });
    }
  });

  // Fetch room and questions
  const roomQuery = trpc.room.getByCode.useQuery(
    { code: code || "" },
    { refetchInterval: 2000 }
  );
  const questionsQuery = trpc.question.getRoomQuestions.useQuery(
    { roomId: roomQuery.data?.id || 0 },
    { enabled: !!roomQuery.data?.id }
  );
  const membersQuery = trpc.room.getMembers.useQuery(
    { roomId: roomQuery.data?.id || 0 },
    { enabled: !!roomQuery.data?.id }
  );

  const questions = questionsQuery.data || [];
  const currentQuestionIndex = roomQuery.data?.currentQuestionIndex || 0;

  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimeLeft(QUESTION_TIME_LIMIT);
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];
  const isOwner = user?.id === roomQuery.data?.ownerId;

  useEffect(() => {
    if (currentQuestion) {
      const answers = [
        currentQuestion.correctAnswer,
        currentQuestion.wrongAnswer1,
        currentQuestion.wrongAnswer2,
        currentQuestion.wrongAnswer3,
      ].sort(() => Math.random() - 0.5);
      setShuffledAnswers(answers);
    }
  }, [currentQuestion]);

  useEffect(() => {
    let timer: number | undefined;

    if (!isAnswered && timeLeft > 0 && currentQuestion) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered && currentQuestion) {
      handleAnswer(null);
    }

    return () => {
      if (timer !== undefined) clearInterval(timer);
    };
  }, [isAnswered, timeLeft, currentQuestion]);

  const handleAnswer = (answer: string | null) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (user) {
      const isCorrect = answer === currentQuestion.correctAnswer;
      const pointsEarned = isCorrect
        ? POINTS_PER_CORRECT + Math.floor((timeLeft / QUESTION_TIME_LIMIT) * MAX_SPEED_BONUS)
        : 0;

      recordAnswerMutation.mutate({
        gameSessionId: roomQuery.data?.id || 0,
        questionId: currentQuestion.id,
        selectedAnswer: answer || "timeout",
        isCorrect,
        pointsEarned,
        timeToAnswer: (QUESTION_TIME_LIMIT - timeLeft) * 1000,
      });

      if (isCorrect) {
        toast.success(`LEGENDARY! +${pointsEarned} points!`, {
          icon: <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />,
        });
      } else if (answer === null) {
        toast.error("TIME'S UP!", { icon: <Timer className="w-5 h-5" /> });
      } else {
        toast.error("NOT QUITE! Keep focused.");
      }
    }
  };

  const handleNextQuestion = () => {
    if (isOwner && roomQuery.data) {
      advanceQuestionMutation.mutate({ roomId: roomQuery.data.id });
    }
  };

  if (roomQuery.isLoading || questionsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#46178f] flex flex-col items-center justify-center space-y-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="w-16 h-16 text-yellow-400" />
        </motion.div>
        <p className="text-white font-black tracking-widest animate-pulse">SYNCING ARENA...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#46178f] flex items-center justify-center p-6">
        <Card className="bg-white/10 backdrop-blur-xl border-2 border-red-500/50 rounded-[2rem] p-10 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <p className="text-3xl font-black text-white italic">CHALLENGE NOT FOUND</p>
          <Button onClick={() => setLocation("/")} className="mt-6 bg-white text-[#46178f] font-black rounded-xl">BACK TO BASE</Button>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="min-h-screen bg-[#46178f] text-white font-sans selection:bg-yellow-400 selection:text-[#46178f] overflow-hidden relative">

      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/40 to-transparent" />
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Top Bar */}
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-2">
              K-QUIZ <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </h1>
            <div className="flex items-center gap-4">
              <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-300">Arena Code</p>
                <p className="text-lg font-black text-yellow-400">{code}</p>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-300">Question</p>
                <p className="text-lg font-black">{currentQuestionIndex + 1} / {questions.length}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-300 flex items-center gap-2 justify-end">
                <Users className="w-3 h-3" /> {membersQuery.data?.length || 0} Challengers
              </p>
            </div>
            <motion.div 
              key={timeLeft}
              initial={{ scale: 1.2, color: "#fff" }}
              animate={{ scale: 1, color: timeLeft <= 5 ? "#ef4444" : "#fff" }}
              className="bg-black/40 backdrop-blur-xl w-24 h-24 rounded-full border-4 border-white/20 flex flex-col items-center justify-center shadow-2xl"
            >
              <Timer className={`w-5 h-5 mb-1 ${timeLeft <= 5 ? "animate-pulse" : ""}`} />
              <span className="text-3xl font-black tracking-tighter">{timeLeft}</span>
            </motion.div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-4 rounded-full mb-12 overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main Question Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 40, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -40, rotateX: 15 }}
                className="mb-12"
              >
                <div className="bg-white text-[#46178f] p-12 rounded-[3rem] shadow-[0_20px_0_0_#cbd5e1] text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500" />
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight italic">
                    {currentQuestion.questionText}
                  </h2>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Answer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {shuffledAnswers.map((answer, index) => {
                const colors = [
                  "bg-[#e21b3c] shadow-[#a3132b]", // Red
                  "bg-[#1368ce] shadow-[#0e4da1]", // Blue
                  "bg-[#d89e00] shadow-[#a67a00]", // Yellow/Orange
                  "bg-[#26890c] shadow-[#1a5e08]", // Green
                ];
                const icons = [
                  <div key="0" className="w-8 h-8 border-4 border-white rotate-45" />,
                  <div key="1" className="w-8 h-8 border-4 border-white rounded-full" />,
                  <div key="2" className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-bottom-[28px] border-bottom-white" />,
                  <div key="3" className="w-8 h-8 border-4 border-white" />,
                ];

                return (
                  <motion.button
                    key={index}
                    whileHover={!isAnswered ? { scale: 1.02, y: -4 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98, y: 4 } : {}}
                    onClick={() => handleAnswer(answer)}
                    disabled={isAnswered}
                    className={`
                      relative h-24 rounded-2xl flex items-center px-8 transition-all
                      ${colors[index % 4]} 
                      ${isAnswered && answer !== currentQuestion.correctAnswer ? "opacity-20 grayscale-[0.5]" : "opacity-100"}
                      ${isAnswered && answer === currentQuestion.correctAnswer ? "ring-8 ring-white scale-105 z-20" : ""}
                      shadow-[0_8px_0_0_var(--tw-shadow-color)]
                      active:shadow-none active:translate-y-[8px]
                      disabled:cursor-default
                    `}
                    style={{ "--tw-shadow-color": colors[index % 4].split(" ")[1].split("-")[1] } as any}
                  >
                    <div className="flex-shrink-0 mr-6 opacity-40 group-hover:opacity-100 transition-opacity">
                      {icons[index % 4]}
                    </div>
                    <span className="text-2xl font-black text-white text-left truncate">
                      {answer}
                    </span>
                    {isAnswered && answer === currentQuestion.correctAnswer && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-4 -right-4 bg-white text-green-600 p-2 rounded-full shadow-xl"
                      >
                        <Trophy className="w-8 h-8 fill-current" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-purple-300">Leaderboard</h2>
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl space-y-3">
              <AnimatePresence mode="popLayout">
                {membersQuery.data?.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-2xl flex justify-between items-center transition-all ${
                      member.userId === user?.id
                        ? "bg-yellow-400 text-[#46178f] shadow-[0_4px_0_0_#b48c00]"
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-black text-lg opacity-40">{index + 1}</span>
                      <div>
                        <p className="font-black tracking-tight flex items-center gap-2">
                          {member.name}
                          {index === 0 && <Crown className="w-4 h-4 fill-current" />}
                        </p>
                        {member.userId === user?.id && <p className="text-[10px] font-black uppercase tracking-widest opacity-60">You</p>}
                      </div>
                    </div>
                    <p className="font-black text-xl italic">0</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Result Overlay */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                fixed bottom-0 left-0 w-full p-8 backdrop-blur-2xl border-t-4 z-50
                ${isCorrect ? "bg-green-600/90 border-green-400" : "bg-red-600/90 border-red-400"}
              `}
            >
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="bg-white p-4 rounded-2xl shadow-xl">
                    {isCorrect ? (
                      <Star className="w-12 h-12 text-green-600 fill-current" />
                    ) : (
                      <AlertCircle className="w-12 h-12 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-4xl font-black italic tracking-tighter">
                      {isCorrect ? "LEGENDARY!" : selectedAnswer === null ? "TIME'S UP!" : "NOT QUITE!"}
                    </h3>
                    {isCorrect && (
                      <p className="text-xl font-bold text-green-100">
                        SPEED BONUS APPLIED!
                      </p>
                    )}
                  </div>
                </div>

                {isOwner && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextQuestion}
                    className="bg-white text-black px-12 py-5 rounded-[2rem] font-black text-2xl shadow-[0_8px_0_0_#cbd5e1] active:shadow-none active:translate-y-[8px] transition-all flex items-center gap-3"
                  >
                    {currentQuestionIndex === questions.length - 1 ? "FINAL STANDINGS" : "NEXT CHALLENGE"}
                    <ArrowRight className="w-8 h-8" />
                  </motion.button>
                )}
                {!isOwner && (
                  <div className="bg-white/20 px-8 py-4 rounded-2xl font-black text-xl animate-pulse">
                    WAITING FOR HOST...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
