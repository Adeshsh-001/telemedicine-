"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import AlertManagement from "@/components/alert-management"

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-background p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">SMS Alert System</h1>
          <p className="text-muted-foreground">Manage health alerts and emergency notifications</p>
        </div>
      </div>

      <AlertManagement />
    </div>
  )
}
