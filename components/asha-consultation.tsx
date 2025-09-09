"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Stethoscope, Send, Clock, User, MessageSquare, FileText } from "lucide-react"
import { consultationService, type Consultation } from "@/lib/consultation-service"
import type { PatientData } from "@/lib/offline-storage"

interface ASHAConsultationProps {
  currentPatient?: PatientData | null
  voiceTranscription?: string
  aiAnalysis?: string
}

export default function ASHAConsultation({ currentPatient, voiceTranscription, aiAnalysis }: ASHAConsultationProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [showNewConsultation, setShowNewConsultation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newConsultation, setNewConsultation] = useState({
    symptoms: [] as string[],
    symptomInput: "",
    vitals: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
    },
    urgency: "medium" as const,
    additionalNotes: "",
  })

  useEffect(() => {
    consultationService.loadFromStorage()
    loadConsultations()
  }, [])

  const loadConsultations = () => {
    const ashaConsultations = consultationService.getConsultationsByASHA("Current ASHA Worker")
    setConsultations(ashaConsultations)
  }

  const handleSubmitConsultation = async () => {
    if (!currentPatient) {
      alert("Please select a patient first")
      return
    }

    setIsSubmitting(true)

    try {
      const consultationData = {
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        ashaWorker: "Current ASHA Worker",
        ashaPhone: "+91-98765-99999",
        symptoms: newConsultation.symptoms,
        vitals: {
          bloodPressure: newConsultation.vitals.bloodPressure || undefined,
          heartRate: newConsultation.vitals.heartRate ? Number.parseInt(newConsultation.vitals.heartRate) : undefined,
          temperature: newConsultation.vitals.temperature
            ? Number.parseFloat(newConsultation.vitals.temperature)
            : undefined,
          weight: newConsultation.vitals.weight ? Number.parseFloat(newConsultation.vitals.weight) : undefined,
        },
        voiceTranscription,
        aiAnalysis,
        urgency: newConsultation.urgency,
        attachments: [],
        location: "Khanna Village",
      }

      await consultationService.submitConsultation(consultationData)

      // Reset form
      setNewConsultation({
        symptoms: [],
        symptomInput: "",
        vitals: { bloodPressure: "", heartRate: "", temperature: "", weight: "" },
        urgency: "medium",
        additionalNotes: "",
      })

      setShowNewConsultation(false)
      loadConsultations()
    } catch (error) {
      console.error("Failed to submit consultation:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSymptom = () => {
    if (newConsultation.symptomInput.trim()) {
      setNewConsultation({
        ...newConsultation,
        symptoms: [...newConsultation.symptoms, newConsultation.symptomInput.trim()],
        symptomInput: "",
      })
    }
  }

  const removeSymptom = (index: number) => {
    setNewConsultation({
      ...newConsultation,
      symptoms: newConsultation.symptoms.filter((_, i) => i !== index),
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "in_review":
        return "default"
      case "responded":
        return "default"
      case "closed":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Doctor Consultation Bridge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">ASHA Worker Portal</p>
              <p className="text-xs text-muted-foreground">Connect with doctors for medical guidance</p>
            </div>
            <Button onClick={() => setShowNewConsultation(true)} disabled={!currentPatient}>
              <Send className="h-4 w-4 mr-2" />
              New Consultation
            </Button>
          </div>
          {!currentPatient && (
            <p className="text-xs text-muted-foreground mt-2">Please scan a patient card to start consultation</p>
          )}
        </CardContent>
      </Card>

      {/* New Consultation Form */}
      {showNewConsultation && currentPatient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>New Consultation Request</span>
              <Button variant="ghost" size="sm" onClick={() => setShowNewConsultation(false)}>
                Cancel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Patient Info */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{currentPatient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentPatient.age} years • {currentPatient.gender} • {currentPatient.bloodType}
                  </p>
                </div>
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="text-sm font-medium">Symptoms</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Enter symptom..."
                  value={newConsultation.symptomInput}
                  onChange={(e) => setNewConsultation({ ...newConsultation, symptomInput: e.target.value })}
                  onKeyPress={(e) => e.key === "Enter" && addSymptom()}
                />
                <Button onClick={addSymptom} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newConsultation.symptoms.map((symptom, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeSymptom(index)}
                  >
                    {symptom} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Vitals */}
            <div>
              <label className="text-sm font-medium">Vital Signs</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <Input
                    placeholder="Blood Pressure"
                    value={newConsultation.vitals.bloodPressure}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        vitals: { ...newConsultation.vitals, bloodPressure: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Input
                    placeholder="Heart Rate (bpm)"
                    type="number"
                    value={newConsultation.vitals.heartRate}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        vitals: { ...newConsultation.vitals, heartRate: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Input
                    placeholder="Temperature (°F)"
                    type="number"
                    step="0.1"
                    value={newConsultation.vitals.temperature}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        vitals: { ...newConsultation.vitals, temperature: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Input
                    placeholder="Weight (kg)"
                    type="number"
                    value={newConsultation.vitals.weight}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        vitals: { ...newConsultation.vitals, weight: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="text-sm font-medium">Urgency Level</label>
              <Select
                value={newConsultation.urgency}
                onValueChange={(value: any) => setNewConsultation({ ...newConsultation, urgency: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Routine consultation</SelectItem>
                  <SelectItem value="medium">Medium - Needs attention</SelectItem>
                  <SelectItem value="high">High - Urgent care needed</SelectItem>
                  <SelectItem value="emergency">Emergency - Immediate attention</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voice & AI Data */}
            {(voiceTranscription || aiAnalysis) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Analysis Included</label>
                <div className="p-2 bg-primary/10 rounded text-xs">
                  <p>✓ Voice transcription attached</p>
                  <p>✓ AI symptom analysis included</p>
                </div>
              </div>
            )}

            <Button onClick={handleSubmitConsultation} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Consultation Request"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Consultation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Consultations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {consultations.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No consultations yet</p>
            ) : (
              consultations.map((consultation) => (
                <div key={consultation.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{consultation.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(consultation.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getUrgencyColor(consultation.urgency)}>{consultation.urgency}</Badge>
                      <Badge variant={getStatusColor(consultation.status)}>{consultation.status}</Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Symptoms:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {consultation.symptoms.map((symptom, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {consultation.doctorName && (
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      <span>Assigned to: {consultation.doctorName}</span>
                    </div>
                  )}

                  {consultation.status === "responded" && consultation.doctorResponse && (
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm font-medium text-primary mb-1">Doctor's Response:</p>
                      <p className="text-sm">{consultation.doctorResponse}</p>
                      {consultation.diagnosis && (
                        <div className="mt-2">
                          <p className="text-xs font-medium">Diagnosis: {consultation.diagnosis}</p>
                          <p className="text-xs">Treatment: {consultation.treatment}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {consultation.status === "pending" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Waiting for doctor assignment...</span>
                    </div>
                  )}

                  {consultation.status === "in_review" && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <MessageSquare className="h-4 w-4" />
                      <span>Under review by doctor...</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
