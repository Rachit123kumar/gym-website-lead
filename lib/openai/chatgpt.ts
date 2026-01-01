import OpenAI from "openai"

let openaiClient: OpenAI | null = null

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set")
    }
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

export async function generatePersonalizedEmail(
  gymName: string,
  gymEmail: string,
  gymCity: string,
  notes: string,
  category: string,
): Promise<string> {
  const client = getOpenAIClient()

  const prompt = `You are a professional email writer for a business development agency. Write a personalized, friendly but professional outreach email.

Gym Details:
- Gym Name: ${gymName}
- Location: ${gymCity}
- Category: ${category}
- Additional Notes: ${notes || "None"}

Requirements:
1. Keep it concise (3-4 sentences max)
2. Show you've researched the gym
3. Offer clear value proposition
4. Include a gentle call to action
5. Be authentic, not generic
6. Don't mention your company name specifically

Write only the email body, nothing else.`

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === "text")
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in response")
  }

  return textContent.text
}

export async function generateReply(
  leadName: string,
  leadMessage: string,
  previousContext: string,
  category: string,
): Promise<string> {
  const client = getOpenAIClient()

  const prompt = `You are a professional business development representative responding to a lead's inquiry about your services.

Lead Message: "${leadMessage}"

Previous Context: ${previousContext || "This is the first message from the lead"}

Category: ${category}

Requirements:
1. Be warm and friendly but professional
2. Address the lead's specific concerns or questions
3. Keep it concise (2-3 sentences)
4. Offer next steps
5. Don't make promises you can't keep

Write only the reply, nothing else.`

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === "text")
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in response")
  }

  return textContent.text
}
