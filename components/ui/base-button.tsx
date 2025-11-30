"use client"

import { cn } from "../../src/lib/utils"
import type { ReactNode } from "react"

interface BaseButtonProps {
  children: ReactNode
  className?: string
  variant?: "primary" | "secondary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export function BaseButton({
  children,
  className,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  type = "button",
}: BaseButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        {
          "btn-primary": variant === "primary",
          "btn-secondary": variant === "secondary",
          "bg-transparent hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
          "h-8 px-3 text-sm": size === "sm",
          "h-10 px-4": size === "md",
          "h-12 px-6 text-lg": size === "lg",
        },
        className,
      )}
    >
      {children}
    </button>
  )
}
