// Village Health Analytics Microservice
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const village = searchParams.get("village") || "all"
  const timeframe = searchParams.get("timeframe") || "30d"

  // Generate mock analytics data
  const analytics = {
    village,
    timeframe,
    summary: {
      totalPatients: 1247,
      activeConsultations: 23,
      emergencyAlerts: 3,
      vaccinationCoverage: 87.5,
      healthScore: 8.2,
    },
    trends: {
      consultationsThisMonth: 156,
      consultationsLastMonth: 142,
      emergencyCallsThisWeek: 8,
      emergencyCallsLastWeek: 12,
    },
    topConditions: [
      { condition: "Fever", cases: 45, trend: "+12%" },
      { condition: "Hypertension", cases: 32, trend: "-5%" },
      { condition: "Diabetes", cases: 28, trend: "+8%" },
      { condition: "Respiratory Issues", cases: 19, trend: "-15%" },
    ],
    ageGroups: {
      "0-18": { count: 312, percentage: 25 },
      "19-35": { count: 374, percentage: 30 },
      "36-60": { count: 436, percentage: 35 },
      "60+": { count: 125, percentage: 10 },
    },
    vaccinations: {
      completed: 1091,
      pending: 156,
      overdue: 23,
      coverage: 87.5,
    },
    alerts: [
      {
        type: "outbreak_risk",
        message: "Increased fever cases in sector 3",
        severity: "medium",
        timestamp: new Date().toISOString(),
      },
      {
        type: "vaccination_due",
        message: "23 children overdue for immunization",
        severity: "high",
        timestamp: new Date().toISOString(),
      },
    ],
  }

  return NextResponse.json(analytics)
}

export async function POST(request: NextRequest) {
  const { event, data } = await request.json()

  // Process analytics event
  const processedEvent = {
    id: `event_${Date.now()}`,
    type: event,
    data,
    timestamp: new Date().toISOString(),
    processed: true,
  }

  return NextResponse.json({
    success: true,
    event: processedEvent,
    message: "Analytics event processed successfully",
  })
}
