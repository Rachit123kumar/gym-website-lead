"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Copy, Check } from "lucide-react"
import { formatEmailDate } from "@/lib/utils/email"

interface EmailMessage {
  from: string
  to: string
  subject: string
  body: string
  timestamp: string
  type: "sent" | "reply"
  messageId?: string
}

interface EmailThreadViewerProps {
  leadId: string
  recipientEmail: string
}

export function EmailThreadViewer({ leadId, recipientEmail }: EmailThreadViewerProps) {
  const [thread, setThread] = useState<EmailMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchThread()
  }, [leadId])

  const fetchThread = async () => {
    try {
      const response = await fetch(`/api/email/threads/${leadId}`)
      if (!response.ok) throw new Error("Failed to fetch thread")
      const data = await response.json()
      setThread(data.thread_data || [])
    } catch (error) {
      console.error("Error fetching thread:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading email thread...</div>
  }

  if (thread.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-8 text-center">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No emails sent yet. Generate and send an email to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {thread.map((message, idx) => (
        <Card key={idx}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={message.type === "sent" ? "default" : "secondary"}>
                    {message.type === "sent" ? "Sent" : "Reply"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatEmailDate(new Date(message.timestamp))}</span>
                </div>
                <p className="text-sm font-medium">
                  {message.type === "sent" ? `To: ${message.to}` : `From: ${message.from}`}
                </p>
                <p className="text-sm text-muted-foreground">{message.subject}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(message.body, idx.toString())}
                title="Copy email body"
              >
                {copiedId === idx.toString() ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded p-4 text-sm whitespace-pre-wrap">{message.body}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
