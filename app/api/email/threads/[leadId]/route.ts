import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { leadId } = await params

  // Verify user owns this lead
  const leadCheck = await supabase.from("leads").select("id").eq("id", leadId).eq("user_id", user.id).single()

  if (leadCheck.error || !leadCheck.data) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  const { data, error } = await supabase.from("email_threads").select("*").eq("lead_id", leadId).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || { thread_data: [] })
}
