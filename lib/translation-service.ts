// Translation service for multilingual healthcare communication
export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

export const supportedLanguages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
]

// Medical translations for common phrases
const medicalTranslations: Record<string, Record<string, string>> = {
  // App Title and Headers
  health_service: {
    en: "Health Service",
    pa: "ਸਿਹਤ ਸੇਵਾ",
    hi: "स्वास्थ्य सेवा",
    ur: "صحت کی خدمت",
    bn: "স্বাস্থ্য সেবা",
    ta: "சுகாதார சேவை",
    te: "ఆరోగ్య సేవ",
    gu: "આરોગ્ય સેવા",
  },

  // Navigation and Buttons
  patient_records: {
    en: "Patient Records",
    pa: "ਮਰੀਜ਼ ਰਿਕਾਰਡ",
    hi: "मरीज़ के रिकॉर्ड",
    ur: "مریض کے ریکارڈ",
    bn: "রোগীর রেকর্ড",
    ta: "நோயாளி பதிவுகள்",
    te: "రోగి రికార్డులు",
    gu: "દર્દીના રેકોર્ડ",
  },

  new_case: {
    en: "New Case",
    pa: "ਨਵਾਂ ਕੇਸ",
    hi: "नया केस",
    ur: "نیا کیس",
    bn: "নতুন কেস",
    ta: "புதிய வழக்கு",
    te: "కొత్త కేసు",
    gu: "નવો કેસ",
  },

  health_check: {
    en: "Health Check",
    pa: "ਸਿਹਤ ਜਾਂਚ",
    hi: "स्वास्थ्य जांच",
    ur: "صحت کی جانچ",
    bn: "স্বাস্থ্য পরীক্ষা",
    ta: "சுகாதார பரிசோதனை",
    te: "ఆరోగ్య పరీక్ష",
    gu: "આરોગ્ય તપાસ",
  },

  emergency: {
    en: "Emergency",
    pa: "ਐਮਰਜੈਂਸੀ",
    hi: "आपातकाल",
    ur: "ہنگامی حالت",
    bn: "জরুরি",
    ta: "அவசரநிலை",
    te: "అత్యవసర",
    gu: "કટોકટી",
  },

  village_dashboard: {
    en: "Village Dashboard",
    pa: "ਪਿੰਡ ਡੈਸ਼ਬੋਰਡ",
    hi: "गांव डैशबोर्ड",
    ur: "گاؤں ڈیش بورڈ",
    bn: "গ্রাম ড্যাশবোর্ড",
    ta: "கிராம டாஷ்போர்டு",
    te: "గ్రామ డాష్‌బోర్డ్",
    gu: "ગામ ડેશબોર્ડ",
  },

  // Voice Recording
  voice_recording: {
    en: "Voice Recording",
    pa: "ਆਵਾਜ਼ ਰਿਕਾਰਡਿੰਗ",
    hi: "आवाज़ रिकॉर्डिंग",
    ur: "آواز ریکارڈنگ",
    bn: "ভয়েস রেকর্ডিং",
    ta: "குரல் பதிவு",
    te: "వాయిస్ రికార్డింగ్",
    gu: "અવાજ રેકોર્ડિંગ",
  },

  start_recording: {
    en: "Start Recording",
    pa: "ਰਿਕਾਰਡਿੰਗ ਸ਼ੁਰੂ ਕਰੋ",
    hi: "रिकॉर्डिंग शुरू करें",
    ur: "ریکارڈنگ شروع کریں",
    bn: "রেকর্ডিং শুরু করুন",
    ta: "பதிவு தொடங்கவும்",
    te: "రికార్డింగ్ ప్రారంభించండి",
    gu: "રેકોર્ડિંગ શરૂ કરો",
  },

  stop_recording: {
    en: "Stop Recording",
    pa: "ਰਿਕਾਰਡਿੰਗ ਬੰਦ ਕਰੋ",
    hi: "रिकॉर्डिंग बंद करें",
    ur: "ریکارڈنگ بند کریں",
    bn: "রেকর্ডিং বন্ধ করুন",
    ta: "பதிவை நிறுத்தவும்",
    te: "రికార్డింగ్ ఆపండి",
    gu: "રેકોર્ડિંગ બંધ કરો",
  },

  // Smart Card
  smart_card: {
    en: "Smart Card",
    pa: "ਸਮਾਰਟ ਕਾਰਡ",
    hi: "स्मार्ट कार्ड",
    ur: "سمارٹ کارڈ",
    bn: "স্মার্ট কার্ড",
    ta: "ஸ்மார்ட் கார்டு",
    te: "స్మార్ట్ కార్డ్",
    gu: "સ્માર્ટ કાર્ડ",
  },

  scan_patient_card: {
    en: "Scan Patient Card",
    pa: "ਮਰੀਜ਼ ਕਾਰਡ ਸਕੈਨ ਕਰੋ",
    hi: "मरीज़ कार्ड स्कैन करें",
    ur: "مریض کارڈ اسکین کریں",
    bn: "রোগীর কার্ড স্ক্যান করুন",
    ta: "நோயாளி அட்டையை ஸ்கேன் செய்யவும்",
    te: "రోగి కార్డ్‌ను స్కాన్ చేయండి",
    gu: "દર્દીનું કાર્ડ સ્કેન કરો",
  },

  // Alerts and Analysis
  recent_alerts: {
    en: "Recent Alerts",
    pa: "ਤਾਜ਼ਾ ਚੇਤਾਵਨੀਆਂ",
    hi: "हाल की चेतावनियां",
    ur: "حالیہ انتباہات",
    bn: "সাম্প্রতিক সতর্কতা",
    ta: "சமீபத்திய எச்சரிக்கைகள்",
    te: "ఇటీవలి హెచ్చరికలు",
    gu: "તાજેતરની ચેતવણીઓ",
  },

  transcription: {
    en: "Transcription",
    pa: "ਟ੍ਰਾਂਸਕ੍ਰਿਪਸ਼ਨ",
    hi: "ट्रांसक्रिप्शन",
    ur: "نقل",
    bn: "ট্রান্সক্রিপশন",
    ta: "படியெடுத்தல்",
    te: "ట్రాన్స్‌క్రిప్షన్",
    gu: "ટ્રાન્સક્રિપ્શન",
  },

  ai_analysis: {
    en: "AI Analysis",
    pa: "AI ਵਿਸ਼ਲੇਸ਼ਣ",
    hi: "AI विश्लेषण",
    ur: "AI تجزیہ",
    bn: "AI বিশ্লেষণ",
    ta: "AI பகுப்பாய்வு",
    te: "AI విశ్లేషణ",
    gu: "AI વિશ્લેષણ",
  },

  current_patient: {
    en: "Current Patient",
    pa: "ਮੌਜੂਦਾ ਮਰੀਜ਼",
    hi: "वर्तमान मरीज़",
    ur: "موجودہ مریض",
    bn: "বর্তমান রোগী",
    ta: "தற்போதைய நோயாளி",
    te: "ప్రస్తుత రోగి",
    gu: "વર્તમાન દર્દી",
  },

  // Status and Connection
  online: {
    en: "Online",
    pa: "ਆਨਲਾਈਨ",
    hi: "ऑनलाइन",
    ur: "آن لائن",
    bn: "অনলাইন",
    ta: "ஆன்லைன்",
    te: "ఆన్‌లైన్",
    gu: "ઓનલાઇન",
  },

  offline: {
    en: "Offline",
    pa: "ਆਫਲਾਈਨ",
    hi: "ऑफलाइन",
    ur: "آف لائن",
    bn: "অফলাইন",
    ta: "ஆஃப்லைன்",
    te: "ఆఫ్‌లైన్",
    gu: "ઓફલાઇન",
  },

  connected: {
    en: "Connected",
    pa: "ਜੁੜਿਆ ਹੋਇਆ",
    hi: "जुड़ा हुआ",
    ur: "جڑا ہوا",
    bn: "সংযুক্ত",
    ta: "இணைக்கப்பட்டது",
    te: "కనెక్ట్ చేయబడింది",
    gu: "જોડાયેલ",
  },

  // Medical translations for common phrases
  symptoms: {
    en: "Symptoms",
    pa: "ਲੱਛਣ",
    hi: "लक्षण",
    ur: "علامات",
    bn: "লক্ষণ",
    ta: "அறிகுறிகள்",
    te: "లక్షణాలు",
    gu: "લક્ષણો",
  },
  fever: {
    en: "Fever",
    pa: "ਬੁਖਾਰ",
    hi: "बुखार",
    ur: "بخار",
    bn: "জ্বর",
    ta: "காய்ச்சல்",
    te: "జ్వరం",
    gu: "તાવ",
  },
  headache: {
    en: "Headache",
    pa: "ਸਿਰ ਦਰਦ",
    hi: "सिरदर्द",
    ur: "سر درد",
    bn: "মাথাব্যথা",
    ta: "தலைவலி",
    te: "తలనొప్పి",
    gu: "માથાનો દુખાવો",
  },
  pain: {
    en: "Pain",
    pa: "ਦਰਦ",
    hi: "दर्द",
    ur: "درد",
    bn: "ব্যথা",
    ta: "வலி",
    te: "నొప్పి",
    gu: "દુખાવો",
  },
  cough: {
    en: "Cough",
    pa: "ਖੰਘ",
    hi: "खांसी",
    ur: "کھانسی",
    bn: "কাশি",
    ta: "இருமல்",
    te: "దగ్గు",
    gu: "ઉધરસ",
  },
  describe_symptoms: {
    en: "Please describe your symptoms",
    pa: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਰਣਨ ਕਰੋ",
    hi: "कृपया अपने लक्षणों का वर्णन करें",
    ur: "براہ کرم اپنی علامات بیان کریں",
    bn: "অনুগ্রহ করে আপনার লক্ষণগুলি বর্ণনা করুন",
    ta: "தயவுசெய்து உங்கள் அறிகுறிகளை விவரிக்கவும்",
    te: "దయచేసి మీ లక్షణాలను వివరించండి",
    gu: "કૃપા કરીને તમારા લક્ષણોનું વર્ણન કરો",
  },
}

class TranslationService {
  private currentLanguage = "en"

  setLanguage(languageCode: string) {
    this.currentLanguage = languageCode
    localStorage.setItem("healthcare_language", languageCode)
  }

  getCurrentLanguage(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem("healthcare_language") || "en"
    }
    return this.currentLanguage
  }

  translate(key: string, targetLanguage?: string): string {
    const lang = targetLanguage || this.getCurrentLanguage()
    return medicalTranslations[key]?.[lang] || medicalTranslations[key]?.["en"] || key
  }

  // Real-time translation for patient-doctor communication
  async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    // Simulate API call to translation service
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock translation - in production, integrate with Google Translate API or similar
    const mockTranslations: Record<string, Record<string, string>> = {
      "I have fever and headache": {
        pa: "ਮੈਨੂੰ ਬੁਖਾਰ ਅਤੇ ਸਿਰ ਦਰਦ ਹੈ",
        hi: "मुझे बुखार और सिरदर्द है",
        ur: "مجھے بخار اور سر درد ہے",
      },
      "Take rest and drink water": {
        pa: "ਆਰਾਮ ਕਰੋ ਅਤੇ ਪਾਣੀ ਪੀਓ",
        hi: "आराम करें और पानी पिएं",
        ur: "آرام کریں اور پانی پیئں",
      },
    }

    return mockTranslations[text]?.[toLang] || `[Translated to ${toLang}] ${text}`
  }

  // Voice AI language detection and processing
  async processVoiceInLanguage(
    audioBlob: Blob,
    detectedLanguage: string,
  ): Promise<{
    transcription: string
    translation: string
    confidence: number
  }> {
    // Simulate voice processing with language detection
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockResponses: Record<string, any> = {
      pa: {
        transcription: "ਮੈਨੂੰ ਸਿਰ ਦਰਦ ਹੈ ਅਤੇ ਬੁਖਾਰ ਵੀ ਹੈ",
        translation: "I have headache and fever also",
        confidence: 0.92,
      },
      hi: {
        transcription: "मुझे सिरदर्द और बुखार है",
        translation: "I have headache and fever",
        confidence: 0.89,
      },
      ur: {
        transcription: "مجھے سر درد اور بخار ہے",
        translation: "I have headache and fever",
        confidence: 0.87,
      },
    }

    return (
      mockResponses[detectedLanguage] || {
        transcription: "Audio processed",
        translation: "I have some health concerns",
        confidence: 0.75,
      }
    )
  }
}

export const translationService = new TranslationService()
