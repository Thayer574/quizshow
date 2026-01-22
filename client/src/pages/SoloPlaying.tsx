import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnswerButton } from "@/components/AnswerButton";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { QUESTION_TIME_LIMIT, POINTS_PER_CORRECT, MAX_SPEED_BONUS } from "@shared/gameConstants";

export default function SoloPlaying() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  const questionsQuery = trpc.question.getUserQuestions.useQuery(undefined, {
    enabled: !!user, // Only fetch questions if user is authenticated
  });
  const questions = questionsQuery.data || [];
  const currentQuestion = questions[currentQuestionIndex];

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
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (answer && currentQuestion) {
      const isCorrect = answer === currentQuestion.correctAnswer;
      if (isCorrect) {
        const speedBonus = Math.floor((timeLeft / QUESTION_TIME_LIMIT) * MAX_SPEED_BONUS);
        const points = POINTS_PER_CORRECT + speedBonus;
        setScore((prev) => prev + points);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
    } else {
      // Game finished - store score and navigate
      sessionStorage.setItem("soloGameScore", score.toString());
      setLocation("/solo/results");
    }
  };

  if (loading || questionsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">No questions found</p>
            <Button
              onClick={() => setLocation("/solo")}
              className="w-full mt-4"
            >
              Back to Solo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">K-Quiz</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-3xl font-bold text-blue-600">{score.toLocaleString()}</p>
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

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl">{currentQuestion.questionText}</CardTitle>
            <div
              className={`text-4xl font-bold ${
                timeLeft <= 5 ? "text-red-600 animate-pulse" : "text-blue-600"
              }`}
            >
              {timeLeft}s
            </div>
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
            {isCorrect && (
              <p className="text-lg text-blue-600 mb-6">
                +{(POINTS_PER_CORRECT + Math.floor((timeLeft / QUESTION_TIME_LIMIT) * MAX_SPEED_BONUS)).toLocaleString()} points
              </p>
            )}
            <Button
              onClick={handleNextQuestion}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
            >
              {currentQuestionIndex === questions.length - 1 ? "Show Results" : "Next Question"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
