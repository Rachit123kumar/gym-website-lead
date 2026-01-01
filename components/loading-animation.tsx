"use client"

import { Spinner } from "@/components/ui/spinner"

interface LoadingAnimationProps {
  isLoading: boolean
  message?: string
}

export function LoadingAnimation({ isLoading, message = "Loading..." }: LoadingAnimationProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8" />
        <p className="text-foreground font-medium">{message}</p>
      </div>
    </div>
  )
}
