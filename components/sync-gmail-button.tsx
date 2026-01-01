"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SyncGmailButtonProps {
  onSync?: () => void
}

export function SyncGmailButton({ onSync }: SyncGmailButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/email/sync", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Gmail Not Connected",
            description: "Please connect your Gmail account first.",
            variant: "destructive",
          })
        } else {
          throw new Error(data.error)
        }
      } else {
        toast({
          title: "Sync Complete",
          description: `Synced ${data.syncedCount} new replies.`,
        })
        onSync?.()
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync emails",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={isSyncing} variant="outline" size="sm">
      <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Syncing..." : "Sync Replies"}
    </Button>
  )
}
