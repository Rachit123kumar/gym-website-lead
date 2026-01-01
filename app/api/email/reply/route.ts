import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

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

  const { leadId, recipientEmail, replyBody } = await request.json()

  if (!leadId || !recipientEmail || !replyBody) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Verify user owns this lead
    const leadCheck = await supabase.from("leads").select("id").eq("id", leadId).eq("user_id", user.id).single()

    if (leadCheck.error || !leadCheck.data) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Send reply email via Gmail
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: "Re: Partnership Opportunity",
      html: `<p>${replyBody}</p>`,
      inReplyTo: `<lead-${leadId}@gym-leads>`,
    })

    // Update email thread with reply
    const threadData = await supabase.from("email_threads").select("thread_data").eq("lead_id", leadId).single()

    const updatedThread = threadData.data?.thread_data || []
    updatedThread.push({
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: "Re: Partnership Opportunity",
      body: replyBody,
      timestamp: new Date().toISOString(),
      type: "reply",
      messageId: info.messageId,
    })

    await supabase.from("email_threads").update({ thread_data: updatedThread }).eq("lead_id", leadId)

    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (error) {
    console.error("Error sending reply:", error)
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 })
  }
}
