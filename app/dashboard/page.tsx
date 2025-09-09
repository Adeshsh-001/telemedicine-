"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Heart,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  Calendar,
  ArrowLeft,
  BarChart3,
  PieChart,
  Thermometer,
  Stethoscope,
} from "lucide-react"
import Link from "next/link"

export default function VillageHealthDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week")

  const villageStats = {
    totalPopulation: 1247,
    registeredPatients: 892,
    activeASHAs: 3,
    emergencyCases: 2,
    vaccinationRate: 87,
    healthScore: 78,
  }

  const healthTrends = [
    { condition: "Fever", cases: 23, trend: "up", change: "+12%" },
    { condition: "Hypertension", cases: 45, trend: "down", change: "-8%" },
    { condition: "Diabetes", cases: 31, trend: "stable", change: "0%" },
    { condition: "Respiratory", cases: 18, trend: "up", change: "+5%" },
  ]

  const ageGroups = [
    { group: "0-5 years", count: 156, percentage: 12.5, vaccinated: 94 },
    { group: "6-18 years", count: 298, percentage: 23.9, vaccinated: 89 },
    { group: "19-60 years", count: 623, percentage: 49.9, vaccinated: 76 },
    { group: "60+ years", count: 170, percentage: 13.6, vaccinated: 92 },
  ]

  const recentAlerts = [
    {
      type: "outbreak",
      message: "Potential fever outbreak detected",
      location: "Sector A",
      time: "2 hours ago",
      severity: "high",
    },
    {
      type: "vaccination",
      message: "Vaccination drive reminder",
      location: "Community Center",
      time: "4 hours ago",
      severity: "medium",
    },
    {
      type: "emergency",
      message: "Emergency case reported",
      location: "Sector C",
      time: "6 hours ago",
      severity: "high",
    },
  ]

  return (
    <div className="min-h-screen bg-background p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ਪਿੰਡ ਸਿਹਤ ਡੈਸ਼ਬੋਰਡ</h1>
            <p className="text-muted-foreground">Village Health Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Khanna Village, Punjab</span>
        </div>
      </div>

      {/* Time Filter */}
      <div className="flex gap-2 mb-6">
        {["day", "week", "month", "year"].map((period) => (
          <Button
            key={period}
            variant={selectedTimeframe === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeframe(period)}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Population</p>
                <p className="text-2xl font-bold">{villageStats.totalPopulation.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registered Patients</p>
                <p className="text-2xl font-bold">{villageStats.registeredPatients}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round((villageStats.registeredPatients / villageStats.totalPopulation) * 100)}% coverage
                </p>
              </div>
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active ASHAs</p>
                <p className="text-2xl font-bold">{villageStats.activeASHAs}</p>
                <p className="text-xs text-primary">All online</p>
              </div>
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className="text-2xl font-bold">{villageStats.healthScore}%</p>
                <p className="text-xs text-primary">+5% this month</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Trends and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Health Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Health Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{trend.condition}</p>
                      <p className="text-xs text-muted-foreground">{trend.cases} cases</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trend.trend === "up" && <TrendingUp className="h-4 w-4 text-destructive" />}
                    {trend.trend === "down" && <TrendingDown className="h-4 w-4 text-primary" />}
                    {trend.trend === "stable" && <div className="h-4 w-4 bg-muted-foreground rounded-full" />}
                    <span
                      className={`text-xs font-medium ${
                        trend.trend === "up"
                          ? "text-destructive"
                          : trend.trend === "down"
                            ? "text-primary"
                            : "text-muted-foreground"
                      }`}
                    >
                      {trend.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === "high"
                      ? "border-l-destructive bg-destructive/5"
                      : alert.severity === "medium"
                        ? "border-l-accent bg-accent/5"
                        : "border-l-muted-foreground bg-muted/5"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {alert.location} • {alert.time}
                      </p>
                    </div>
                    <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>{alert.severity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Age Demographics and Vaccination Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Age Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Age Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ageGroups.map((group, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{group.group}</span>
                    <span className="text-sm text-muted-foreground">
                      {group.count} ({group.percentage}%)
                    </span>
                  </div>
                  <Progress value={group.percentage * 4} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vaccination Coverage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Vaccination Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ageGroups.map((group, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{group.group}</span>
                    <span className="text-sm font-bold text-primary">{group.vaccinated}%</span>
                  </div>
                  <Progress value={group.vaccinated} className="h-2" />
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-primary">Overall Coverage: {villageStats.vaccinationRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Target: 95% by end of year</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
              <Users className="h-6 w-6" />
              <span className="text-sm">View All Patients</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Schedule Visit</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-sm">Report Emergency</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
