"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Check } from "lucide-react"
import { supportedLanguages, translationService, type Language } from "@/lib/translation-service"

interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void
  compact?: boolean
}

export default function LanguageSelector({ onLanguageChange, compact = false }: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(supportedLanguages[0])
  const [showSelector, setShowSelector] = useState(false)

  useEffect(() => {
    const savedLang = translationService.getCurrentLanguage()
    const language = supportedLanguages.find((lang) => lang.code === savedLang) || supportedLanguages[0]
    setCurrentLanguage(language)
  }, [])

  const handleLanguageSelect = (language: Language) => {
    setCurrentLanguage(language)
    translationService.setLanguage(language.code)
    setShowSelector(false)
    onLanguageChange?.(language)
  }

  if (compact) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm">{currentLanguage.flag}</span>
        </Button>

        {showSelector && (
          <Card className="absolute top-full right-0 mt-2 w-64 z-50 shadow-lg">
            <CardContent className="p-2">
              <div className="grid grid-cols-1 gap-1">
                {supportedLanguages.map((language) => (
                  <Button
                    key={language.code}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLanguageSelect(language)}
                    className="justify-start h-auto p-2"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-lg">{language.flag}</span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{language.nativeName}</p>
                        <p className="text-xs text-muted-foreground">{language.name}</p>
                      </div>
                      {currentLanguage.code === language.code && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Language / ਭਾਸ਼ਾ</h3>
          </div>
          <Badge variant="outline">{currentLanguage.nativeName}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {supportedLanguages.map((language) => (
            <Button
              key={language.code}
              variant={currentLanguage.code === language.code ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageSelect(language)}
              className="justify-start h-auto p-3"
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-base">{language.flag}</span>
                <div className="text-left">
                  <p className="text-xs font-medium">{language.nativeName}</p>
                  <p className="text-xs opacity-70">{language.name}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          Voice AI supports all selected languages • Real-time translation available
        </p>
      </CardContent>
    </Card>
  )
}
