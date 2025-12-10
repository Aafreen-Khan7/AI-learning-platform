import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  className?: string
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full bg-muted rounded-full overflow-hidden", className)}>
      <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${value}%` }} />
    </div>
  )
}
