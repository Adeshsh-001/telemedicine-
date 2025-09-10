export interface Medicine {
  id: string
  name: string
  genericName: string
  category: string
  dosage: string
  frequency: string
  duration: string
  sideEffects: string[]
  contraindications: string[]
  price: number
  availability: "available" | "low_stock" | "out_of_stock"
  requiresPrescription: boolean
  description: string
}

export interface MedicinePrescription {
  id: string
  patientId: string
  medicines: {
    medicine: Medicine
    dosage: string
    frequency: string
    duration: string
    instructions: string
  }[]
  symptoms: string[]
  diagnosis: string
  prescribedBy: string
  prescribedAt: string
  notes: string
}

export interface SymptomAnalysis {
  symptoms: string[]
  possibleConditions: string[]
  severity: "low" | "medium" | "high" | "emergency"
  recommendedMedicines: Medicine[]
  generalAdvice: string[]
  warningFlags: string[]
}

class MedicineService {
  private medicines: Medicine[] = [
    {
      id: "med_001",
      name: "Paracetamol",
      genericName: "Acetaminophen",
      category: "Pain Relief",
      dosage: "500mg",
      frequency: "Every 6-8 hours",
      duration: "3-5 days",
      sideEffects: ["Nausea", "Skin rash (rare)"],
      contraindications: ["Liver disease", "Alcohol dependency"],
      price: 15,
      availability: "available",
      requiresPrescription: false,
      description: "Effective for fever and mild to moderate pain relief",
    },
    {
      id: "med_002",
      name: "Ibuprofen",
      genericName: "Ibuprofen",
      category: "Anti-inflammatory",
      dosage: "400mg",
      frequency: "Every 8 hours",
      duration: "3-7 days",
      sideEffects: ["Stomach upset", "Dizziness"],
      contraindications: ["Stomach ulcers", "Kidney disease", "Heart conditions"],
      price: 25,
      availability: "available",
      requiresPrescription: false,
      description: "Reduces inflammation, fever, and pain",
    },
    {
      id: "med_003",
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      category: "Antibiotic",
      dosage: "500mg",
      frequency: "Every 8 hours",
      duration: "7-10 days",
      sideEffects: ["Diarrhea", "Nausea", "Skin rash"],
      contraindications: ["Penicillin allergy"],
      price: 45,
      availability: "low_stock",
      requiresPrescription: true,
      description: "Antibiotic for bacterial infections",
    },
    {
      id: "med_004",
      name: "Cetirizine",
      genericName: "Cetirizine HCl",
      category: "Antihistamine",
      dosage: "10mg",
      frequency: "Once daily",
      duration: "5-7 days",
      sideEffects: ["Drowsiness", "Dry mouth"],
      contraindications: ["Severe kidney disease"],
      price: 20,
      availability: "available",
      requiresPrescription: false,
      description: "For allergic reactions and cold symptoms",
    },
    {
      id: "med_005",
      name: "Omeprazole",
      genericName: "Omeprazole",
      category: "Acid Reducer",
      dosage: "20mg",
      frequency: "Once daily before meals",
      duration: "14 days",
      sideEffects: ["Headache", "Stomach pain"],
      contraindications: ["Liver disease"],
      price: 35,
      availability: "available",
      requiresPrescription: false,
      description: "Reduces stomach acid production",
    },
    {
      id: "med_006",
      name: "Salbutamol",
      genericName: "Salbutamol",
      category: "Bronchodilator",
      dosage: "2 puffs",
      frequency: "As needed",
      duration: "As prescribed",
      sideEffects: ["Tremor", "Increased heart rate"],
      contraindications: ["Heart rhythm disorders"],
      price: 120,
      availability: "available",
      requiresPrescription: true,
      description: "Inhaler for asthma and breathing difficulties",
    },
  ]

  private symptomMedicineMap: Record<string, string[]> = {
    fever: ["med_001", "med_002"],
    headache: ["med_001", "med_002"],
    pain: ["med_001", "med_002"],
    cough: ["med_004"],
    cold: ["med_004"],
    allergy: ["med_004"],
    stomach_pain: ["med_005"],
    acidity: ["med_005"],
    breathing_difficulty: ["med_006"],
    asthma: ["med_006"],
  }

  analyzeSymptoms(symptoms: string[]): SymptomAnalysis {
    const normalizedSymptoms = symptoms.map((s) => s.toLowerCase().trim())
    const recommendedMedicineIds = new Set<string>()
    const possibleConditions: string[] = []
    const warningFlags: string[] = []
    let severity: "low" | "medium" | "high" | "emergency" = "low"

    // Analyze each symptom
    normalizedSymptoms.forEach((symptom) => {
      // Check for emergency symptoms
      if (["chest_pain", "difficulty_breathing", "severe_bleeding", "unconscious"].includes(symptom)) {
        severity = "emergency"
        warningFlags.push("Emergency symptoms detected - seek immediate medical attention")
      }

      // Check for high severity symptoms
      if (["high_fever", "severe_pain", "persistent_vomiting"].includes(symptom)) {
        severity = severity === "emergency" ? "emergency" : "high"
      }

      // Map symptoms to medicines
      Object.keys(this.symptomMedicineMap).forEach((key) => {
        if (symptom.includes(key) || key.includes(symptom)) {
          this.symptomMedicineMap[key].forEach((medId) => recommendedMedicineIds.add(medId))

          // Add possible conditions
          if (key === "fever" || key === "headache") possibleConditions.push("Viral infection")
          if (key === "cough" || key === "cold") possibleConditions.push("Upper respiratory infection")
          if (key === "stomach_pain") possibleConditions.push("Gastritis")
          if (key === "allergy") possibleConditions.push("Allergic reaction")
        }
      })
    })

    // Get recommended medicines
    const recommendedMedicines = Array.from(recommendedMedicineIds)
      .map((id) => this.medicines.find((med) => med.id === id))
      .filter(Boolean) as Medicine[]

    // Set severity based on symptom combination
    if (normalizedSymptoms.length > 3 && severity === "low") severity = "medium"

    const generalAdvice = [
      "Stay hydrated by drinking plenty of water",
      "Get adequate rest and sleep",
      "Monitor symptoms and seek medical help if they worsen",
      "Take medicines as directed and complete the full course",
    ]

    if (severity === "high" || severity === "emergency") {
      generalAdvice.unshift("Consult a doctor immediately")
    }

    return {
      symptoms: normalizedSymptoms,
      possibleConditions: [...new Set(possibleConditions)],
      severity,
      recommendedMedicines,
      generalAdvice,
      warningFlags,
    }
  }

  getMedicineById(id: string): Medicine | undefined {
    return this.medicines.find((med) => med.id === id)
  }

  searchMedicines(query: string): Medicine[] {
    const searchTerm = query.toLowerCase()
    return this.medicines.filter(
      (med) =>
        med.name.toLowerCase().includes(searchTerm) ||
        med.genericName.toLowerCase().includes(searchTerm) ||
        med.category.toLowerCase().includes(searchTerm) ||
        med.description.toLowerCase().includes(searchTerm),
    )
  }

  getMedicinesByCategory(category: string): Medicine[] {
    return this.medicines.filter((med) => med.category === category)
  }

  checkMedicineAvailability(medicineId: string): Medicine["availability"] {
    const medicine = this.getMedicineById(medicineId)
    return medicine?.availability || "out_of_stock"
  }

  generatePrescription(
    patientId: string,
    analysis: SymptomAnalysis,
    selectedMedicines: { medicineId: string; customDosage?: string; customInstructions?: string }[],
    prescribedBy: string,
    diagnosis: string,
    notes = "",
  ): MedicinePrescription {
    const prescriptionMedicines = selectedMedicines.map((selected) => {
      const medicine = this.getMedicineById(selected.medicineId)!
      return {
        medicine,
        dosage: selected.customDosage || medicine.dosage,
        frequency: medicine.frequency,
        duration: medicine.duration,
        instructions:
          selected.customInstructions || `Take ${medicine.dosage} ${medicine.frequency} for ${medicine.duration}`,
      }
    })

    return {
      id: `prescription_${Date.now()}`,
      patientId,
      medicines: prescriptionMedicines,
      symptoms: analysis.symptoms,
      diagnosis,
      prescribedBy,
      prescribedAt: new Date().toISOString(),
      notes,
    }
  }

  async savePrescription(prescription: MedicinePrescription): Promise<void> {
    // Save to localStorage for offline functionality
    const existingPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
    existingPrescriptions.push(prescription)
    localStorage.setItem("prescriptions", JSON.stringify(existingPrescriptions))
  }

  getPrescriptionHistory(patientId: string): MedicinePrescription[] {
    const prescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
    return prescriptions.filter((p: MedicinePrescription) => p.patientId === patientId)
  }
}

export const medicineService = new MedicineService()
