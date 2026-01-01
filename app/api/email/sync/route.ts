import { createClient } from "@/lib/supabase/server"
import { fetchGmailReplies } from "@/lib/email/gmail-api"  // <-- CHANGE: Update import
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: tokenData, error: tokenError } = await supabase
      .from("gmail_oauth_tokens")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "Gmail not connected. Please authorize Gmail access first." }, { status: 401 })
    }

    const { data: leads, error: leadsError } = await supabase.from("leads").select("*").eq("user_id", user.id)

    if (leadsError || !leads) {
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
    }

    let syncedCount = 0
    const errors: any[] = []

    for (const lead of leads) {
      try {
        if (!lead.email) continue

        // <-- CHANGE: Pass accessToken instead of gmailClient
        const replies = await fetchGmailReplies(tokenData.access_token, process.env.GMAIL_USER!, lead.email)

        if (replies.length > 0) {
          const { data: threadData } = await supabase.from("email_threads").select("*").eq("lead_id", lead.id).single()

          const currentThread = threadData?.thread_data || []
          const existingMessageIds = new Set(currentThread.map((m: any) => m.messageId))

          const newReplies = replies.filter((r: any) => !existingMessageIds.has(r.messageId))

          if (newReplies.length > 0) {
            const updatedThread = [...currentThread, ...newReplies]

            if (threadData) {
              await supabase
                .from("email_threads")
                .update({
                  thread_data: updatedThread,
                  last_synced: new Date().toISOString(),
                })
                .eq("id", threadData.id)
            } else {
              await supabase.from("email_threads").insert({
                lead_id: lead.id,
                thread_data: updatedThread,
                last_synced: new Date().toISOString(),
              })
            }

            await supabase
              .from("leads")
              .update({
                email_status: "replied",
                last_updated: new Date().toISOString(),
              })
              .eq("id", lead.id)

            syncedCount += newReplies.length
          }
        }
      } catch (error) {
        console.error(`Error syncing lead ${lead.id}:`, error)
        errors.push({
          leadId: lead.id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Error syncing emails:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync emails" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}