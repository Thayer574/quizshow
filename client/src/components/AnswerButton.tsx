import { Button } from "@/components/ui/button";
import { ANSWER_COLORS } from "@shared/gameConstants";
import { cn } from "@/lib/utils";

interface AnswerButtonProps {
  index: number;
  text: string;
  onClick: () => void;
  disabled?: boolean;
  isSelected?: boolean;
  isCorrect?: boolean;
  showResult?: boolean;
}

export function AnswerButton({
  index,
  text,
  onClick,
  disabled = false,
  isSelected = false,
  isCorrect = false,
  showResult = false,
}: AnswerButtonProps) {
  const color = ANSWER_COLORS[index % 4];

  const baseClasses = "h-24 text-lg font-semibold rounded-lg transition-all relative overflow-hidden";
  const colorClasses = {
    red: "bg-red-500 hover:bg-red-600 text-white",
    blue: "bg-blue-500 hover:bg-blue-600 text-white",
    yellow: "bg-yellow-500 hover:bg-yellow-600 text-gray-900",
    green: "bg-green-500 hover:bg-green-600 text-white",
  };

  const stateClasses = showResult
    ? isCorrect
      ? "ring-4 ring-green-300 bg-green-600"
      : isSelected
        ? "ring-4 ring-red-300 bg-red-600 opacity-50"
        : "opacity-50"
    : isSelected
      ? "ring-4 ring-yellow-300 scale-105"
      : "";

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        colorClasses[color.name as keyof typeof colorClasses],
        stateClasses,
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <span className="text-3xl">{color.symbol}</span>
        <span className="text-sm">{text}</span>
      </div>
    </Button>
  );
}
