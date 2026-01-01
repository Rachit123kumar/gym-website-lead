"use client"

import { useEffect, useRef, useCallback } from "react"

interface UseReplyPollingProps {
  leadId: string
  enabled?: boolean
  interval?: number
  onNewReply?: () => void
}

export function useReplyPolling({ leadId, enabled = true, interval = 30000, onNewReply }: UseReplyPollingProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckRef = useRef<number>(0)

  const syncReplies = useCallback(async () => {
    if (!leadId || !enabled) return

    try {
      const response = await fetch(`/api/email/threads/${leadId}`)
      if (!response.ok) throw new Error("Failed to sync replies")

      const data = await response.json()
      const hasNewReplies = data.hasNew || false

      if (hasNewReplies) {
        onNewReply?.()
      }

      lastCheckRef.current = Date.now()
    } catch (error) {
      console.error("Error syncing replies:", error)
    }
  }, [leadId, enabled, onNewReply])

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    // Initial sync
    syncReplies()

    // Set up polling
    intervalRef.current = setInterval(syncReplies, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, interval, syncReplies])

  return { syncReplies }
}
