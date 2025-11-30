import { cn } from "../../src/lib/utils"
import type { ReactNode } from "react"

interface BaseCardProps {
  children: ReactNode
  className?: string
  variant?: "default" | "glass" | "gradient"
  hover?: boolean
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function BaseCard({ children, className, variant = "default", hover = true }: BaseCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-300",
        {
          "bg-card text-card-foreground shadow-soft": variant === "default",
          glass: variant === "glass",
          "gradient-border": variant === "gradient",
          "hover:shadow-hard hover:-translate-y-1": hover,
        },
        className,
      )}
    >
      {children}
    </div>
  )
}
