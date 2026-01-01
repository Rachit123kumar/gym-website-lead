"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Loader2, Send } from "lucide-react"

interface SendEmailDialogProps {
  leadId: string
  recipientEmail: string
  gymName: string
  onEmailSent: () => void
}

export function SendEmailDialog({ leadId, recipientEmail, gymName, onEmailSent }: SendEmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailBody, setEmailBody] = useState("")
  const [subject, setSubject] = useState("Partnership Opportunity")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSend = async () => {
    if (!emailBody.trim()) {
      setError("Email body cannot be empty")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          recipientEmail,
          recipientName: gymName,
          emailBody,
          subject,
        }),
      })

      if (!response.ok) throw new Error("Failed to send email")
      setSuccess(true)
      setEmailBody("")
      onEmailSent()
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
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Send Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Email to {gymName}</DialogTitle>
          <DialogDescription>Compose and send an email to {recipientEmail}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-lg font-semibold">Email sent successfully!</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={8}
                placeholder="Write your email here..."
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
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
