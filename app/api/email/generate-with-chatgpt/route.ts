import { createClient } from "@/lib/supabase/server"
import { generatePersonalizedEmail } from "@/lib/openai/chatgpt"
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
    const body = await request.json()
    const { leadId, gymName, gymEmail, gymCity, notes, category } = body

    if (!leadId || !gymName || !gymEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const email = await generatePersonalizedEmail(gymName, gymEmail, gymCity, notes, category)

    // Update lead with generated email
    const { data, error } = await supabase
      .from("leads")
      .update({
        chatgpt_response: email,
        is_auto_response: true,
      })
      .eq("id", leadId)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ email, lead: data })
  } catch (error) {
    console.error("Error generating email:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate email" },
      { status: 500 },
    )
  }
}
