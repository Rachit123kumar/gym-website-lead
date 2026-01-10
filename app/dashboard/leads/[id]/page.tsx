"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import PhoneActions from "@/components/copybtn"
import { EmailThreadViewer } from "@/components/email-thread-viewer"
import { GenerateEmailDialog } from "@/components/generate-email-dialog"
import { SendEmailDialog } from "@/components/send-email-dialog"
import { ReplyDialog } from "@/components/reply-dialog"
import { FollowUpDialog } from "@/components/follow-up-dialog"
import { SyncGmailButton } from "@/components/sync-gmail-button"

// NEW: HTML Email Editor component
function HtmlEmailEditor({
  gymName,
  gymWebsite,
  leadId,
  recipientEmail,
  onSend,
}: {
  gymName: string
  gymWebsite?: string | null
  leadId: string
  recipientEmail: string
  onSend: (html: string) => void
}) {
  const [emailHtml, setEmailHtml] = useState(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Website Redesign Demo</title>
</head>
<body style="margin:0; padding:0; background:#f5f7fa; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa; padding:20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:30px;">

          <tr>
            <td style="font-size:16px; color:#333333;">
              <p>Hi,</p>

              <p>
                I was reviewing your plumbing website and noticed that the design looks a bit outdated compared to
                modern business websites today.
              </p>

              <p>
                So I created a <strong>modern, mobile-friendly demo redesign</strong> to show how your website
                could look with a cleaner layout, faster loading speed, and clearer call-to-action buttons.
              </p>

              <p style="margin:20px 0; text-align:center;">
                <a href="https://fitness-ecru-alpha.vercel.app/plumberone"
                   target="_blank"
                   style="background:#2563eb; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:6px; font-weight:bold;">
                  View Live Demo Website
                </a>
              </p>

              <p>
                This type of redesign helps visitors quickly understand your services and makes it easier for them
                to call or message you.
              </p>

              <p>
                If you like this direction, I’d be happy to customize it specifically for your business.
                No obligation — this demo is just to give you an idea.
              </p>

              <p style="margin-top:25px;">
                Best regards,<br />
                <strong>Bittu</strong><br />
                Web Designer
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>

  `)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Editor (HTML)</CardTitle>
        <CardDescription>Edit your HTML email and preview it below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          className="w-full h-60 p-3 border rounded-md font-mono text-sm resize-none"
          value={emailHtml}
          onChange={(e) => setEmailHtml(e.target.value)}
        />

        <div className="border rounded-md p-4 bg-gray-50 text-gray-800">
          <h4 className="font-semibold mb-2">Preview:</h4>
          <div
            className="overflow-auto"
            style={{ minHeight: "200px" }}
            dangerouslySetInnerHTML={{ __html: emailHtml }}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => navigator.clipboard.writeText(emailHtml)}
          >
            Copy HTML
          </Button>
          <Button onClick={() => onSend(emailHtml)}>Send Email</Button>
        </div>
      </CardContent>
    </Card>
  )
}

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
  const router = useRouter()
  const params = useParams()
  const leadId = params.id as string

  useEffect(() => {
    if (leadId) fetchLead()
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

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading lead details...</p>
      </div>
    )

  if (!lead)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Lead not found</p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    )

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
        <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="px-2 sm:px-4 flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-balance">{lead.gym_name}</h1>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Left: Lead Info */}
          <div className="lg:col-span-1 space-y-6">
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
                    <PhoneActions phone={lead.phone} />
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

          {/* Right: Email + Thread */}
          <div className="lg:col-span-2 space-y-6">
            {/* HTML Email Editor */}
            <HtmlEmailEditor
              gymName={lead.gym_name}
              gymWebsite={lead.website}
              leadId={lead.id}
              recipientEmail={lead.email}
              onSend={(html) => {
                // Here you can use your SendEmailDialog API or fetch
                console.log("Sending email HTML:", html)
              }}
            />

            {/* Email Thread */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Email Thread</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View all sent emails and replies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailThreadViewer leadId={lead.id} recipientEmail={lead.email} />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Generate AI email, reply, follow-up or sync Gmail
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <GenerateEmailDialog
                  gymName={lead.gym_name}
                  gymWebsite={lead.website}
                  onEmailGenerated={(email) => console.log("Generated:", email)}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
