import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Home } from "lucide-react";
import { useEffect, useState } from "react";

export default function SoloResults() {
  const [location, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [score, setScore] = useState(0);

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
      sessionStorage.removeItem("soloGameScore");
    }

    // Also try URL params as fallback
    const params = new URLSearchParams(window.location.search);
    const urlScore = parseInt(params.get("score") || "0", 10);
    if (urlScore > 0) {
      setScore(urlScore);
    }
  }, []);

  const handlePlayAgain = () => {
    setLocation("/solo");
  };

  const handleHome = () => {
    setLocation("/role-select");
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl mb-2">🎉 Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-gray-600 mb-2">Final Score</p>
            <p className="text-6xl font-bold text-green-600">{score.toLocaleString()}</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handlePlayAgain}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button
              onClick={handleHome}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
