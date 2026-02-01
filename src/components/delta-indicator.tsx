import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeltaIndicatorProps {
  current: string | null;
  previous: string | null;
  unit?: string;
  className?: string;
}

export function DeltaIndicator({
  current,
  previous,
  unit = "",
  className
}: DeltaIndicatorProps) {
  // Return null if no data to compare
  if (!current || !previous) return null;

  // Calculate delta
  const delta = parseFloat(current) - parseFloat(previous);

  // Return null for zero change
  if (delta === 0) return null;

  // Determine styling
  const isIncrease = delta > 0;
  const Icon = isIncrease ? ArrowUp : ArrowDown;
  const colorClass = isIncrease ? "text-orange-600" : "text-green-600";
  const sign = isIncrease ? "+" : "";

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", colorClass, className)}>
      <Icon className="w-3 h-3" />
      <span>{sign}{delta.toFixed(2)} {unit}</span>
    </span>
  );
}
