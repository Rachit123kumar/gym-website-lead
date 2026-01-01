import { google } from "googleapis"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

export async function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  )

  auth.setCredentials({
    access_token: accessToken,
  })

  return google.gmail({ version: "v1", auth })
}

export async function getGmailAuthUrl() {
  const scopes = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.modify"]

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  })

  return url
}

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function fetchGmailReplies(accessToken: string, senderEmail: string, recipientEmail: string) {
  try {
    const gmailClient = await getGmailClient(accessToken)

    // Search for emails from the recipient (replies to your emails)
    const query = `from:${recipientEmail} to:${senderEmail}`

    const response = await gmailClient.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 10,
    })

    const messages = response.data.messages || []
    const parsedMessages = []

    for (const msg of messages) {
      const fullMsg = await gmailClient.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      })

      const headers = fullMsg.data.payload.headers
      const fromHeader = headers.find((h: any) => h.name === "From")?.value || ""
      const subjectHeader = headers.find((h: any) => h.name === "Subject")?.value || "No Subject"
      const dateHeader = headers.find((h: any) => h.name === "Date")?.value || new Date().toISOString()

      let body = ""
      if (fullMsg.data.payload.parts) {
        const textPart = fullMsg.data.payload.parts.find((p: any) => p.mimeType === "text/plain")
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, "base64").toString("utf-8")
        } else {
          const firstPart = fullMsg.data.payload.parts[0]
          if (firstPart?.body?.data) {
            body = Buffer.from(firstPart.body.data, "base64").toString("utf-8")
          }
        }
      } else if (fullMsg.data.payload.body?.data) {
        body = Buffer.from(fullMsg.data.payload.body.data, "base64").toString("utf-8")
      }

      parsedMessages.push({
        from: fromHeader,
        to: senderEmail,
        subject: subjectHeader,
        body: body.trim(),
        timestamp: new Date(dateHeader).toISOString(),
        type: "received",
        messageId: fullMsg.data.id,
      })
    }

    return parsedMessages
  } catch (error) {
    console.error("Error fetching Gmail replies:", error)
    throw error
  }
}

export async function decodeBase64(str: string): Promise<string> {
  try {
    return Buffer.from(str, "base64").toString("utf-8")
  } catch {
    return str
  }
}