interface SMSAlert {
  id: string
  recipient: string
  message: string
  priority: "low" | "medium" | "high" | "emergency"
  type: "health_alert" | "emergency" | "vaccination" | "follow_up" | "outbreak"
  patientId?: string
  ashaWorker?: string
  timestamp: string
  status: "pending" | "sent" | "failed" | "queued"
  retryCount: number
}

interface EmergencyContact {
  name: string
  phone: string
  role: "doctor" | "hospital" | "family" | "asha" | "admin"
  priority: number
}

class SMSService {
  private alertQueue: SMSAlert[] = []
  private emergencyContacts: EmergencyContact[] = [
    { name: "Dr. Harpreet Singh", phone: "+91-98765-12345", role: "doctor", priority: 1 },
    { name: "Civil Hospital Khanna", phone: "+91-98765-67890", role: "hospital", priority: 2 },
    { name: "ASHA Supervisor", phone: "+91-98765-11111", role: "admin", priority: 3 },
  ]

  async sendSMS(alert: Omit<SMSAlert, "id" | "timestamp" | "status" | "retryCount">): Promise<boolean> {
    const smsAlert: SMSAlert = {
      ...alert,
      id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: "pending",
      retryCount: 0,
    }

    try {
      // In a real implementation, this would integrate with SMS providers like Twilio, AWS SNS, etc.
      const success = await this.mockSMSProvider(smsAlert)

      if (success) {
        smsAlert.status = "sent"
        this.logSMSAlert(smsAlert)
        return true
      } else {
        smsAlert.status = "failed"
        this.queueForRetry(smsAlert)
        return false
      }
    } catch (error) {
      console.error("SMS sending failed:", error)
      smsAlert.status = "queued"
      this.alertQueue.push(smsAlert)
      return false
    }
  }

  private async mockSMSProvider(alert: SMSAlert): Promise<boolean> {
    // Simulate SMS sending with 90% success rate
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return Math.random() > 0.1
  }

  async sendEmergencyAlert(
    patientName: string,
    condition: string,
    location: string,
    ashaWorker: string,
  ): Promise<void> {
    const emergencyMessage = `🚨 EMERGENCY ALERT 🚨
Patient: ${patientName}
Condition: ${condition}
Location: ${location}
ASHA: ${ashaWorker}
Time: ${new Date().toLocaleString()}
Immediate attention required!`

    // Send to all emergency contacts
    for (const contact of this.emergencyContacts) {
      await this.sendSMS({
        recipient: contact.phone,
        message: emergencyMessage,
        priority: "emergency",
        type: "emergency",
        ashaWorker,
      })
    }
  }

  async sendHealthRiskAlert(patientName: string, riskLevel: string, symptoms: string[], phone: string): Promise<void> {
    const riskMessage = `⚠️ HEALTH RISK ALERT
Patient: ${patientName}
Risk Level: ${riskLevel}
Symptoms: ${symptoms.join(", ")}
Please contact healthcare provider immediately.
Emergency: Call 108`

    await this.sendSMS({
      recipient: phone,
      message: riskMessage,
      priority: riskLevel === "High" ? "high" : "medium",
      type: "health_alert",
    })
  }

  async sendVaccinationReminder(patientName: string, vaccine: string, date: string, phone: string): Promise<void> {
    const reminderMessage = `💉 VACCINATION REMINDER
Patient: ${patientName}
Vaccine: ${vaccine}
Due Date: ${date}
Please visit the health center.
Contact ASHA worker for assistance.`

    await this.sendSMS({
      recipient: phone,
      message: reminderMessage,
      priority: "medium",
      type: "vaccination",
    })
  }

  async sendOutbreakAlert(disease: string, area: string, precautions: string[]): Promise<void> {
    const outbreakMessage = `🦠 OUTBREAK ALERT - ${disease.toUpperCase()}
Area: ${area}
Precautions:
${precautions.map((p) => `• ${p}`).join("\n")}
Contact health center if symptoms develop.`

    // Send to all registered contacts in the area
    const areaContacts = this.getAreaContacts(area)
    for (const contact of areaContacts) {
      await this.sendSMS({
        recipient: contact,
        message: outbreakMessage,
        priority: "high",
        type: "outbreak",
      })
    }
  }

  private getAreaContacts(area: string): string[] {
    // Mock area contacts - in real implementation, this would query the database
    return ["+91-98765-11111", "+91-98765-22222", "+91-98765-33333"]
  }

  private queueForRetry(alert: SMSAlert): void {
    if (alert.retryCount < 3) {
      alert.retryCount++
      alert.status = "queued"
      this.alertQueue.push(alert)
    }
  }

  private logSMSAlert(alert: SMSAlert): void {
    // Store in local storage for offline tracking
    const logs = JSON.parse(localStorage.getItem("sms_logs") || "[]")
    logs.push(alert)
    localStorage.setItem("sms_logs", JSON.stringify(logs.slice(-100))) // Keep last 100 logs
  }

  async processQueue(): Promise<void> {
    const queuedAlerts = this.alertQueue.filter((alert) => alert.status === "queued")

    for (const alert of queuedAlerts) {
      const success = await this.mockSMSProvider(alert)
      if (success) {
        alert.status = "sent"
        this.logSMSAlert(alert)
      } else if (alert.retryCount >= 3) {
        alert.status = "failed"
      }
    }

    // Remove processed alerts
    this.alertQueue = this.alertQueue.filter((alert) => alert.status === "queued" && alert.retryCount < 3)
  }

  getAlertHistory(): SMSAlert[] {
    const logs = JSON.parse(localStorage.getItem("sms_logs") || "[]")
    return logs.sort((a: SMSAlert, b: SMSAlert) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  getQueueStatus(): { pending: number; failed: number; total: number } {
    const pending = this.alertQueue.filter((a) => a.status === "queued").length
    const failed = this.alertQueue.filter((a) => a.status === "failed").length
    return { pending, failed, total: this.alertQueue.length }
  }
}

export const smsService = new SMSService()
export type { SMSAlert, EmergencyContact }
