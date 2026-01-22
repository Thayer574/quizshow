import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnswerButton } from "@/components/AnswerButton";
import { trpc } from "@/lib/trpc";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { QUESTION_TIME_LIMIT, POINTS_PER_CORRECT, MAX_SPEED_BONUS } from "@shared/gameConstants";

export default function Playing() {
  const { code } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [playerRank, setPlayerRank] = useState<number | null>(null);

  const recordAnswerMutation = trpc.game.recordAnswer.useMutation();
  const advanceQuestionMutation = trpc.room.advanceQuestion.useMutation({
    onSuccess: () => {
      roomQuery.refetch();
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
    }
  });

  // Fetch room and questions
  const roomQuery = trpc.room.getByCode.useQuery(
    { code: code || "" },
    { refetchInterval: 2000 } // Poll for question changes
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
  
  // Reset local state when the room's question index changes (detected via polling)
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimeLeft(QUESTION_TIME_LIMIT);
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];
  const isOwner = user?.id === roomQuery.data?.ownerId;

  // Shuffle answers when question changes
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

  // Timer logic
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

    // Record answer
    if (user) {
      const isCorrect = answer === currentQuestion.correctAnswer;
      const pointsEarned = isCorrect
        ? POINTS_PER_CORRECT + Math.floor((timeLeft / QUESTION_TIME_LIMIT) * MAX_SPEED_BONUS)
        : 0;

      recordAnswerMutation.mutate({
        gameSessionId: roomQuery.data?.id || 0, // In this simplified version we use roomId as sessionId for ease
        questionId: currentQuestion.id,
        selectedAnswer: answer || "timeout",
        isCorrect,
        pointsEarned,
        timeToAnswer: (QUESTION_TIME_LIMIT - timeLeft) * 1000,
      });
    }
  };

  const handleNextQuestion = () => {
    if (isOwner && roomQuery.data) {
      advanceQuestionMutation.mutate({ roomId: roomQuery.data.id });
    }
  };

  if (roomQuery.isLoading || questionsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Question not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">K-Quiz</h1>
              <p className="text-gray-600">Room: <span className="font-bold text-blue-600">{code}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 flex items-center gap-2 justify-end mb-2">
                <Users className="w-4 h-4" />
                {membersQuery.data?.length || 0} players
              </p>
              <div
                className={`text-4xl font-bold ${
                  timeLeft <= 5 ? "text-red-600 animate-pulse" : "text-blue-600"
                }`}
              >
                {timeLeft}s
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Question Area */}
          <div className="lg:col-span-2">
            {/* Question Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">{currentQuestion.questionText}</CardTitle>
              </CardHeader>
            </Card>

            {/* Answer Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {shuffledAnswers.map((answer, index) => (
                <AnswerButton
                  key={index}
                  index={index}
                  text={answer}
                  onClick={() => handleAnswer(answer)}
                  disabled={isAnswered}
                  isSelected={selectedAnswer === answer}
                  isCorrect={answer === currentQuestion.correctAnswer}
                  showResult={isAnswered}
                />
              ))}
            </div>

            {/* Feedback and Next Button */}
            {isAnswered && (
              <div className="text-center">
                <div
                  className={`text-2xl font-bold mb-4 ${
                    isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCorrect ? "✓ Correct!" : selectedAnswer === null ? "⏰ Time's up!" : "✗ Incorrect"}
                </div>
                {isOwner && (
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                  >
                    {currentQuestionIndex === questions.length - 1 ? "Show Leaderboard" : "Next Question"}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {membersQuery.data?.map((member, index) => (
                    <div
                      key={member.id}
                      className={`p-3 rounded-lg flex justify-between items-center ${
                        member.userId === user?.id
                          ? "bg-blue-100 border-2 border-blue-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{index + 1}. {member.name}</p>
                        <p className="text-xs text-gray-500">
                          {member.userId === user?.id ? "You" : ""}
                        </p>
                      </div>
                      <p className="font-bold text-lg">0</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
