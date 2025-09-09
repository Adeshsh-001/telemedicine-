// Patient Management Microservice
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get("id")
  const village = searchParams.get("village")

  if (patientId) {
    // Get specific patient
    const patient = {
      id: patientId,
      name: "Rajinder Singh",
      age: 45,
      gender: "Male",
      village: "Khanna",
      cardId: "HC001234",
      healthRecords: [
        {
          date: "2024-01-15",
          symptoms: ["Fever", "Headache"],
          diagnosis: "Viral infection",
          treatment: "Rest and fluids",
        },
      ],
    }
    return NextResponse.json(patient)
  }

  // Get all patients for village
  const patients = [
    { id: "1", name: "Rajinder Singh", age: 45, status: "stable" },
    { id: "2", name: "Simran Kaur", age: 32, status: "monitoring" },
    { id: "3", name: "Harpreet Singh", age: 28, status: "healthy" },
  ]

  return NextResponse.json({ patients, village, total: patients.length })
}

export async function POST(request: NextRequest) {
  const patientData = await request.json()

  // Create new patient record
  const newPatient = {
    id: `patient_${Date.now()}`,
    ...patientData,
    createdAt: new Date().toISOString(),
    status: "active",
  }

  return NextResponse.json({
    success: true,
    patient: newPatient,
    message: "Patient registered successfully",
  })
}
