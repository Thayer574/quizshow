import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Loader2, Play, ArrowLeft, Sparkles, Trophy, Brain, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Solo() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    correctAnswer: "",
    wrongAnswer1: "",
    wrongAnswer2: "",
    wrongAnswer3: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  const questionsQuery = trpc.question.getUserQuestions.useQuery(undefined, {
    enabled: !!user,
  });

  const addQuestionMutation = trpc.question.add.useMutation({
    onSuccess: () => {
      toast.success("Question added to your arsenal!");
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
    onError: (error: any) => {
      if (error?.data?.code === "UNAUTHORIZED") {
        toast.error("Session expired. Time to re-login!");
        setLocation("/");
      } else {
        toast.error(error?.message || "Failed to add question");
      }
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
      toast.error("Fill in all the blanks to power up!");
      return;
    }

    addQuestionMutation.mutate({
      ...questionForm,
    });
  };

  const handleStartGame = () => {
    if (!questionsQuery.data || questionsQuery.data.length === 0) {
      toast.error("Add at least one question to start the challenge!");
      return;
    }
    setLocation("/solo/playing");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#46178f] flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-12 h-12 text-yellow-400 fill-yellow-400" />
        </motion.div>
        <p className="text-white font-black text-xl tracking-wider animate-pulse">CHARGING UP...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#46178f] text-white font-sans selection:bg-yellow-400 selection:text-[#46178f]">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setLocation("/role-select")}
                className="p-2 hover:bg-white/10 rounded-xl transition-all group"
              >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-4xl font-black tracking-tighter italic flex items-center gap-2">
                  K-QUIZ <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </h1>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-300">
                  <span className="px-2 py-0.5 bg-yellow-400 text-black rounded">SOLO MODE</span>
                  <span>•</span>
                  <span>{user.name || "Challenger"}</span>
                </div>
              </div>
            </div>

            {questionsQuery.data && questionsQuery.data.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartGame}
                className="bg-[#26890c] hover:bg-[#2ea00e] text-white px-8 py-4 rounded-xl font-black text-xl shadow-[0_6px_0_0_#1a5e08] active:shadow-none active:translate-y-[6px] transition-all flex items-center gap-3"
              >
                <Play className="w-6 h-6 fill-current" />
                START GAME
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Stats & Actions */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-yellow-400 rounded-2xl">
                  <Trophy className="w-8 h-8 text-[#46178f]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-200 uppercase tracking-wider">Your Arsenal</p>
                  <p className="text-3xl font-black">{questionsQuery.data?.length || 0} Questions</p>
                </div>
              </div>

              <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
                <DialogTrigger asChild>
                  <button className="w-full bg-blue-500 hover:bg-blue-400 text-white p-6 rounded-2xl font-black text-xl shadow-[0_6px_0_0_#1e40af] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-3">
                    <Plus className="w-6 h-6 stroke-[3px]" />
                    ADD QUESTION
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-[#1368ce] border-none text-white p-0 overflow-hidden rounded-[2rem]">
                  <div className="p-8 space-y-6">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
                        <Brain className="w-8 h-8" /> CREATE CHALLENGE
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-blue-100">The Question</label>
                        <Textarea
                          placeholder="Type your mind-bending question here..."
                          className="bg-white/10 border-2 border-white/20 focus:border-white/50 text-white placeholder:text-white/40 min-h-[120px] text-xl font-bold rounded-2xl resize-none"
                          value={questionForm.questionText}
                          onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-green-300">Correct Answer</label>
                          <Input
                            placeholder="The right one!"
                            className="bg-[#26890c] border-none text-white placeholder:text-white/60 h-14 text-lg font-bold rounded-xl"
                            value={questionForm.correctAnswer}
                            onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-red-300">Wrong Answer 1</label>
                          <Input
                            placeholder="Deceptive..."
                            className="bg-[#e21b3c] border-none text-white placeholder:text-white/60 h-14 text-lg font-bold rounded-xl"
                            value={questionForm.wrongAnswer1}
                            onChange={(e) => setQuestionForm({ ...questionForm, wrongAnswer1: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-orange-300">Wrong Answer 2</label>
                          <Input
                            placeholder="Tricky..."
                            className="bg-[#d89e00] border-none text-white placeholder:text-white/60 h-14 text-lg font-bold rounded-xl"
                            value={questionForm.wrongAnswer2}
                            onChange={(e) => setQuestionForm({ ...questionForm, wrongAnswer2: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-blue-300">Wrong Answer 3</label>
                          <Input
                            placeholder="Almost..."
                            className="bg-[#1368ce] border-2 border-white/20 text-white placeholder:text-white/60 h-14 text-lg font-bold rounded-xl"
                            value={questionForm.wrongAnswer3}
                            onChange={(e) => setQuestionForm({ ...questionForm, wrongAnswer3: e.target.value })}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleAddQuestion}
                        disabled={addQuestionMutation.isPending}
                        className="w-full bg-white text-[#1368ce] p-6 rounded-2xl font-black text-2xl shadow-[0_6px_0_0_#cbd5e1] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {addQuestionMutation.isPending ? <Loader2 className="w-8 h-8 animate-spin" /> : "FORGE QUESTION"}
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </div>

          {/* Right Column: Question List */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black uppercase tracking-widest text-purple-200">Question Bank</h2>
                <div className="h-px flex-1 mx-6 bg-white/10" />
              </div>

              <AnimatePresence mode="popLayout">
                {questionsQuery.isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
                    <p className="font-bold text-purple-200">Gathering your data...</p>
                  </div>
                ) : questionsQuery.data && questionsQuery.data.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {questionsQuery.data.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-2xl p-6 transition-all"
                      >
                        <div className="flex gap-6">
                          <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-black text-2xl text-yellow-400">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-4">
                            <p className="text-xl font-bold leading-tight group-hover:text-yellow-400 transition-colors">
                              {question.questionText}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <div className="px-3 py-2 bg-[#26890c]/20 border border-[#26890c]/40 rounded-lg text-[#4ade80] text-xs font-bold truncate">
                                {question.correctAnswer}
                              </div>
                              <div className="px-3 py-2 bg-[#e21b3c]/10 border border-[#e21b3c]/20 rounded-lg text-[#f87171] text-xs font-bold truncate">
                                {question.wrongAnswer1}
                              </div>
                              <div className="px-3 py-2 bg-[#e21b3c]/10 border border-[#e21b3c]/20 rounded-lg text-[#f87171] text-xs font-bold truncate">
                                {question.wrongAnswer2}
                              </div>
                              <div className="px-3 py-2 bg-[#e21b3c]/10 border border-[#e21b3c]/20 rounded-lg text-[#f87171] text-xs font-bold truncate">
                                {question.wrongAnswer3}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem]"
                  >
                    <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Brain className="w-10 h-10 text-purple-300" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">Your bank is empty!</h3>
                    <p className="text-purple-200 font-medium">Add some questions to start your solo journey.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-12 text-center opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-sm font-black tracking-[0.3em] uppercase">Powered by K-Quiz Engine</p>
      </footer>
    </div>
  );
}