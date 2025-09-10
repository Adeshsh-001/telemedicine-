"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Pill, Search, AlertTriangle, CheckCircle, FileText, Plus, Minus, Brain, Stethoscope } from "lucide-react"
import { medicineService, type Medicine, type SymptomAnalysis, type MedicinePrescription } from "@/lib/medicine-service"
import type { PatientData } from "@/lib/offline-storage"

interface MedicinePrescriptionBotProps {
  currentPatient: PatientData | null
  symptoms?: string[]
  onPrescriptionGenerated?: (prescription: MedicinePrescription) => void
}

export default function MedicinePrescriptionBot({
  currentPatient,
  symptoms = [],
  onPrescriptionGenerated,
}: MedicinePrescriptionBotProps) {
  const [symptomInput, setSymptomInput] = useState(symptoms.join(", "))
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null)
  const [selectedMedicines, setSelectedMedicines] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Medicine[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [prescription, setPrescription] = useState<MedicinePrescription | null>(null)
  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")

  const handleAnalyzeSymptoms = async () => {
    if (!symptomInput.trim()) return

    setIsAnalyzing(true)

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const symptomsList = symptomInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const result = medicineService.analyzeSymptoms(symptomsList)
    setAnalysis(result)

    // Auto-select recommended medicines
    const recommendedIds = new Set(result.recommendedMedicines.map((med) => med.id))
    setSelectedMedicines(recommendedIds)

    setIsAnalyzing(false)
  }

  const handleSearchMedicines = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = medicineService.searchMedicines(query)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const toggleMedicineSelection = (medicineId: string) => {
    const newSelection = new Set(selectedMedicines)
    if (newSelection.has(medicineId)) {
      newSelection.delete(medicineId)
    } else {
      newSelection.add(medicineId)
    }
    setSelectedMedicines(newSelection)
  }

  const generatePrescription = async () => {
    if (!analysis || !currentPatient || selectedMedicines.size === 0) return

    const selectedMedicinesList = Array.from(selectedMedicines).map((id) => ({ medicineId: id }))

    const newPrescription = medicineService.generatePrescription(
      currentPatient.id,
      analysis,
      selectedMedicinesList,
      "AI Medicine Bot",
      diagnosis || analysis.possibleConditions.join(", "),
      notes,
    )

    await medicineService.savePrescription(newPrescription)
    setPrescription(newPrescription)

    if (onPrescriptionGenerated) {
      onPrescriptionGenerated(newPrescription)
    }
  }

  const getAvailabilityColor = (availability: Medicine["availability"]) => {
    switch (availability) {
      case "available":
        return "default"
      case "low_stock":
        return "secondary"
      case "out_of_stock":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getSeverityColor = (severity: SymptomAnalysis["severity"]) => {
    switch (severity) {
      case "low":
        return "default"
      case "medium":
        return "secondary"
      case "high":
        return "destructive"
      case "emergency":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (prescription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generated Prescription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 p-4 rounded-lg">
            <h3 className="font-semibold text-primary mb-2">Patient: {currentPatient?.name}</h3>
            <p className="text-sm text-muted-foreground">Prescription ID: {prescription.id}</p>
            <p className="text-sm text-muted-foreground">
              Generated: {new Date(prescription.prescribedAt).toLocaleString()}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Prescribed Medicines:</h4>
            <div className="space-y-3">
              {prescription.medicines.map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{item.medicine.name}</p>
                      <p className="text-sm text-muted-foreground">{item.medicine.genericName}</p>
                    </div>
                    <Badge variant="outline">₹{item.medicine.price}</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Dosage:</strong> {item.dosage}
                    </p>
                    <p>
                      <strong>Frequency:</strong> {item.frequency}
                    </p>
                    <p>
                      <strong>Duration:</strong> {item.duration}
                    </p>
                    <p>
                      <strong>Instructions:</strong> {item.instructions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {prescription.notes && (
            <div>
              <h4 className="font-semibold mb-2">Additional Notes:</h4>
              <p className="text-sm bg-muted p-3 rounded-lg">{prescription.notes}</p>
            </div>
          )}

          <Button onClick={() => setPrescription(null)} variant="outline" className="w-full">
            Create New Prescription
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Symptom Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Medicine Prescription Bot
          </CardTitle>
          <p className="text-sm text-muted-foreground">Describe symptoms to get AI-powered medicine recommendations</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!currentPatient && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Please scan a patient card first to generate prescriptions</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Enter Symptoms (comma-separated)</label>
            <Textarea
              placeholder="e.g., fever, headache, cough, stomach pain"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleAnalyzeSymptoms} disabled={!symptomInput.trim() || isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing Symptoms...
              </>
            ) : (
              <>
                <Stethoscope className="h-4 w-4 mr-2" />
                Analyze Symptoms
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Warning Flags */}
            {analysis.warningFlags.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {analysis.warningFlags.map((flag, index) => (
                      <p key={index}>{flag}</p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Severity & Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Severity Level</h4>
                <Badge variant={getSeverityColor(analysis.severity)} className="text-sm">
                  {analysis.severity.toUpperCase()}
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Possible Conditions</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.possibleConditions.map((condition, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* General Advice */}
            <div>
              <h4 className="font-semibold mb-2">General Advice</h4>
              <ul className="text-sm space-y-1">
                {analysis.generalAdvice.map((advice, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {advice}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Medicines */}
      {analysis && analysis.recommendedMedicines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Recommended Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.recommendedMedicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedMedicines.has(medicine.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => toggleMedicineSelection(medicine.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{medicine.name}</h4>
                        {selectedMedicines.has(medicine.id) ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{medicine.genericName}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getAvailabilityColor(medicine.availability)} className="text-xs mb-1">
                        {medicine.availability.replace("_", " ")}
                      </Badge>
                      <p className="text-sm font-medium">₹{medicine.price}</p>
                    </div>
                  </div>

                  <p className="text-sm mb-2">{medicine.description}</p>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <strong>Dosage:</strong> {medicine.dosage} {medicine.frequency}
                    </p>
                    <p>
                      <strong>Duration:</strong> {medicine.duration}
                    </p>
                    {medicine.requiresPrescription && (
                      <Badge variant="secondary" className="text-xs">
                        Prescription Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medicine Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search Additional Medicines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search medicines by name, category, or condition..."
              value={searchQuery}
              onChange={(e) => handleSearchMedicines(e.target.value)}
            />

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((medicine) => (
                  <div
                    key={medicine.id}
                    className={`border rounded p-2 cursor-pointer text-sm ${
                      selectedMedicines.has(medicine.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleMedicineSelection(medicine.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-xs text-muted-foreground">{medicine.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">₹{medicine.price}</span>
                        {selectedMedicines.has(medicine.id) ? (
                          <Minus className="h-4 w-4 text-destructive" />
                        ) : (
                          <Plus className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prescription Generation */}
      {analysis && selectedMedicines.size > 0 && currentPatient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generate Prescription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Diagnosis</label>
              <Input
                placeholder="Enter diagnosis or condition"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Additional Notes</label>
              <Textarea
                placeholder="Any additional instructions or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">Selected Medicines ({selectedMedicines.size}):</p>
              <div className="space-y-1">
                {Array.from(selectedMedicines).map((id) => {
                  const medicine = medicineService.getMedicineById(id)
                  return medicine ? (
                    <div key={id} className="flex items-center justify-between text-xs">
                      <span>{medicine.name}</span>
                      <span>₹{medicine.price}</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>

            <Button onClick={generatePrescription} className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Generate Prescription
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
