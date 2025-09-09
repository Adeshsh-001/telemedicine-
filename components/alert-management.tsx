"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  MessageSquare,
  Phone,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Siren,
  Heart,
  Shield,
} from "lucide-react"
import { smsService, type SMSAlert } from "@/lib/sms-service"

export default function AlertManagement() {
  const [alerts, setAlerts] = useState<SMSAlert[]>([])
  const [queueStatus, setQueueStatus] = useState({ pending: 0, failed: 0, total: 0 })
  const [showSendAlert, setShowSendAlert] = useState(false)
  const [newAlert, setNewAlert] = useState({
    recipient: "",
    message: "",
    priority: "medium" as const,
    type: "health_alert" as const,
  })

  useEffect(() => {
    loadAlerts()
    const interval = setInterval(() => {
      updateQueueStatus()
      smsService.processQueue()
    }, 30000) // Process queue every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const loadAlerts = () => {
    const history = smsService.getAlertHistory()
    setAlerts(history.slice(0, 20)) // Show last 20 alerts
    updateQueueStatus()
  }

  const updateQueueStatus = () => {
    const status = smsService.getQueueStatus()
    setQueueStatus(status)
  }

  const handleSendAlert = async () => {
    if (!newAlert.recipient || !newAlert.message) return

    const success = await smsService.sendSMS(newAlert)
    if (success) {
      setNewAlert({ recipient: "", message: "", priority: "medium", type: "health_alert" })
      setShowSendAlert(false)
      loadAlerts()
    }
  }

  const sendEmergencyAlert = async () => {
    await smsService.sendEmergencyAlert(
      "Emergency Patient",
      "Critical condition requiring immediate attention",
      "Village Health Center",
      "Current ASHA Worker",
    )
    loadAlerts()
  }

  const sendTestAlert = async () => {
    await smsService.sendHealthRiskAlert("Test Patient", "Medium", ["Fever", "Headache"], "+91-98765-00000")
    loadAlerts()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "pending":
        return <Clock className="h-4 w-4 text-accent" />
      case "queued":
        return <Clock className="h-4 w-4 text-muted-foreground" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{queueStatus.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{queueStatus.failed}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{queueStatus.total}</p>
              <p className="text-sm text-muted-foreground">Total Queued</p>
            </div>
          </div>
          {queueStatus.total > 0 && (
            <div className="mt-4">
              <Progress
                value={((queueStatus.total - queueStatus.pending - queueStatus.failed) / queueStatus.total) * 100}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">Processing queue...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Siren className="h-5 w-5" />
            Quick Alert Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={sendEmergencyAlert} variant="destructive" className="h-auto p-4 flex flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-sm">Send Emergency Alert</span>
            </Button>
            <Button onClick={sendTestAlert} variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
              <Heart className="h-6 w-6" />
              <span className="text-sm">Send Health Risk Alert</span>
            </Button>
            <Button
              onClick={() => setShowSendAlert(true)}
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2 bg-transparent"
            >
              <Send className="h-6 w-6" />
              <span className="text-sm">Custom Alert</span>
            </Button>
            <Button
              onClick={() => smsService.processQueue()}
              variant="outline"
              className="h-auto p-4 flex flex-col gap-2 bg-transparent"
            >
              <Shield className="h-6 w-6" />
              <span className="text-sm">Process Queue</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Send Custom Alert */}
      {showSendAlert && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Send Custom Alert</span>
              <Button variant="ghost" size="sm" onClick={() => setShowSendAlert(false)}>
                Cancel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                placeholder="+91-98765-43210"
                value={newAlert.recipient}
                onChange={(e) => setNewAlert({ ...newAlert, recipient: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Enter your alert message..."
                value={newAlert.message}
                onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newAlert.priority}
                  onValueChange={(value: any) => setNewAlert({ ...newAlert, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={newAlert.type} onValueChange={(value: any) => setNewAlert({ ...newAlert, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health_alert">Health Alert</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="outbreak">Outbreak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSendAlert} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Alert
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No alerts sent yet</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="mt-0.5">{getStatusIcon(alert.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
                      <Badge variant="outline">{alert.type.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{alert.message.substring(0, 60)}...</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {alert.recipient}
                      </span>
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
