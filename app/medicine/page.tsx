"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import MedicinePrescriptionBot from "@/components/medicine-prescription-bot"
import type { PatientData } from "@/lib/offline-storage"

export default function MedicinePage() {
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null)

  return (
    <div className="min-h-screen bg-background p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Medicine Bot</h1>
          <p className="text-muted-foreground">Get AI-powered medicine recommendations</p>
        </div>
      </div>

      {/* Medicine Prescription Bot */}
      <MedicinePrescriptionBot
        currentPatient={currentPatient}
        onPrescriptionGenerated={(prescription) => {
          console.log("Prescription generated:", prescription)
        }}
      />
    </div>
  )
}
