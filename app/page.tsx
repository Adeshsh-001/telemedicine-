"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Heart,
  Mic,
  Users,
  AlertTriangle,
  Smartphone,
  Activity,
  FileText,
  Phone,
  Wifi,
  WifiOff,
  Brain,
  Volume2,
  CheckCircle,
  BarChart3,
  MessageSquare,
  Stethoscope,
  ArrowRightLeft,
  Pill,
  MapPin,
  Zap,
} from "lucide-react"
import Link from "next/link"
import SmartCardScanner from "@/components/smart-card-scanner"
import ASHAConsultation from "@/components/asha-consultation"
import LanguageSelector from "@/components/language-selector"
import RealTimeTranslator from "@/components/real-time-translator"
import { ThemeToggle } from "@/components/theme-toggle"
import LowBandwidthMode from "@/components/low-bandwidth-mode"
import { offlineStorage, type PatientData } from "@/lib/offline-storage"
import { smsService } from "@/lib/sms-service"
import { translationService, type Language } from "@/lib/translation-service"
import { bandwidthOptimizer, type OptimizationSettings } from "@/lib/bandwidth-optimizer"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function HealthcareApp() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [aiAnalysis, setAiAnalysis] = useState("")
  const [recordingProgress, setRecordingProgress] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [showCardScanner, setShowCardScanner] = useState(false)
  const [showConsultation, setShowConsultation] = useState(false)
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)
  const [showTranslator, setShowTranslator] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [isLowBandwidth, setIsLowBandwidth] = useState(bandwidthOptimizer.isLowBandwidthConnection())
  const [showBandwidthSettings, setShowBandwidthSettings] = useState(false)
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>(
    bandwidthOptimizer.getOptimizationSettings(),
  )

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  useEffect(() => {
    offlineStorage.init().catch(console.error)
  }, [])

  useEffect(() => {
    const savedLang = translationService.getCurrentLanguage()
    setCurrentLanguage(savedLang)
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    const handleBandwidthChange = (event: CustomEvent) => {
      setIsLowBandwidth(event.detail.isLowBandwidth)
      setOptimizationSettings(event.detail.settings)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("bandwidthchange", handleBandwidthChange as EventListener)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("bandwidthchange", handleBandwidthChange as EventListener)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  if (!user) {
    return null // Will redirect to login
  }

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language)
    setCurrentLanguage(language.code)
    translationService.setLanguage(language.code)
  }

  const t = (key: string) => translationService.translate(key, currentLanguage)

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
          await processAudio(audioBlob)
          stream.getTracks().forEach((track) => track.stop())
        }

        mediaRecorder.start()
        setIsRecording(true)
        setRecordingProgress(0)

        progressIntervalRef.current = setInterval(() => {
          setRecordingProgress((prev) => {
            if (prev >= 100) {
              stopRecording()
              return 100
            }
            return prev + 2
          })
          setAudioLevel(Math.random() * 100)
        }, 100)
      } catch (error) {
        console.error("Error accessing microphone:", error)
        alert("Microphone access denied. Please allow microphone access.")
      }
    } else {
      stopRecording()
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      setAudioLevel(0)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setTranscription("")
    setAiAnalysis("")

    try {
      const currentLang = translationService.getCurrentLanguage()

      if (currentLang !== "en") {
        const voiceResult = await translationService.processVoiceInLanguage(audioBlob, currentLang)
        setTranscription(`${voiceResult.transcription} | ${voiceResult.translation}`)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const mockTranscription = "I have headache and fever also."
        setTranscription(mockTranscription)
      }

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const symptoms = ["Headache", "Fever"]
      const severity = "Moderate"

      const mockAnalysis = {
        symptoms,
        severity,
        recommendations: ["Check temperature", "Monitor for 24 hours", "Paracetamol if fever >101°F"],
        urgency: "Medium",
        followUp: "Contact doctor if symptoms worsen",
      }

      setAiAnalysis(JSON.stringify(mockAnalysis, null, 2))

      if (currentPatient && (symptoms.includes("Fever") || severity === "High")) {
        await smsService.sendHealthRiskAlert(
          currentPatient.name,
          severity,
          symptoms,
          currentPatient.emergencyContact.phone,
        )
      }

      if (currentPatient) {
        const healthRecord = {
          id: `record_${Date.now()}`,
          patientId: currentPatient.id,
          date: new Date().toISOString(),
          symptoms: symptoms,
          diagnosis: "Viral fever suspected",
          treatment: "Symptomatic treatment advised",
          followUp: "Review in 48 hours if symptoms persist",
          ashaWorker: "Current ASHA Worker",
        }

        await offlineStorage.saveHealthRecord(healthRecord)
      }
    } catch (error) {
      console.error("Error processing audio:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePatientFound = (patient: PatientData) => {
    setCurrentPatient(patient)
    setShowCardScanner(false)
  }

  if (showConsultation) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setShowConsultation(false)}>
            ← Back to Main
          </Button>
          <div>
            <h1 className="text-xl font-bold">ASHA Consultation Bridge</h1>
            <p className="text-sm text-muted-foreground">Connect with doctors for medical guidance</p>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <ASHAConsultation currentPatient={currentPatient} voiceTranscription={transcription} aiAnalysis={aiAnalysis} />
      </div>
    )
  }

  if (showBandwidthSettings) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setShowBandwidthSettings(false)}>
            ← Back to Main
          </Button>
          <div>
            <h1 className="text-xl font-bold">Bandwidth Settings</h1>
            <p className="text-sm text-muted-foreground">Optimize for your connection</p>
          </div>
        </div>
        <LowBandwidthMode onSettingsChange={setOptimizationSettings} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Heart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("health_service")}</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector onLanguageChange={handleLanguageChange} compact />
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout
          </Button>
          {isOnline ? (
            <div className="flex items-center gap-1">
              <Wifi className="h-5 w-5 text-primary" />
              {isLowBandwidth && <Zap className="h-3 w-3 text-accent" />}
            </div>
          ) : (
            <WifiOff className="h-5 w-5 text-muted-foreground" />
          )}
          <Badge variant={isOnline ? (isLowBandwidth ? "secondary" : "default") : "destructive"}>
            {isOnline ? (isLowBandwidth ? "Slow" : "Online") : "Offline"}
          </Badge>
        </div>
      </div>

      {isLowBandwidth && isOnline && (
        <Card className="mb-6 border-accent">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-accent mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-accent">Low Bandwidth Detected</p>
                <p className="text-xs text-muted-foreground mt-1">Optimizations are enabled to improve performance</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowBandwidthSettings(true)}>
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Selection */}
      <LanguageSelector onLanguageChange={handleLanguageChange} />

      {/* Real-Time Translator Toggle */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Button onClick={() => setShowTranslator(!showTranslator)} variant="outline" className="w-full" size="lg">
            <ArrowRightLeft className="h-5 w-5 mr-2" />
            {showTranslator ? "Hide Translator" : "Show Real-Time Translator"}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">Communicate with doctors in any language</p>
        </CardContent>
      </Card>

      {/* Real-Time Translator */}
      {showTranslator && (
        <div className="mb-6">
          <RealTimeTranslator patientLanguage={selectedLanguage?.code || "pa"} doctorLanguage="en" />
        </div>
      )}

      {/* Current Patient Display */}
      {currentPatient && (
        <Card className="mb-6 border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{t("current_patient")}</span>
              <Button variant="ghost" size="sm" onClick={() => setCurrentPatient(null)}>
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{currentPatient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentPatient.age} years • {currentPatient.gender}
                </p>
                <p className="text-xs text-muted-foreground">Card: {currentPatient.cardId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">{t("patient_records")}</h3>
            <p className="text-xs text-muted-foreground">Patient Records</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">{t("new_case")}</h3>
            <p className="text-xs text-muted-foreground">New Case</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">{t("health_check")}</h3>
            <p className="text-xs text-muted-foreground">Health Check</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Phone className="h-8 w-8 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-sm">{t("emergency")}</h3>
            <p className="text-xs text-muted-foreground">Emergency</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <Link href="/medicine">
              <Button className="w-full" size="lg">
                <Pill className="h-5 w-5 mr-2" />
                AI Medicine Bot
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-2">Get AI-powered medicine recommendations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Link href="/symptom-checker">
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                <Stethoscope className="h-5 w-5 mr-2" />
                AI Symptom Checker
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-2">Check symptoms and get health insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Link href="/pharmacy">
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                <MapPin className="h-5 w-5 mr-2" />
                Pharmacy Finder
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Find nearby pharmacies and medicine availability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button
              onClick={() => setShowBandwidthSettings(true)}
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
            >
              <Zap className="h-5 w-5 mr-2" />
              Bandwidth Settings
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">Optimize app for your connection speed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                <BarChart3 className="h-5 w-5 mr-2" />
                {t("village_dashboard")}
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-2">View village health trends and analytics</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Link href="/alerts">
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                <MessageSquare className="h-5 w-5 mr-2" />
                SMS Alert System
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-2">Manage emergency alerts and notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button
              onClick={() => setShowConsultation(true)}
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
            >
              <Stethoscope className="h-5 w-5 mr-2" />
              Doctor Consultation
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">Connect with doctors for medical guidance</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Link href="/doctor">
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                <Stethoscope className="h-5 w-5 mr-2" />
                Doctor Portal
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-2">Doctor interface for reviewing cases</p>
          </CardContent>
        </Card>
      </div>

      {/* Voice Recording Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mic className="h-5 w-5" />
            {t("voice_recording")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <Button
              onClick={toggleRecording}
              size="lg"
              disabled={isProcessing}
              className={`w-full ${isRecording ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
            >
              <Mic className={`h-5 w-5 mr-2 ${isRecording ? "animate-pulse" : ""}`} />
              {isRecording ? t("stop_recording") : t("start_recording")}
            </Button>

            {isRecording && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <Progress value={audioLevel} className="flex-1 h-2" />
                </div>
                <Progress value={recordingProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">Recording: {Math.floor(recordingProgress)}%</p>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Brain className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm">Processing with AI...</span>
                </div>
                <Progress value={66} className="w-full" />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {selectedLanguage?.nativeName || "Punjabi"} dialect supported •{t("describe_symptoms")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transcription and AI Analysis Results */}
      {transcription && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-primary" />
              {t("transcription")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{transcription}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {aiAnalysis && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              {t("ai_analysis")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Detected Symptoms:</h4>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">Headache</Badge>
                  <Badge variant="secondary">Fever</Badge>
                </div>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">
                  Severity: <span className="text-accent">Moderate</span>
                </h4>
                <p className="text-xs text-muted-foreground">Requires monitoring and basic treatment</p>
                {currentPatient && <p className="text-xs text-primary mt-1">SMS alert sent to emergency contact</p>}
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Recommendations:</h4>
                <ul className="text-xs space-y-1">
                  <li>• Check temperature</li>
                  <li>• Monitor for 24 hours</li>
                  <li>• Paracetamol if fever &gt;101°F</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Alerts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-accent" />
            {t("recent_alerts")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-accent mt-0.5" />
              <div>
                <p className="text-sm font-medium">High Blood Pressure Alert</p>
                <p className="text-xs text-muted-foreground">Patient: Rajinder Singh • 2 hours ago</p>
                <p className="text-xs text-primary">SMS sent to emergency contact</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
              <Heart className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Vaccination Reminder</p>
                <p className="text-xs text-muted-foreground">5 children due for immunization</p>
                <p className="text-xs text-primary">SMS reminders sent</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Card Scanner */}
      {showCardScanner ? (
        <SmartCardScanner onPatientFound={handlePatientFound} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5" />
              {t("smart_card")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium">NFC/QR Card Ready</p>
                <p className="text-xs text-muted-foreground">Encrypted offline storage active</p>
              </div>
              <Badge variant="default">{t("connected")}</Badge>
            </div>
            <Button onClick={() => setShowCardScanner(true)} className="w-full">
              {t("scan_patient_card")}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="h-16"></div>
    </div>
  )
}
