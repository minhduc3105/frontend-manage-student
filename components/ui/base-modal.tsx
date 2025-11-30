"use client"

import type { ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "../../src/lib/utils"

interface BaseModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export function BaseModal({ open, onClose, children, title, className, size = "md" }: BaseModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "glass-card relative max-h-[90vh] overflow-y-auto",
              {
                "w-[90vw] max-w-sm": size === "sm",
                "w-[90vw] max-w-md": size === "md",
                "w-[90vw] max-w-2xl": size === "lg",
                "w-[90vw] max-w-4xl": size === "xl",
                "w-[95vw] h-[95vh]": size === "full",
              },
              className,
            )}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-balance">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
