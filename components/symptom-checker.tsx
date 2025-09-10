"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  CheckCircle,
  AlertTriangle,
  Brain,
  Stethoscope,
  Clock,
  ArrowRight,
  Plus,
  Minus,
  Heart,
  Phone,
} from "lucide-react"
import { symptomCheckerService, type Symptom, type SymptomCheckResult } from "@/lib/symptom-checker-service"
import type { PatientData } from "@/lib/offline-storage"

interface SymptomCheckerProps {
  currentPatient?: PatientData | null
  onResultGenerated?: (result: SymptomCheckResult) => void
}

export default function SymptomChecker({ currentPatient, onResultGenerated }: SymptomCheckerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Symptom[]>([])
  const [currentStep, setCurrentStep] = useState<"selection" | "analysis" | "results">("selection")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SymptomCheckResult | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = symptomCheckerService.getSymptomCategories()

  const handleSymptomToggle = (symptomId: string) => {
    const newSelection = new Set(selectedSymptoms)
    if (newSelection.has(symptomId)) {
      newSelection.delete(symptomId)
    } else {
      newSelection.add(symptomId)
    }
    setSelectedSymptoms(newSelection)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = symptomCheckerService.searchSymptoms(query)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.size === 0) return

    setCurrentStep("analysis")
    setIsAnalyzing(true)

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const result = symptomCheckerService.analyzeSymptoms(Array.from(selectedSymptoms))
    setAnalysisResult(result)

    // Save the symptom check
    symptomCheckerService.saveSymptomCheck(result, currentPatient?.id)

    if (onResultGenerated) {
      onResultGenerated(result)
    }

    setIsAnalyzing(false)
    setCurrentStep("results")
  }

  const resetChecker = () => {
    setSelectedSymptoms(new Set())
    setSearchQuery("")
    setSearchResults([])
    setCurrentStep("selection")
    setAnalysisResult(null)
    setSelectedCategory(null)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "default"
      case "moderate":
        return "secondary"
      case "severe":
        return "destructive"
      case "emergency":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
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

  if (currentStep === "analysis") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            Analyzing Your Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Stethoscope className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">AI is analyzing your symptoms...</h3>
              <p className="text-sm text-muted-foreground">
                Processing {selectedSymptoms.size} symptoms to identify possible conditions
              </p>
            </div>
            <Progress value={66} className="w-full" />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Selected Symptoms:</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedSymptoms).map((symptomId) => {
                const symptom = symptomCheckerService.getSymptomById(symptomId)
                return symptom ? (
                  <Badge key={symptomId} variant="secondary" className="text-xs">
                    {symptom.icon} {symptom.name}
                  </Badge>
                ) : null
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (currentStep === "results" && analysisResult) {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Symptom Analysis Results
            </CardTitle>
            {currentPatient && <p className="text-sm text-muted-foreground">Analysis for: {currentPatient.name}</p>}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Severity</p>
                <Badge variant={getSeverityColor(analysisResult.estimatedSeverity)} className="text-sm">
                  {analysisResult.estimatedSeverity.toUpperCase()}
                </Badge>
              </div>
              <Button onClick={resetChecker} variant="outline" size="sm">
                New Check
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Warning Flags */}
        {analysisResult.warningFlags.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {analysisResult.warningFlags.map((flag, index) => (
                  <p key={index} className="font-medium">
                    {flag}
                  </p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Possible Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Possible Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisResult.possibleConditions.map((condition, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{condition.condition}</h4>
                      <p className="text-sm text-muted-foreground">{condition.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getUrgencyColor(condition.urgency)} className="text-xs mb-1">
                        {condition.urgency}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{Math.round(condition.probability * 100)}% match</p>
                    </div>
                  </div>
                  <Progress value={condition.probability * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysisResult.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisResult.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Actions */}
        {analysisResult.estimatedSeverity === "emergency" && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Phone className="h-5 w-5" />
                Emergency Actions Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="destructive" className="w-full" size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Emergency Services
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Your symptoms may indicate a medical emergency. Seek immediate medical attention.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            AI Symptom Checker
          </CardTitle>
          <p className="text-sm text-muted-foreground">Select your symptoms to get AI-powered health insights</p>
        </CardHeader>
        <CardContent>
          {selectedSymptoms.size > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Selected Symptoms ({selectedSymptoms.size})</p>
                <Button onClick={() => setSelectedSymptoms(new Set())} variant="ghost" size="sm">
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedSymptoms).map((symptomId) => {
                  const symptom = symptomCheckerService.getSymptomById(symptomId)
                  return symptom ? (
                    <Badge
                      key={symptomId}
                      variant="default"
                      className="text-xs cursor-pointer"
                      onClick={() => handleSymptomToggle(symptomId)}
                    >
                      {symptom.icon} {symptom.name} ×
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          )}

          {selectedSymptoms.size > 0 && (
            <Button onClick={analyzeSymptoms} className="w-full" size="lg">
              <Brain className="h-4 w-4 mr-2" />
              Analyze Symptoms ({selectedSymptoms.size})
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Search Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search for symptoms (e.g., headache, fever, cough)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((symptom) => (
                  <div
                    key={symptom.id}
                    className={`border rounded p-3 cursor-pointer transition-colors ${
                      selectedSymptoms.has(symptom.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleSymptomToggle(symptom.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{symptom.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{symptom.name}</p>
                          <p className="text-xs text-muted-foreground">{symptom.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(symptom.severity)} className="text-xs">
                          {symptom.severity}
                        </Badge>
                        {selectedSymptoms.has(symptom.id) ? (
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

      {/* Symptom Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Browse by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {categories.map((category) => (
              <div key={category.id}>
                <Button
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                  <ArrowRight
                    className={`h-4 w-4 ml-auto transition-transform ${
                      selectedCategory === category.id ? "rotate-90" : ""
                    }`}
                  />
                </Button>

                {selectedCategory === category.id && (
                  <div className="mt-3 space-y-2 pl-4">
                    {category.symptoms.map((symptom) => (
                      <div
                        key={symptom.id}
                        className={`border rounded p-2 cursor-pointer text-sm transition-colors ${
                          selectedSymptoms.has(symptom.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSymptomToggle(symptom.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{symptom.icon}</span>
                            <span className="font-medium">{symptom.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(symptom.severity)} className="text-xs">
                              {symptom.severity}
                            </Badge>
                            {selectedSymptoms.has(symptom.id) ? (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            ) : (
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
