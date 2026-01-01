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
import { Loader2, Zap } from "lucide-react"

interface GenerateEmailDialogProps {
  gymName: string
  gymWebsite?: string | null
  onEmailGenerated: (email: string) => void
}

export function GenerateEmailDialog({ gymName, gymWebsite, onEmailGenerated }: GenerateEmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/email/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymName, gymWebsite }),
      })

      if (!response.ok) throw new Error("Failed to generate email")
      const data = await response.json()
      setEmail(data.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseEmail = () => {
    onEmailGenerated(email)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Zap className="mr-2 h-4 w-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Email with AI</DialogTitle>
          <DialogDescription>Create a personalized pitch for {gymName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!email ? (
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Email
                </>
              )}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Email Body</Label>
                <Textarea
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  rows={8}
                  placeholder="Edit the generated email..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEmail("")
                    setError(null)
                  }}
                >
                  Clear
                </Button>
                <Button onClick={handleUseEmail}>Use This Email</Button>
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
