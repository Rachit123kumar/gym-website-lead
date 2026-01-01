"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Mail } from "lucide-react"

interface ReplyDialogProps {
  leadId: string
  recipientEmail: string
  gymName: string
  onReplySent: () => void
}

export function ReplyDialog({ leadId, recipientEmail, gymName, onReplySent }: ReplyDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [replyBody, setReplyBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSendReply = async () => {
    if (!replyBody.trim()) {
      setError("Reply cannot be empty")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/email/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          recipientEmail,
          replyBody,
        }),
      })

      if (!response.ok) throw new Error("Failed to send reply")
      setSuccess(true)
      setReplyBody("")
      onReplySent()
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Reply
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reply to {gymName}</DialogTitle>
          <DialogDescription>Send a reply to {recipientEmail}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-lg font-semibold">Reply sent successfully!</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="reply">Reply Message</Label>
              <Textarea
                id="reply"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={6}
                placeholder="Write your reply..."
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendReply} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
