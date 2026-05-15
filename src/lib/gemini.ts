import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateText(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  images: Array<{ base64: string; mimeType: string }>,
  onChunk: (text: string) => void
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const m = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt || undefined,
  })

  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = []

  for (const img of images) {
    if (img.base64) {
      // Strip the data URL prefix if present
      const base64Data = img.base64.includes(',') ? img.base64.split(',')[1] : img.base64
      parts.push({ inlineData: { data: base64Data, mimeType: img.mimeType } })
    }
  }

  if (userPrompt) parts.push({ text: userPrompt })
  if (parts.length === 0) parts.push({ text: 'Hello' })

  const result = await m.generateContentStream(parts)
  let full = ''
  for await (const chunk of result.stream) {
    const t = chunk.text()
    full += t
    onChunk(full)
  }
  return full
}
