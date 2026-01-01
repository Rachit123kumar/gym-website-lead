import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
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

  const { leadId, gymName, recipientEmail } = await request.json()

  if (!leadId || !gymName || !recipientEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Verify user owns this lead
    const leadCheck = await supabase.from("leads").select("id").eq("id", leadId).eq("user_id", user.id).single()

    if (leadCheck.error || !leadCheck.data) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Generate follow-up email using AI
    const { text: followUpEmail } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Generate a brief, friendly follow-up email for "${gymName}" who hasn't replied yet. 
The email should:
- Be conversational and not pushy
- Reference the previous email briefly
- Offer additional value or ask a simple question
- Be under 100 words
- NOT include placeholders like [Your Name]

Return ONLY the email body.`,
    })

    // Send follow-up email
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: "Following up - Partnership Opportunity",
      html: `<p>${followUpEmail}</p>`,
    })

    // Update thread
    const threadData = await supabase.from("email_threads").select("thread_data").eq("lead_id", leadId).single()

    const updatedThread = threadData.data?.thread_data || []
    updatedThread.push({
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: "Following up - Partnership Opportunity",
      body: followUpEmail,
      timestamp: new Date().toISOString(),
      type: "sent",
      messageId: info.messageId,
    })

    await supabase.from("email_threads").update({ thread_data: updatedThread }).eq("lead_id", leadId)

    // Increment follow-up count
    await supabase
      .from("leads")
      .update({
        follow_up_count: leadCheck.data.follow_up_count ? leadCheck.data.follow_up_count + 1 : 1,
        last_updated: new Date().toISOString(),
      })
      .eq("id", leadId)

    return NextResponse.json({ success: true, email: followUpEmail, messageId: info.messageId })
  } catch (error) {
    console.error("Error sending follow-up:", error)
    return NextResponse.json({ error: "Failed to send follow-up email" }, { status: 500 })
  }
}
