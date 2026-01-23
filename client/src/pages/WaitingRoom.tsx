import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Users, Loader2, Play, LogOut, Trash2, Sparkles, Brain, Zap, Star } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function WaitingRoom() {
  const { code } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [lastMemberCount, setLastMemberCount] = useState(0);
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    correctAnswer: "",
    wrongAnswer1: "",
    wrongAnswer2: "",
    wrongAnswer3: "",
  });

  // Fetch room details
  const roomQuery = trpc.room.getByCode.useQuery({ code: code || "" });
  const membersQuery = trpc.room.getMembers.useQuery(
    { roomId: roomQuery.data?.id || 0 },
    { 
      enabled: !!roomQuery.data?.id,
      refetchInterval: 2000 // Poll for new members
    }
  );
  const questionsQuery = trpc.question.getRoomQuestions.useQuery(
    { roomId: roomQuery.data?.id || 0 },
    { enabled: !!roomQuery.data?.id }
  );

  // Trigger "Announcement" toast when new members join
  useEffect(() => {
    if (membersQuery.data && membersQuery.data.length > lastMemberCount) {
      const newMember = membersQuery.data[membersQuery.data.length - 1];
      if (lastMemberCount > 0) {
        toast.custom((t) => (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-yellow-400 text-[#46178f] p-6 rounded-[2rem] shadow-2xl border-4 border-white flex items-center gap-4"
          >
            <div className="bg-[#46178f] p-3 rounded-2xl">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-70">New Challenger!</p>
              <p className="text-2xl font-black italic tracking-tighter">{newMember.name.toUpperCase()} HAS ENTERED!</p>
            </div>
          </motion.div>
        ), { duration: 4000 });
      }
      setLastMemberCount(membersQuery.data.length);
    }
  }, [membersQuery.data, lastMemberCount]);

  const addQuestionMutation = trpc.question.add.useMutation({
    onSuccess: () => {
      toast.success("Question forged and ready!");
      setQuestionForm({
        questionText: "",
        correctAnswer: "",
        wrongAnswer1: "",
        wrongAnswer2: "",
        wrongAnswer3: "",
      });
      setIsAddingQuestion(false);
      questionsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add question");
    },
  });

  const handleAddQuestion = () => {
    if (
      !questionForm.questionText.trim() ||
      !questionForm.correctAnswer.trim() ||
      !questionForm.wrongAnswer1.trim() ||
      !questionForm.wrongAnswer2.trim() ||
      !questionForm.wrongAnswer3.trim()
    ) {
      toast.error("Complete the challenge form!");
      return;
    }

    addQuestionMutation.mutate({
      ...questionForm,
      roomId: roomQuery.data?.id,
    });
  };

  const handleStartGame = () => {
    if (!questionsQuery.data || questionsQuery.data.length === 0) {
      toast.error("The arena needs at least one question!");
      return;
    }
    setLocation(`/room/${code}/playing`);
  };

  const isOwner = user?.id === roomQuery.data?.ownerId;

  if (roomQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#46178f] flex flex-col items-center justify-center space-y-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="w-12 h-12 text-yellow-400" />
        </motion.div>
        <p className="text-white font-black tracking-widest animate-pulse">LOCATING ARENA...</p>
      </div>
    );
  }

  if (!roomQuery.data) {
    return (
      <div className="min-h-screen bg-[#46178f] flex items-center justify-center p-6">
        <Card className="bg-white/10 backdrop-blur-xl border-2 border-red-500/50 rounded-[2rem] p-10 text-center">
          <p className="text-3xl font-black text-white italic">ARENA NOT FOUND</p>
          <Button onClick={() => setLocation("/")} className="mt-6 bg-white text-[#46178f] font-black rounded-xl">BACK TO BASE</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#46178f] text-white font-sans selection:bg-yellow-400 selection:text-[#46178f] relative overflow-hidden">

      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="bg-yellow-400 p-3 rounded-2xl shadow-[0_4px_0_0_#b48c00]">
                <Users className="w-8 h-8 text-[#46178f]" />
              </div>
              <div>
                <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-2">
                  LOBBY <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </h1>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-300">
                  ROOM CODE: <span className="text-white bg-white/10 px-2 py-1 rounded ml-2">{code}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isOwner ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartGame}
                    disabled={!questionsQuery.data || questionsQuery.data.length === 0}
                    className="bg-[#26890c] hover:bg-[#2ea00e] text-white px-8 py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_0_#1a5e08] active:shadow-none active:translate-y-[6px] transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    START GAME
                  </motion.button>
                  <button
                    onClick={() => confirm("End this arena?") && setLocation("/")}
                    className="p-4 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl border-2 border-red-500/20 transition-all"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => confirm("Leave the arena?") && setLocation("/")}
                  className="bg-white/10 hover:bg-red-600 px-6 py-4 rounded-2xl font-black flex items-center gap-2 transition-all border-2 border-white/10"
                >
                  <LogOut className="w-5 h-5" />
                  LEAVE
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-10">

          {/* Players Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-purple-300">Challengers</h2>
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-black">{membersQuery.data?.length || 0}</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {membersQuery.data?.map((member, idx) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center font-black text-lg">
                        {member.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-lg tracking-tight">{member.name}</p>
                        <p className="text-[10px] font-bold text-purple-300 uppercase">Joined Arena</p>
                      </div>
                    </div>
                    {idx === 0 && <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                  </motion.div>
                ))}
              </AnimatePresence>
              {(!membersQuery.data || membersQuery.data.length === 0) && (
                <div className="text-center py-10 opacity-30 italic font-bold">Waiting for players...</div>
              )}
            </div>
          </div>

          {/* Questions Feed */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-purple-300">Challenge Bank</h2>
              <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
                <DialogTrigger asChild>
                  <button className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl font-black text-xs shadow-[0_4px_0_0_#1e40af] active:shadow-none active:translate-y-[4px] transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4 stroke-[3px]" />
                    ADD QUESTION
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-[#1368ce] border-none text-white p-8 rounded-[2.5rem]">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
                      <Brain className="w-8 h-8" /> FORGE CHALLENGE
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-blue-100">The Question</label>
                      <Textarea
                        placeholder="Type your question..."
                        className="bg-white/10 border-2 border-white/20 focus:border-white/50 text-white text-xl font-bold rounded-2xl min-h-[100px]"
                        value={questionForm.questionText}
                        onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Correct Answer"
                        className="bg-[#26890c] border-none h-14 font-bold rounded-xl"
                        value={questionForm.correctAnswer}
                        onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                      />
                      <Input
                        placeholder="Wrong Answer 1"
                        className="bg-[#e21b3c] border-none h-14 font-bold rounded-xl"
                        value={questionForm.wrongAnswer1}
                        onChange={(e) => setQuestionForm({ ...questionForm, wrongAnswer1: e.target.value })}
                      />
                      <Input
                        placeholder="Wrong Answer 2"
                        className="bg-[#d89e00] border-none h-14 font-bold rounded-xl"
                        value={questionForm.wrongAnswer2}
                        onChange={(e) => setQuestionForm({ ...questionForm, wrongAnswer2: e.target.value })}
                      />
                      <Input
                        placeholder="Wrong Answer 3"
                        className="bg-white/10 border-2 border-white/20 h-14 font-bold rounded-xl"
                        value={questionForm.wrongAnswer3}
                        onChange={(e) => setQuestionForm({ ...questionForm, wrongAnswer3: e.target.value })}
                      />
                    </div>
                    <button
                      onClick={handleAddQuestion}
                      disabled={addQuestionMutation.isPending}
                      className="w-full bg-white text-[#1368ce] h-16 rounded-2xl font-black text-xl shadow-[0_6px_0_0_#cbd5e1] active:shadow-none active:translate-y-[6px] transition-all"
                    >
                      {addQuestionMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "ADD TO ARENA"}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {questionsQuery.data?.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xl text-yellow-400">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-4">
                        <p className="text-xl font-bold group-hover:text-yellow-400 transition-colors">{question.questionText}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div className="px-3 py-2 bg-[#26890c]/20 border border-[#26890c]/40 rounded-lg text-[#4ade80] text-[10px] font-black truncate uppercase">
                            {question.correctAnswer}
                          </div>
                          {[question.wrongAnswer1, question.wrongAnswer2, question.wrongAnswer3].map((ans, i) => (
                            <div key={i} className="px-3 py-2 bg-[#e21b3c]/10 border border-[#e21b3c]/20 rounded-lg text-[#f87171] text-[10px] font-black truncate uppercase">
                              {ans}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {(!questionsQuery.data || questionsQuery.data.length === 0) && (
                <div className="text-center py-20 bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem]">
                  <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-20" />
                  <p className="font-black text-purple-300 uppercase tracking-widest">Arena is empty. Add questions!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 text-center opacity-20">
        <p className="text-[10px] font-black tracking-[0.5em] uppercase">Arena Sync Active • v1.0.4</p>
      </footer>
    </div>
  );
}