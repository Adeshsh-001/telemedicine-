// Real-time Translation Microservice
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { text, fromLanguage, toLanguage, context } = await request.json()

  // Simulate translation processing
  await new Promise((resolve) => setTimeout(resolve, 500))

  const translations: Record<string, Record<string, string>> = {
    "Take rest and drink plenty of water": {
      pa: "ਆਰਾਮ ਕਰੋ ਅਤੇ ਬਹੁਤ ਪਾਣੀ ਪੀਓ",
      hi: "आराम करें और खूब पानी पिएं",
      ur: "آرام کریں اور بہت پانی پیئں",
      bn: "বিশ্রাম নিন এবং প্রচুর পানি পান করুন",
    },
    "Your fever should reduce in 2-3 days": {
      pa: "ਤੁਹਾਡਾ ਬੁਖਾਰ 2-3 ਦਿਨਾਂ ਵਿੱਚ ਘੱਟ ਜਾਣਾ ਚਾਹੀਦਾ ਹੈ",
      hi: "आपका बुखार 2-3 दिनों में कम हो जाना चाहिए",
      ur: "آپ کا بخار 2-3 دنوں میں کم ہو جانا چاہیے",
      bn: "আপনার জ্বর ২-৩ দিনে কমে যাওয়া উচিত",
    },
  }

  const translatedText = translations[text]?.[toLanguage] || `[${toLanguage.toUpperCase()}] ${text}`

  return NextResponse.json({
    success: true,
    originalText: text,
    translatedText,
    fromLanguage,
    toLanguage,
    confidence: 0.94,
    context: context || "medical",
    timestamp: new Date().toISOString(),
  })
}

export async function GET() {
  return NextResponse.json({
    supportedLanguages: [
      { code: "en", name: "English" },
      { code: "pa", name: "Punjabi" },
      { code: "hi", name: "Hindi" },
      { code: "ur", name: "Urdu" },
      { code: "bn", name: "Bengali" },
      { code: "ta", name: "Tamil" },
      { code: "te", name: "Telugu" },
      { code: "gu", name: "Gujarati" },
    ],
    serviceStatus: "active",
    version: "1.1.0",
  })
}
