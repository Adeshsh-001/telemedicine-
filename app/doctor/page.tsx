"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Stethoscope, Clock, User, Phone, MessageSquare, Send } from "lucide-react"
import Link from "next/link"
import { consultationService, type Consultation } from "@/lib/consultation-service"

export default function DoctorPortal() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [response, setResponse] = useState({
    diagnosis: "",
    treatment: "",
    followUp: "",
    doctorResponse: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stats, setStats] = useState({ total: 0, pending: 0, inReview: 0, responded: 0, emergency: 0 })

  useEffect(() => {
    consultationService.loadFromStorage()
    loadConsultations()
    loadStats()
  }, [])

  const loadConsultations = () => {
    const pending = consultationService.getPendingConsultations()
    setConsultations(pending)
  }

  const loadStats = () => {
    const consultationStats = consultationService.getStats()
    setStats(consultationStats)
  }

  const handleSelectConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setResponse({
      diagnosis: consultation.diagnosis || "",
      treatment: consultation.treatment || "",
      followUp: consultation.followUp || "",
      doctorResponse: consultation.doctorResponse || "",
    })
  }

  const handleSubmitResponse = async () => {
    if (!selectedConsultation) return

    setIsSubmitting(true)
    try {
      await consultationService.respondToConsultation(
        selectedConsultation.id,
        "doc_001", // Current doctor ID
        response,
      )

      setSelectedConsultation(null)
      setResponse({ diagnosis: "", treatment: "", followUp: "", doctorResponse: "" })
      loadConsultations()
      loadStats()
    } catch (error) {
      console.error("Failed to submit response:", error)
    } finally {
      setIsSubmitting(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "in_review":
        return "default"
      case "responded":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doctor Portal</h1>
          <p className="text-muted-foreground">Review and respond to ASHA consultations</p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.inReview}</p>
            <p className="text-sm text-muted-foreground">In Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.responded}</p>
            <p className="text-sm text-muted-foreground">Responded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.emergency}</p>
            <p className="text-sm text-muted-foreground">Emergency</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultation List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {consultations.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No pending consultations</p>
              ) : (
                consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedConsultation?.id === consultation.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleSelectConsultation(consultation)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{consultation.patientName}</p>
                        <p className="text-sm text-muted-foreground">ASHA: {consultation.ashaWorker}</p>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant={getUrgencyColor(consultation.urgency)} className="text-xs">
                          {consultation.urgency}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm font-medium">Symptoms:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {consultation.symptoms.slice(0, 3).map((symptom, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                        {consultation.symptoms.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{consultation.symptoms.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(consultation.submittedAt).toLocaleString()}</span>
                      <span>{consultation.location}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consultation Details & Response */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              {selectedConsultation ? "Consultation Details" : "Select a Consultation"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedConsultation ? (
              <div className="space-y-4">
                {/* Patient Info */}
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{selectedConsultation.patientName}</p>
                      <p className="text-sm text-muted-foreground">Patient ID: {selectedConsultation.patientId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>
                      ASHA: {selectedConsultation.ashaWorker} ({selectedConsultation.ashaPhone})
                    </span>
                  </div>
                </div>

                {/* Symptoms & Vitals */}
                <div>
                  <h4 className="font-medium mb-2">Symptoms & Vitals</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Symptoms:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedConsultation.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {Object.keys(selectedConsultation.vitals).length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Vitals:</p>
                        <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                          {selectedConsultation.vitals.bloodPressure && (
                            <span>BP: {selectedConsultation.vitals.bloodPressure}</span>
                          )}
                          {selectedConsultation.vitals.heartRate && (
                            <span>HR: {selectedConsultation.vitals.heartRate} bpm</span>
                          )}
                          {selectedConsultation.vitals.temperature && (
                            <span>Temp: {selectedConsultation.vitals.temperature}°F</span>
                          )}
                          {selectedConsultation.vitals.weight && (
                            <span>Weight: {selectedConsultation.vitals.weight} kg</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Analysis */}
                {selectedConsultation.aiAnalysis && (
                  <div>
                    <h4 className="font-medium mb-2">AI Analysis</h4>
                    <div className="p-2 bg-primary/10 rounded text-sm">
                      <p>AI-powered symptom analysis available</p>
                    </div>
                  </div>
                )}

                {/* Voice Transcription */}
                {selectedConsultation.voiceTranscription && (
                  <div>
                    <h4 className="font-medium mb-2">Voice Recording</h4>
                    <div className="p-2 bg-muted rounded text-sm">
                      <p>{selectedConsultation.voiceTranscription}</p>
                    </div>
                  </div>
                )}

                {/* Response Form */}
                <div className="space-y-3">
                  <h4 className="font-medium">Medical Response</h4>

                  <div>
                    <label className="text-sm font-medium">Diagnosis</label>
                    <Input
                      placeholder="Enter diagnosis..."
                      value={response.diagnosis}
                      onChange={(e) => setResponse({ ...response, diagnosis: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Treatment Plan</label>
                    <Textarea
                      placeholder="Describe treatment recommendations..."
                      value={response.treatment}
                      onChange={(e) => setResponse({ ...response, treatment: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Follow-up Instructions</label>
                    <Textarea
                      placeholder="Follow-up care instructions..."
                      value={response.followUp}
                      onChange={(e) => setResponse({ ...response, followUp: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Message to ASHA Worker</label>
                    <Textarea
                      placeholder="Additional guidance for ASHA worker..."
                      value={response.doctorResponse}
                      onChange={(e) => setResponse({ ...response, doctorResponse: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <Button onClick={handleSubmitResponse} disabled={isSubmitting} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Send Response"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a consultation from the list to review and respond</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
