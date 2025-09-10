"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import SymptomChecker from "@/components/symptom-checker"
import type { PatientData } from "@/lib/offline-storage"
import type { SymptomCheckResult } from "@/lib/symptom-checker-service"

export default function SymptomCheckerPage() {
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null)

  const handleResultGenerated = (result: SymptomCheckResult) => {
    console.log("Symptom check result:", result)
    // Could integrate with medicine bot or doctor consultation here
  }

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
          <h1 className="text-2xl font-bold text-foreground">AI Symptom Checker</h1>
          <p className="text-muted-foreground">Check your symptoms and get AI-powered health insights</p>
        </div>
      </div>

      {/* Symptom Checker */}
      <SymptomChecker currentPatient={currentPatient} onResultGenerated={handleResultGenerated} />
    </div>
  )
}
