import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function WaitingRoom() {
  const { code } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
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
    { enabled: !!roomQuery.data?.id }
  );
  const questionsQuery = trpc.question.getRoomQuestions.useQuery(
    { roomId: roomQuery.data?.id || 0 },
    { enabled: !!roomQuery.data?.id }
  );

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
      toast.error("Please fill in all fields");
      return;
    }

    addQuestionMutation.mutate({
      ...questionForm,
      roomId: roomQuery.data?.id,
    });
  };

  const handleStartGame = () => {
    if (!questionsQuery.data || questionsQuery.data.length === 0) {
      toast.error("Please add at least one question before starting");
      return;
    }
    setLocation(`/room/${code}/playing`);
  };

  const isOwner = user?.id === roomQuery.data?.ownerId;

  if (roomQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!roomQuery.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Room not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">K-Quiz</h1>
              <p className="text-gray-600">Room Code: <span className="font-bold text-blue-600">{code}</span></p>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  onClick={handleStartGame}
                  disabled={!questionsQuery.data || questionsQuery.data.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Start Game
                </Button>
                <Button
                  onClick={() => {
                    if (confirm("Are you sure you want to end this room? All players will be disconnected.")) {
                      setLocation("/");
                    }
                  }}
                  variant="destructive"
                >
                  End Room
                </Button>
              </div>
            )}
            {!isOwner && (
              <Button
                onClick={() => {
                  if (confirm("Are you sure you want to leave this room?")) {
                    setLocation("/");
                  }
                }}
                variant="outline"
              >
                Leave Room
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Players Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players ({membersQuery.data?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {membersQuery.data?.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(member.joinedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions Section */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Questions ({questionsQuery.data?.length || 0})</CardTitle>
                  <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
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
                <div className="space-y-3">
                  {questionsQuery.data?.map((question, index) => (
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
