interface Consultation {
  id: string
  patientId: string
  patientName: string
  ashaWorker: string
  ashaPhone: string
  symptoms: string[]
  vitals: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    weight?: number
    respiratoryRate?: number
  }
  voiceTranscription?: string
  aiAnalysis?: string
  urgency: "low" | "medium" | "high" | "emergency"
  status: "pending" | "in_review" | "responded" | "closed"
  submittedAt: string
  doctorId?: string
  doctorName?: string
  doctorResponse?: string
  diagnosis?: string
  treatment?: string
  followUp?: string
  respondedAt?: string
  attachments: string[]
  location: string
}

interface Doctor {
  id: string
  name: string
  specialization: string
  phone: string
  email: string
  isOnline: boolean
  assignedVillages: string[]
  consultationsToday: number
  rating: number
}

class ConsultationService {
  private consultations: Consultation[] = []
  private doctors: Doctor[] = [
    {
      id: "doc_001",
      name: "Dr. Harpreet Singh",
      specialization: "General Medicine",
      phone: "+91-98765-12345",
      email: "harpreet@hospital.com",
      isOnline: true,
      assignedVillages: ["Khanna Village", "Samrala Village"],
      consultationsToday: 12,
      rating: 4.8,
    },
    {
      id: "doc_002",
      name: "Dr. Simran Kaur",
      specialization: "Pediatrics",
      phone: "+91-98765-67890",
      email: "simran@hospital.com",
      isOnline: true,
      assignedVillages: ["Khanna Village"],
      consultationsToday: 8,
      rating: 4.9,
    },
    {
      id: "doc_003",
      name: "Dr. Rajesh Kumar",
      specialization: "Cardiology",
      phone: "+91-98765-11111",
      email: "rajesh@hospital.com",
      isOnline: false,
      assignedVillages: ["Khanna Village", "Ludhiana Rural"],
      consultationsToday: 5,
      rating: 4.7,
    },
  ]

  async submitConsultation(consultation: Omit<Consultation, "id" | "submittedAt" | "status">): Promise<string> {
    const newConsultation: Consultation = {
      ...consultation,
      id: `consult_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submittedAt: new Date().toISOString(),
      status: "pending",
    }

    // Auto-assign doctor based on urgency and availability
    const assignedDoctor = this.assignDoctor(consultation.urgency, consultation.location)
    if (assignedDoctor) {
      newConsultation.doctorId = assignedDoctor.id
      newConsultation.doctorName = assignedDoctor.name
      newConsultation.status = "in_review"
    }

    this.consultations.push(newConsultation)
    this.saveToStorage()

    // Send notification to assigned doctor
    if (assignedDoctor) {
      await this.notifyDoctor(assignedDoctor, newConsultation)
    }

    return newConsultation.id
  }

  private assignDoctor(urgency: string, location: string): Doctor | null {
    // Priority: Emergency -> Online doctors -> Specialists -> Any available
    const availableDoctors = this.doctors.filter((doc) => doc.assignedVillages.includes(location))

    if (urgency === "emergency") {
      const onlineDoctors = availableDoctors.filter((doc) => doc.isOnline)
      return onlineDoctors.length > 0 ? onlineDoctors[0] : availableDoctors[0]
    }

    // For non-emergency, prefer online doctors with lower workload
    availableDoctors.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1
      return a.consultationsToday - b.consultationsToday
    })

    return availableDoctors[0] || null
  }

  private async notifyDoctor(doctor: Doctor, consultation: Consultation): Promise<void> {
    // In real implementation, this would send push notification or SMS to doctor
    console.log(`Notifying ${doctor.name} about new ${consultation.urgency} consultation`)
  }

  async respondToConsultation(
    consultationId: string,
    doctorId: string,
    response: {
      diagnosis: string
      treatment: string
      followUp: string
      doctorResponse: string
    },
  ): Promise<boolean> {
    const consultation = this.consultations.find((c) => c.id === consultationId)
    if (!consultation) return false

    consultation.status = "responded"
    consultation.diagnosis = response.diagnosis
    consultation.treatment = response.treatment
    consultation.followUp = response.followUp
    consultation.doctorResponse = response.doctorResponse
    consultation.respondedAt = new Date().toISOString()

    this.saveToStorage()
    return true
  }

  getConsultationsByASHA(ashaWorker: string): Consultation[] {
    return this.consultations
      .filter((c) => c.ashaWorker === ashaWorker)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  }

  getConsultationsByDoctor(doctorId: string): Consultation[] {
    return this.consultations
      .filter((c) => c.doctorId === doctorId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  }

  getPendingConsultations(): Consultation[] {
    return this.consultations
      .filter((c) => c.status === "pending" || c.status === "in_review")
      .sort((a, b) => {
        // Sort by urgency first, then by time
        const urgencyOrder = { emergency: 0, high: 1, medium: 2, low: 3 }
        const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        if (urgencyDiff !== 0) return urgencyDiff
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      })
  }

  getAvailableDoctors(location: string): Doctor[] {
    return this.doctors
      .filter((doc) => doc.assignedVillages.includes(location))
      .sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1
        if (!a.isOnline && b.isOnline) return 1
        return a.consultationsToday - b.consultationsToday
      })
  }

  getConsultationById(id: string): Consultation | null {
    return this.consultations.find((c) => c.id === id) || null
  }

  private saveToStorage(): void {
    localStorage.setItem("consultations", JSON.stringify(this.consultations))
  }

  loadFromStorage(): void {
    const stored = localStorage.getItem("consultations")
    if (stored) {
      this.consultations = JSON.parse(stored)
    }
  }

  getStats() {
    const total = this.consultations.length
    const pending = this.consultations.filter((c) => c.status === "pending").length
    const inReview = this.consultations.filter((c) => c.status === "in_review").length
    const responded = this.consultations.filter((c) => c.status === "responded").length
    const emergency = this.consultations.filter((c) => c.urgency === "emergency").length

    return { total, pending, inReview, responded, emergency }
  }
}

export const consultationService = new ConsultationService()
export type { Consultation, Doctor }
