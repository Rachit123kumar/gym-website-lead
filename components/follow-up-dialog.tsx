"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send } from "lucide-react"

interface FollowUpDialogProps {
  leadId: string
  recipientEmail: string
  gymName: string
  onFollowUpSent: () => void
}

export function FollowUpDialog({ leadId, recipientEmail, gymName, onFollowUpSent }: FollowUpDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [stage, setStage] = useState<"generate" | "review" | "sent">("generate")

  const handleGenerateFollowUp = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/email/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          gymName,
          recipientEmail,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate follow-up")
      const data = await response.json()
      setGeneratedEmail(data.email)
      setStage("review")
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmFollowUp = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // The follow-up was already sent in the generate API call
      // Just update UI
      setStage("sent")
      onFollowUpSent()
      setTimeout(() => {
        setOpen(false)
        setStage("generate")
        setGeneratedEmail("")
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
        <Button variant="outline" size="sm">
          <Send className="mr-2 h-4 w-4" />
          Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Follow-up Email</DialogTitle>
          <DialogDescription>Auto-generate and send a follow-up to {gymName}</DialogDescription>
        </DialogHeader>

        {stage === "sent" ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-lg font-semibold">Follow-up sent successfully!</div>
          </div>
        ) : stage === "generate" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to generate an AI-powered follow-up email automatically.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleGenerateFollowUp} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate & Send Follow-up
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Generated Follow-up Email</Label>
              <Textarea value={generatedEmail} readOnly rows={6} className="resize-none" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStage("generate")
                  setGeneratedEmail("")
                }}
              >
                Back
              </Button>
              <Button onClick={handleConfirmFollowUp} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Confirm & Send
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
