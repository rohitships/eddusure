import { cn } from "@/lib/utils";

type ScoreCircleProps = {
  score: number;
  className?: string;
};

export default function ScoreCircle({ score, className }: ScoreCircleProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let colorClass = 'text-green-500';
  if (score < 70) colorClass = 'text-amber-500';
  if (score < 40) colorClass = 'text-red-500';

  return (
    <div className={cn("relative h-40 w-40", className)}>
      <svg className="h-full w-full" viewBox="0 0 140 140">
        <circle
          className="text-muted"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
        />
        <circle
          className={cn("transition-all duration-1000 ease-out", colorClass)}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-bold", colorClass)}>
          {score}
          <span className="text-2xl">%</span>
        </span>
        <span className="text-xs font-medium text-muted-foreground">TrustScore</span>
      </div>
    </div>
  );
}
