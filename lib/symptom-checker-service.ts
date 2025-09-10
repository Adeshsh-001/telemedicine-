export interface Symptom {
  id: string
  name: string
  category: string
  severity: "mild" | "moderate" | "severe"
  icon: string
  description: string
  commonCauses: string[]
  relatedSymptoms: string[]
}

export interface SymptomCategory {
  id: string
  name: string
  icon: string
  symptoms: Symptom[]
}

export interface SymptomCheckResult {
  selectedSymptoms: Symptom[]
  possibleConditions: {
    condition: string
    probability: number
    description: string
    urgency: "low" | "medium" | "high" | "emergency"
  }[]
  recommendations: string[]
  warningFlags: string[]
  nextSteps: string[]
  estimatedSeverity: "mild" | "moderate" | "severe" | "emergency"
}

class SymptomCheckerService {
  private symptoms: Symptom[] = [
    // General Symptoms
    {
      id: "fever",
      name: "Fever",
      category: "general",
      severity: "moderate",
      icon: "🌡️",
      description: "Body temperature above normal",
      commonCauses: ["Infection", "Inflammation"],
      relatedSymptoms: ["headache", "fatigue"],
    },
    {
      id: "headache",
      name: "Headache",
      category: "general",
      severity: "mild",
      icon: "🤕",
      description: "Pain in head or neck area",
      commonCauses: ["Tension", "Dehydration", "Infection"],
      relatedSymptoms: ["fever", "nausea"],
    },
    {
      id: "fatigue",
      name: "Fatigue",
      category: "general",
      severity: "mild",
      icon: "😴",
      description: "Extreme tiredness or exhaustion",
      commonCauses: ["Lack of sleep", "Illness", "Stress"],
      relatedSymptoms: ["weakness", "dizziness"],
    },
    {
      id: "weakness",
      name: "Weakness",
      category: "general",
      severity: "moderate",
      icon: "💪",
      description: "Lack of physical strength",
      commonCauses: ["Illness", "Malnutrition", "Dehydration"],
      relatedSymptoms: ["fatigue", "dizziness"],
    },
    {
      id: "dizziness",
      name: "Dizziness",
      category: "general",
      severity: "moderate",
      icon: "💫",
      description: "Feeling unsteady or lightheaded",
      commonCauses: ["Low blood pressure", "Dehydration", "Inner ear problems"],
      relatedSymptoms: ["nausea", "weakness"],
    },

    // Respiratory Symptoms
    {
      id: "cough",
      name: "Cough",
      category: "respiratory",
      severity: "mild",
      icon: "😷",
      description: "Forceful expulsion of air from lungs",
      commonCauses: ["Cold", "Flu", "Allergies"],
      relatedSymptoms: ["sore_throat", "runny_nose"],
    },
    {
      id: "sore_throat",
      name: "Sore Throat",
      category: "respiratory",
      severity: "mild",
      icon: "🗣️",
      description: "Pain or irritation in throat",
      commonCauses: ["Viral infection", "Bacterial infection"],
      relatedSymptoms: ["cough", "fever"],
    },
    {
      id: "runny_nose",
      name: "Runny Nose",
      category: "respiratory",
      severity: "mild",
      icon: "👃",
      description: "Nasal discharge",
      commonCauses: ["Cold", "Allergies", "Sinus infection"],
      relatedSymptoms: ["cough", "sneezing"],
    },
    {
      id: "shortness_breath",
      name: "Shortness of Breath",
      category: "respiratory",
      severity: "severe",
      icon: "🫁",
      description: "Difficulty breathing or feeling breathless",
      commonCauses: ["Asthma", "Heart problems", "Lung infection"],
      relatedSymptoms: ["chest_pain", "wheezing"],
    },
    {
      id: "chest_pain",
      name: "Chest Pain",
      category: "respiratory",
      severity: "severe",
      icon: "💔",
      description: "Pain or discomfort in chest area",
      commonCauses: ["Heart problems", "Lung issues", "Muscle strain"],
      relatedSymptoms: ["shortness_breath", "palpitations"],
    },

    // Digestive Symptoms
    {
      id: "nausea",
      name: "Nausea",
      category: "digestive",
      severity: "mild",
      icon: "🤢",
      description: "Feeling of sickness with urge to vomit",
      commonCauses: ["Food poisoning", "Pregnancy", "Motion sickness"],
      relatedSymptoms: ["vomiting", "stomach_pain"],
    },
    {
      id: "vomiting",
      name: "Vomiting",
      category: "digestive",
      severity: "moderate",
      icon: "🤮",
      description: "Forceful expulsion of stomach contents",
      commonCauses: ["Food poisoning", "Gastroenteritis", "Pregnancy"],
      relatedSymptoms: ["nausea", "dehydration"],
    },
    {
      id: "stomach_pain",
      name: "Stomach Pain",
      category: "digestive",
      severity: "moderate",
      icon: "🤰",
      description: "Pain or discomfort in abdominal area",
      commonCauses: ["Indigestion", "Gas", "Infection"],
      relatedSymptoms: ["nausea", "bloating"],
    },
    {
      id: "diarrhea",
      name: "Diarrhea",
      category: "digestive",
      severity: "moderate",
      icon: "🚽",
      description: "Loose or watery bowel movements",
      commonCauses: ["Food poisoning", "Infection", "Medication"],
      relatedSymptoms: ["stomach_pain", "dehydration"],
    },
    {
      id: "constipation",
      name: "Constipation",
      category: "digestive",
      severity: "mild",
      icon: "🚫",
      description: "Difficulty passing bowel movements",
      commonCauses: ["Poor diet", "Dehydration", "Lack of exercise"],
      relatedSymptoms: ["stomach_pain", "bloating"],
    },

    // Skin Symptoms
    {
      id: "rash",
      name: "Skin Rash",
      category: "skin",
      severity: "mild",
      icon: "🔴",
      description: "Red, irritated patches on skin",
      commonCauses: ["Allergies", "Infection", "Irritation"],
      relatedSymptoms: ["itching", "swelling"],
    },
    {
      id: "itching",
      name: "Itching",
      category: "skin",
      severity: "mild",
      icon: "✋",
      description: "Uncomfortable sensation causing urge to scratch",
      commonCauses: ["Dry skin", "Allergies", "Infection"],
      relatedSymptoms: ["rash", "swelling"],
    },
    {
      id: "swelling",
      name: "Swelling",
      category: "skin",
      severity: "moderate",
      icon: "🎈",
      description: "Enlargement of body parts due to fluid buildup",
      commonCauses: ["Injury", "Infection", "Allergic reaction"],
      relatedSymptoms: ["pain", "redness"],
    },

    // Pain Symptoms
    {
      id: "joint_pain",
      name: "Joint Pain",
      category: "pain",
      severity: "moderate",
      icon: "🦴",
      description: "Pain in joints or bones",
      commonCauses: ["Arthritis", "Injury", "Overuse"],
      relatedSymptoms: ["stiffness", "swelling"],
    },
    {
      id: "muscle_pain",
      name: "Muscle Pain",
      category: "pain",
      severity: "mild",
      icon: "💪",
      description: "Pain or soreness in muscles",
      commonCauses: ["Exercise", "Strain", "Infection"],
      relatedSymptoms: ["stiffness", "weakness"],
    },
    {
      id: "back_pain",
      name: "Back Pain",
      category: "pain",
      severity: "moderate",
      icon: "🔙",
      description: "Pain in back or spine area",
      commonCauses: ["Poor posture", "Strain", "Injury"],
      relatedSymptoms: ["stiffness", "muscle_pain"],
    },
  ]

  private categories: SymptomCategory[] = [
    {
      id: "general",
      name: "General Symptoms",
      icon: "🌡️",
      symptoms: this.symptoms.filter((s) => s.category === "general"),
    },
    {
      id: "respiratory",
      name: "Breathing & Chest",
      icon: "🫁",
      symptoms: this.symptoms.filter((s) => s.category === "respiratory"),
    },
    {
      id: "digestive",
      name: "Stomach & Digestion",
      icon: "🤰",
      symptoms: this.symptoms.filter((s) => s.category === "digestive"),
    },
    {
      id: "skin",
      name: "Skin & External",
      icon: "🔴",
      symptoms: this.symptoms.filter((s) => s.category === "skin"),
    },
    {
      id: "pain",
      name: "Pain & Discomfort",
      icon: "⚡",
      symptoms: this.symptoms.filter((s) => s.category === "pain"),
    },
  ]

  private conditionDatabase = [
    {
      condition: "Common Cold",
      symptoms: ["cough", "runny_nose", "sore_throat", "fatigue"],
      probability: 0.8,
      description: "Viral infection of upper respiratory tract",
      urgency: "low" as const,
    },
    {
      condition: "Flu (Influenza)",
      symptoms: ["fever", "headache", "muscle_pain", "fatigue", "cough"],
      probability: 0.75,
      description: "Viral infection causing systemic symptoms",
      urgency: "medium" as const,
    },
    {
      condition: "Food Poisoning",
      symptoms: ["nausea", "vomiting", "diarrhea", "stomach_pain"],
      probability: 0.7,
      description: "Illness from contaminated food or water",
      urgency: "medium" as const,
    },
    {
      condition: "Gastroenteritis",
      symptoms: ["stomach_pain", "diarrhea", "nausea", "fever"],
      probability: 0.65,
      description: "Inflammation of stomach and intestines",
      urgency: "medium" as const,
    },
    {
      condition: "Allergic Reaction",
      symptoms: ["rash", "itching", "swelling", "runny_nose"],
      probability: 0.6,
      description: "Immune system response to allergen",
      urgency: "medium" as const,
    },
    {
      condition: "Dehydration",
      symptoms: ["dizziness", "weakness", "fatigue", "headache"],
      probability: 0.55,
      description: "Insufficient fluid in the body",
      urgency: "medium" as const,
    },
    {
      condition: "Heart Attack",
      symptoms: ["chest_pain", "shortness_breath", "nausea", "dizziness"],
      probability: 0.9,
      description: "Blocked blood flow to heart muscle",
      urgency: "emergency" as const,
    },
    {
      condition: "Severe Allergic Reaction",
      symptoms: ["shortness_breath", "swelling", "rash", "dizziness"],
      probability: 0.85,
      description: "Life-threatening allergic reaction",
      urgency: "emergency" as const,
    },
  ]

  getSymptomCategories(): SymptomCategory[] {
    return this.categories
  }

  getSymptomById(id: string): Symptom | undefined {
    return this.symptoms.find((symptom) => symptom.id === id)
  }

  searchSymptoms(query: string): Symptom[] {
    const searchTerm = query.toLowerCase()
    return this.symptoms.filter(
      (symptom) =>
        symptom.name.toLowerCase().includes(searchTerm) ||
        symptom.description.toLowerCase().includes(searchTerm) ||
        symptom.commonCauses.some((cause) => cause.toLowerCase().includes(searchTerm)),
    )
  }

  analyzeSymptoms(selectedSymptomIds: string[]): SymptomCheckResult {
    const selectedSymptoms = selectedSymptomIds.map((id) => this.getSymptomById(id)).filter(Boolean) as Symptom[]

    // Calculate possible conditions
    const possibleConditions = this.conditionDatabase
      .map((condition) => {
        const matchingSymptoms = condition.symptoms.filter((symptomId) => selectedSymptomIds.includes(symptomId))
        const matchRatio = matchingSymptoms.length / condition.symptoms.length
        const adjustedProbability = condition.probability * matchRatio

        return {
          ...condition,
          probability: adjustedProbability,
        }
      })
      .filter((condition) => condition.probability > 0.2)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3)

    // Determine overall severity
    const severityScores = { mild: 1, moderate: 2, severe: 3, emergency: 4 }
    const maxSeverity = Math.max(...selectedSymptoms.map((s) => severityScores[s.severity]))
    let estimatedSeverity: "mild" | "moderate" | "severe" | "emergency" = "mild"

    if (maxSeverity >= 4) estimatedSeverity = "emergency"
    else if (maxSeverity >= 3) estimatedSeverity = "severe"
    else if (maxSeverity >= 2) estimatedSeverity = "moderate"

    // Check for emergency symptoms
    const emergencySymptoms = ["chest_pain", "shortness_breath"]
    const hasEmergencySymptoms = selectedSymptomIds.some((id) => emergencySymptoms.includes(id))
    if (hasEmergencySymptoms) estimatedSeverity = "emergency"

    // Generate recommendations
    const recommendations = this.generateRecommendations(selectedSymptoms, estimatedSeverity)
    const warningFlags = this.generateWarningFlags(selectedSymptoms, possibleConditions)
    const nextSteps = this.generateNextSteps(estimatedSeverity, possibleConditions)

    return {
      selectedSymptoms,
      possibleConditions,
      recommendations,
      warningFlags,
      nextSteps,
      estimatedSeverity,
    }
  }

  private generateRecommendations(symptoms: Symptom[], severity: string): string[] {
    const recommendations = [
      "Stay hydrated by drinking plenty of water",
      "Get adequate rest and sleep",
      "Monitor your symptoms closely",
    ]

    if (symptoms.some((s) => s.id === "fever")) {
      recommendations.push("Use cool compresses to reduce fever")
      recommendations.push("Take paracetamol if fever is high")
    }

    if (symptoms.some((s) => s.id === "cough")) {
      recommendations.push("Use honey or warm salt water for throat relief")
    }

    if (symptoms.some((s) => s.id === "stomach_pain")) {
      recommendations.push("Eat bland foods like rice, bananas, toast")
      recommendations.push("Avoid spicy or fatty foods")
    }

    if (severity === "severe" || severity === "emergency") {
      recommendations.unshift("Seek immediate medical attention")
    }

    return recommendations
  }

  private generateWarningFlags(symptoms: Symptom[], conditions: any[]): string[] {
    const flags = []

    if (symptoms.some((s) => s.id === "chest_pain")) {
      flags.push("Chest pain can indicate serious heart or lung problems")
    }

    if (symptoms.some((s) => s.id === "shortness_breath")) {
      flags.push("Difficulty breathing requires immediate medical attention")
    }

    if (conditions.some((c) => c.urgency === "emergency")) {
      flags.push("Your symptoms may indicate a medical emergency")
    }

    if (symptoms.length > 5) {
      flags.push("Multiple symptoms may indicate a serious condition")
    }

    return flags
  }

  private generateNextSteps(severity: string, conditions: any[]): string[] {
    const steps = []

    switch (severity) {
      case "emergency":
        steps.push("Call emergency services immediately")
        steps.push("Go to the nearest hospital")
        steps.push("Do not drive yourself - get someone to take you")
        break
      case "severe":
        steps.push("Contact a doctor within 24 hours")
        steps.push("Consider visiting a clinic or hospital")
        steps.push("Monitor symptoms closely for any worsening")
        break
      case "moderate":
        steps.push("Schedule an appointment with a healthcare provider")
        steps.push("Continue monitoring symptoms")
        steps.push("Contact ASHA worker for guidance")
        break
      case "mild":
        steps.push("Try home remedies and rest")
        steps.push("Contact healthcare provider if symptoms worsen")
        steps.push("Monitor for 2-3 days")
        break
    }

    return steps
  }

  saveSymptomCheck(result: SymptomCheckResult, patientId?: string): void {
    const checkRecord = {
      id: `symptom_check_${Date.now()}`,
      patientId: patientId || "anonymous",
      timestamp: new Date().toISOString(),
      result,
    }

    const existingChecks = JSON.parse(localStorage.getItem("symptom_checks") || "[]")
    existingChecks.push(checkRecord)
    localStorage.setItem("symptom_checks", JSON.stringify(existingChecks))
  }

  getSymptomCheckHistory(patientId: string): any[] {
    const checks = JSON.parse(localStorage.getItem("symptom_checks") || "[]")
    return checks.filter((check: any) => check.patientId === patientId)
  }
}

export const symptomCheckerService = new SymptomCheckerService()
