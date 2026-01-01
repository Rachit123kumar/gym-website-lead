import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { leadId, recipientEmail, recipientName, emailBody, subject } = await request.json()

  if (!leadId || !recipientEmail || !emailBody) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Send email via Gmail
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: subject || "Partnership Opportunity",
      html: `<p>${emailBody}</p>`,
    })

    // Get or create email thread
    const emailThread = await supabase.from("email_threads").select("*").eq("lead_id", leadId).single()

    if (emailThread.data) {
      // Update existing thread
      const threadData = emailThread.data.thread_data || []
      threadData.push({
        from: process.env.GMAIL_USER,
        to: recipientEmail,
        subject: subject || "Partnership Opportunity",
        body: emailBody,
        timestamp: new Date().toISOString(),
        type: "sent",
        messageId: info.messageId,
      })

      await supabase.from("email_threads").update({ thread_data: threadData }).eq("id", emailThread.data.id)
    } else {
      // Create new thread
      await supabase.from("email_threads").insert({
        lead_id: leadId,
        thread_data: [
          {
            from: process.env.GMAIL_USER,
            to: recipientEmail,
            subject: subject || "Partnership Opportunity",
            body: emailBody,
            timestamp: new Date().toISOString(),
            type: "sent",
            messageId: info.messageId,
          },
        ],
      })
    }

    // Update lead status
    await supabase
      .from("leads")
      .update({ email_status: "sent", last_updated: new Date().toISOString() })
      .eq("id", leadId)

    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
