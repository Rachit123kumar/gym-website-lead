"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { EmailThreadViewer } from "@/components/email-thread-viewer"
import { GenerateEmailDialog } from "@/components/generate-email-dialog"
import { SendEmailDialog } from "@/components/send-email-dialog"
import { ReplyDialog } from "@/components/reply-dialog"
import { FollowUpDialog } from "@/components/follow-up-dialog"
import { SyncGmailButton } from "@/components/sync-gmail-button"

interface Lead {
  id: string
  gym_name: string
  email: string
  phone: string | null
  website: string | null
  city: string | null
  state: string | null
  notes: string | null
  email_status: string
  follow_up_count: number
}

export default function LeadDetailPage() {
  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [emailBody, setEmailBody] = useState("")
  const router = useRouter()
  const params = useParams()
  const leadId = params.id as string

  useEffect(() => {
    if (leadId) {
      fetchLead()
    }
  }, [leadId])

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${leadId}`)
      if (!response.ok) throw new Error("Lead not found")
      const data = await response.json()
      setLead(data)
    } catch (error) {
      console.error("Error fetching lead:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading lead details...</p>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Lead not found</p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "replied":
        return "bg-green-100 text-green-800"
      case "bounced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="px-2 sm:px-4">
                <ArrowLeft className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-balance">{lead.gym_name}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Left Column - Lead Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Lead Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-mono text-xs sm:text-sm break-all">{lead.email}</p>
                </div>

                {lead.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-mono text-xs sm:text-sm">{lead.phone}</p>
                  </div>
                )}

                {lead.website && (
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs sm:text-sm truncate"
                    >
                      {lead.website}
                    </a>
                  </div>
                )}

                {(lead.city || lead.state) && (
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-xs sm:text-sm">
                      {lead.city}
                      {lead.city && lead.state ? ", " : ""}
                      {lead.state}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground">Email Status</p>
                  <Badge className={`mt-2 text-xs ${getStatusColor(lead.email_status)}`}>
                    {lead.email_status.replace("_", " ")}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Follow-ups</p>
                  <p className="text-sm font-semibold">{lead.follow_up_count}</p>
                </div>

                {lead.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-xs sm:text-sm">{lead.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Email Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Send Email</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Generate AI-powered email or compose manually
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <GenerateEmailDialog
                    gymName={lead.gym_name}
                    gymWebsite={lead.website}
                    onEmailGenerated={(email) => setEmailBody(email)}
                  />
                  <SendEmailDialog
                    leadId={lead.id}
                    recipientEmail={lead.email}
                    gymName={lead.gym_name}
                    onEmailSent={fetchLead}
                  />
                  <ReplyDialog
                    leadId={lead.id}
                    recipientEmail={lead.email}
                    gymName={lead.gym_name}
                    onReplySent={fetchLead}
                  />
                  <FollowUpDialog
                    leadId={lead.id}
                    recipientEmail={lead.email}
                    gymName={lead.gym_name}
                    onFollowUpSent={fetchLead}
                  />
                  <SyncGmailButton onSync={fetchLead} />
                </div>
              </CardContent>
            </Card>

            {/* Email Thread */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Email Thread</CardTitle>
                <CardDescription className="text-xs sm:text-sm">View all sent emails and replies</CardDescription>
              </CardHeader>
              <CardContent>
                <EmailThreadViewer leadId={lead.id} recipientEmail={lead.email} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
