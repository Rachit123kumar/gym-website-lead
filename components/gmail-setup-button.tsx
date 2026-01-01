"use client"

import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export function GmailSetupButton() {
  const handleConnect = () => {
    window.location.href = "/api/auth/gmail"
  }

  return (
    <Button onClick={handleConnect} variant="outline" size="sm">
      <Mail className="h-4 w-4 mr-2" />
      Connect Gmail
    </Button>
  )
}
