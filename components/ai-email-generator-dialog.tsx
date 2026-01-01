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
import { Spinner } from "@/components/ui/spinner"
import { Sparkles, Copy, Check } from "lucide-react"

interface AIEmailGeneratorDialogProps {
  leadId: string
  gymName: string
  gymEmail: string
  gymCity: string
  notes: string
  category: string
  onEmailGenerated: (email: string) => void
}

export function AIEmailGeneratorDialog({
  leadId,
  gymName,
  gymEmail,
  gymCity,
  notes,
  category,
  onEmailGenerated,
}: AIEmailGeneratorDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/email/generate-with-chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          gymName,
          gymEmail,
          gymCity,
          notes,
          category: category || "General",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to generate email")
      }

      const data = await response.json()
      setGeneratedEmail(data.email)
      onEmailGenerated(data.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (generatedEmail) {
      navigator.clipboard.writeText(generatedEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="mr-2 h-4 w-4" />
          AI Generate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Email Generator</DialogTitle>
          <DialogDescription>Generate a personalized email for {gymName}</DialogDescription>
        </DialogHeader>

        {!generatedEmail ? (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium">Gym Information:</p>
              <p>
                <span className="text-muted-foreground">Name:</span> {gymName}
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span> {gymEmail}
              </p>
              {gymCity && (
                <p>
                  <span className="text-muted-foreground">City:</span> {gymCity}
                </p>
              )}
              {category && (
                <p>
                  <span className="text-muted-foreground">Category:</span> {category}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Email
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg max-h-[300px] overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{generatedEmail}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1 bg-transparent">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setGeneratedEmail(null)
                  setOpen(false)
                }}
                className="flex-1"
              >
                Use This Email
              </Button>
            </div>

            <Button onClick={handleGenerate} variant="outline" className="w-full bg-transparent">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Different
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
