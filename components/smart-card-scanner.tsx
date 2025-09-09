"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Smartphone, QrCode, Nfc, Scan, CheckCircle, AlertCircle, User, Heart, Phone, Calendar } from "lucide-react"
import { offlineStorage, type PatientData } from "@/lib/offline-storage"

interface SmartCardScannerProps {
  onPatientFound: (patient: PatientData) => void
}

export default function SmartCardScanner({ onPatientFound }: SmartCardScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResult, setScanResult] = useState<PatientData | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanMethod, setScanMethod] = useState<"nfc" | "qr" | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startNFCScan = async () => {
    setIsScanning(true)
    setScanMethod("nfc")
    setScanError(null)
    setScanProgress(0)

    try {
      // Check if Web NFC is supported
      if ("NDEFReader" in window) {
        const ndef = new (window as any).NDEFReader()

        // Simulate NFC scan progress
        const progressInterval = setInterval(() => {
          setScanProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressInterval)
              return 100
            }
            return prev + 10
          })
        }, 200)

        // Mock NFC scan result after 2 seconds
        setTimeout(async () => {
          clearInterval(progressInterval)
          await simulateCardScan("NFC_CARD_12345")
        }, 2000)
      } else {
        // Fallback for browsers without NFC support
        setTimeout(async () => {
          await simulateCardScan("NFC_CARD_12345")
        }, 2000)
      }
    } catch (error) {
      setScanError("NFC scanning failed. Please try QR code.")
      setIsScanning(false)
    }
  }

  const startQRScan = async () => {
    setIsScanning(true)
    setScanMethod("qr")
    setScanError(null)
    setScanProgress(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }

      // Simulate QR code detection after 3 seconds
      setTimeout(async () => {
        await simulateCardScan("QR_CARD_67890")
        stopCamera()
      }, 3000)
    } catch (error) {
      setScanError("Camera access denied. Please allow camera access.")
      setIsScanning(false)
    }
  }

  const simulateCardScan = async (cardId: string) => {
    try {
      // Try to get patient from offline storage
      let patient = await offlineStorage.getPatientByCardId(cardId)

      if (!patient) {
        // Create mock patient data if not found
        patient = {
          id: `patient_${Date.now()}`,
          name: "Rajinder Singh",
          age: 45,
          gender: "Male",
          bloodType: "B+",
          allergies: ["Penicillin"],
          medications: ["Metformin 500mg"],
          conditions: ["Type 2 Diabetes", "Hypertension"],
          lastVisit: "2024-01-15",
          vitals: {
            bloodPressure: "140/90",
            heartRate: 78,
            temperature: 98.6,
            weight: 75,
          },
          emergencyContact: {
            name: "Simran Kaur",
            phone: "+91-98765-43210",
          },
          cardId: cardId,
          encrypted: true,
          lastSync: new Date().toISOString(),
        }

        // Save to offline storage
        await offlineStorage.savePatient(patient)
      }

      setScanResult(patient)
      onPatientFound(patient)
      setIsScanning(false)
      setScanProgress(100)
    } catch (error) {
      setScanError("Failed to retrieve patient data")
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const resetScan = () => {
    setIsScanning(false)
    setScanResult(null)
    setScanError(null)
    setScanProgress(0)
    setScanMethod(null)
    stopCamera()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          ਸਮਾਰਟ ਕਾਰਡ ਸਕੈਨਰ (Smart Card Scanner)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning && !scanResult && (
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={startNFCScan} variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
              <Nfc className="h-6 w-6 text-primary" />
              <span className="text-sm">NFC Scan</span>
            </Button>
            <Button onClick={startQRScan} variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
              <QrCode className="h-6 w-6 text-primary" />
              <span className="text-sm">QR Code</span>
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {scanMethod === "nfc" ? (
                  <Nfc className="h-6 w-6 text-primary animate-pulse" />
                ) : (
                  <Scan className="h-6 w-6 text-primary animate-pulse" />
                )}
                <span className="text-sm font-medium">
                  {scanMethod === "nfc" ? "Hold card near device..." : "Point camera at QR code..."}
                </span>
              </div>
              <Progress value={scanProgress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">Scanning: {scanProgress}%</p>
            </div>

            {scanMethod === "qr" && (
              <div className="relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-lg" />
                <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
                </div>
              </div>
            )}

            <Button onClick={resetScan} variant="outline" className="w-full bg-transparent">
              Cancel Scan
            </Button>
          </div>
        )}

        {scanError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{scanError}</span>
          </div>
        )}

        {scanResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Patient Found!</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{scanResult.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {scanResult.age} years • {scanResult.gender} • {scanResult.bloodType}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Heart className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="text-sm font-medium">{scanResult.vitals.bloodPressure}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Last Visit</p>
                    <p className="text-sm font-medium">{scanResult.lastVisit}</p>
                  </div>
                </div>
              </div>

              {scanResult.conditions.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Medical Conditions:</p>
                  <div className="flex flex-wrap gap-1">
                    {scanResult.conditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-2 bg-accent/10 rounded">
                <Phone className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Emergency Contact</p>
                  <p className="text-sm font-medium">{scanResult.emergencyContact.name}</p>
                  <p className="text-xs text-muted-foreground">{scanResult.emergencyContact.phone}</p>
                </div>
              </div>
            </div>

            <Button onClick={resetScan} className="w-full">
              Scan Another Card
            </Button>
          </div>
        )}

        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            Encrypted Offline Storage Active
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
