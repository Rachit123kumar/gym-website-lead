import { createClient } from "@/lib/supabase/server"
import { getGmailAuthUrl, exchangeCodeForTokens } from "@/lib/email/gmail-api"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (code) {
    try {
      const tokens = await exchangeCodeForTokens(code)

      await supabase.from("gmail_oauth_tokens").upsert(
        {
          user_id: user.id,
          access_token: tokens.access_token || "",
          refresh_token: tokens.refresh_token || null,
          token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
          gmail_email: process.env.GMAIL_USER,
        },
        { onConflict: "user_id" },
      )

      return NextResponse.redirect(new URL("/dashboard?gmail=connected", request.url))
    } catch (error) {
      console.error("Error exchanging code:", error)
      return NextResponse.redirect(new URL("/dashboard?gmail=error", request.url))
    }
  }

  // If no code, generate auth URL
  const authUrl = await getGmailAuthUrl()
  return NextResponse.redirect(authUrl)
}
