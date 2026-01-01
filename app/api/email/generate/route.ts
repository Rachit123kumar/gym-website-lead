import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  const { gymName, gymWebsite } = await request.json()

  if (!gymName) {
    return NextResponse.json({ error: "Gym name is required" }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Generate a professional, personalized cold outreach email for a gym called "${gymName}"${gymWebsite ? ` with website ${gymWebsite}` : ""}. 

The email should:
- Be friendly but professional
- Mention a specific benefit or partnership opportunity
- Be concise (under 200 words)
- Include a clear call-to-action
- NOT include placeholders like [Your Name] or [Company] - use generic but appropriate names

Return ONLY the email body, no subject line or greeting.`,
    })

    return NextResponse.json({ email: text })
  } catch (error) {
    console.error("Error generating email:", error)
    return NextResponse.json({ error: "Failed to generate email" }, { status: 500 })
  }
}
