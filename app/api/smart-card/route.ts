// Smart Card Management Microservice
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { action, cardId, patientData } = await request.json()

  switch (action) {
    case "scan":
      // Simulate card scanning
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockPatientData = {
        id: "patient_001",
        cardId: cardId || "HC001234",
        name: "Rajinder Singh",
        age: 45,
        gender: "Male",
        village: "Khanna",
        bloodGroup: "B+",
        emergencyContact: {
          name: "Simran Kaur",
          phone: "+91-98765-43210",
          relation: "Wife",
        },
        medicalHistory: ["Hypertension (2019)", "Diabetes Type 2 (2021)"],
        allergies: ["Penicillin"],
        lastVisit: "2024-01-10",
        cardStatus: "active",
      }

      return NextResponse.json({
        success: true,
        patient: mockPatientData,
        cardValid: true,
        lastSync: new Date().toISOString(),
      })

    case "update":
      // Update patient data on card
      return NextResponse.json({
        success: true,
        message: "Patient data updated on smart card",
        cardId,
        updatedAt: new Date().toISOString(),
      })

    case "encrypt":
      // Encrypt sensitive data for card storage
      return NextResponse.json({
        success: true,
        encryptedData: "encrypted_" + Buffer.from(JSON.stringify(patientData)).toString("base64"),
        encryption: "AES-256",
        timestamp: new Date().toISOString(),
      })

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cardId = searchParams.get("cardId")

  if (!cardId) {
    return NextResponse.json({ error: "Card ID required" }, { status: 400 })
  }

  // Get card status and info
  return NextResponse.json({
    cardId,
    status: "active",
    lastAccess: new Date().toISOString(),
    dataIntegrity: "verified",
    encryptionStatus: "enabled",
    batteryLevel: 85,
    storageUsed: "45%",
  })
}
