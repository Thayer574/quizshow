import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Loader2, Play, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
    enabled: !!user, // Only fetch questions if user is authenticated
  });

  const addQuestionMutation = trpc.question.add.useMutation({
    onSuccess: () => {
      toast.success("Question added!");
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
      console.error("Error adding question:", error);
      // Check if it's an auth error
      if (error?.data?.code === "UNAUTHORIZED") {
        toast.error("Your session has expired. Please log in again.");
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
      toast.error("Please fill in all fields");
      return;
    }

    addQuestionMutation.mutate({
      ...questionForm,
      // roomId is undefined for solo mode
    });
  };

  const handleStartGame = () => {
    if (!questionsQuery.data || questionsQuery.data.length === 0) {
      toast.error("Please add at least one question before starting");
      return;
    }
    setLocation("/solo/playing");
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Button
                variant="ghost"
                onClick={() => setLocation("/role-select")}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">K-Quiz</h1>
              <p className="text-gray-600">Solo Mode</p>
            </div>
            {questionsQuery.data && questionsQuery.data.length > 0 && (
              <Button
                onClick={handleStartGame}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Questions ({questionsQuery.data?.length || 0})</CardTitle>
              <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add a Question</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Question</label>
                      <Textarea
                        placeholder="What is the capital of France?"
                        value={questionForm.questionText}
                        onChange={(e) =>
                          setQuestionForm({ ...questionForm, questionText: e.target.value })
                        }
                        disabled={addQuestionMutation.isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Correct Answer</label>
                      <Input
                        placeholder="Paris"
                        value={questionForm.correctAnswer}
                        onChange={(e) =>
                          setQuestionForm({ ...questionForm, correctAnswer: e.target.value })
                        }
                        disabled={addQuestionMutation.isPending}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Wrong Answer 1</label>
                        <Input
                          placeholder="London"
                          value={questionForm.wrongAnswer1}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, wrongAnswer1: e.target.value })
                          }
                          disabled={addQuestionMutation.isPending}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Wrong Answer 2</label>
                        <Input
                          placeholder="Berlin"
                          value={questionForm.wrongAnswer2}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, wrongAnswer2: e.target.value })
                          }
                          disabled={addQuestionMutation.isPending}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Wrong Answer 3</label>
                        <Input
                          placeholder="Rome"
                          value={questionForm.wrongAnswer3}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, wrongAnswer3: e.target.value })
                          }
                          disabled={addQuestionMutation.isPending}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleAddQuestion}
                      disabled={addQuestionMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {addQuestionMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Add Question
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {questionsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : questionsQuery.data && questionsQuery.data.length > 0 ? (
              <div className="space-y-3">
                {questionsQuery.data.map((question, index) => (
                  <div key={question.id} className="p-4 bg-gray-50 rounded-lg border">
                    <p className="font-medium mb-2">
                      {index + 1}. {question.questionText}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-green-50 rounded text-green-700">
                        ✓ {question.correctAnswer}
                      </div>
                      <div className="p-2 bg-red-50 rounded text-red-700">
                        ✗ {question.wrongAnswer1}
                      </div>
                      <div className="p-2 bg-red-50 rounded text-red-700">
                        ✗ {question.wrongAnswer2}
                      </div>
                      <div className="p-2 bg-red-50 rounded text-red-700">
                        ✗ {question.wrongAnswer3}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No questions yet. Add your first question to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
