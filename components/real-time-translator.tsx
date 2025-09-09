"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRightLeft, Volume2, Copy } from "lucide-react"
import { supportedLanguages, translationService } from "@/lib/translation-service"

interface RealTimeTranslatorProps {
  patientLanguage?: string
  doctorLanguage?: string
}

export default function RealTimeTranslator({ patientLanguage = "pa", doctorLanguage = "en" }: RealTimeTranslatorProps) {
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [direction, setDirection] = useState<"patient-to-doctor" | "doctor-to-patient">("patient-to-doctor")

  const patientLang = supportedLanguages.find((lang) => lang.code === patientLanguage)
  const doctorLang = supportedLanguages.find((lang) => lang.code === doctorLanguage)

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsTranslating(true)
    try {
      const fromLang = direction === "patient-to-doctor" ? patientLanguage : doctorLanguage
      const toLang = direction === "patient-to-doctor" ? doctorLanguage : patientLanguage

      const translation = await translationService.translateText(inputText, fromLang, toLang)
      setTranslatedText(translation)
    } catch (error) {
      console.error("Translation error:", error)
    } finally {
      setIsTranslating(false)
    }
  }

  const toggleDirection = () => {
    setDirection((prev) => (prev === "patient-to-doctor" ? "doctor-to-patient" : "patient-to-doctor"))
    setInputText("")
    setTranslatedText("")
  }

  const speakText = (text: string, language: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      speechSynthesis.speak(utterance)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Real-Time Translator</span>
          <Button variant="outline" size="sm" onClick={toggleDirection}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Direction Indicator */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">{direction === "patient-to-doctor" ? patientLang?.flag : doctorLang?.flag}</span>
            <Badge variant="secondary">
              {direction === "patient-to-doctor" ? patientLang?.nativeName : doctorLang?.nativeName}
            </Badge>
          </div>
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {direction === "patient-to-doctor" ? doctorLang?.nativeName : patientLang?.nativeName}
            </Badge>
            <span className="text-lg">{direction === "patient-to-doctor" ? doctorLang?.flag : patientLang?.flag}</span>
          </div>
        </div>

        {/* Input Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {direction === "patient-to-doctor" ? "Patient Message" : "Doctor Message"}
          </label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              direction === "patient-to-doctor" ? "Patient speaks in their language..." : "Doctor types response..."
            }
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button onClick={handleTranslate} disabled={!inputText.trim() || isTranslating} size="sm">
              {isTranslating ? "Translating..." : "Translate"}
            </Button>
            {inputText && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  speakText(inputText, direction === "patient-to-doctor" ? patientLanguage : doctorLanguage)
                }
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Translated Output */}
        {translatedText && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {direction === "patient-to-doctor" ? "For Doctor" : "For Patient"}
            </label>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm">{translatedText}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  speakText(translatedText, direction === "patient-to-doctor" ? doctorLanguage : patientLanguage)
                }
              >
                <Volume2 className="h-4 w-4 mr-1" />
                Speak
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(translatedText)}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
