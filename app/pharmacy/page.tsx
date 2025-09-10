"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import PharmacyFinder from "@/components/pharmacy-finder"
import type { Pharmacy } from "@/lib/pharmacy-service"

export default function PharmacyPage() {
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null)

  const handlePharmacySelected = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy)
    console.log("Selected pharmacy:", pharmacy)
  }

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
          <h1 className="text-2xl font-bold text-foreground">Pharmacy Finder</h1>
          <p className="text-muted-foreground">Find nearby pharmacies and check medicine availability</p>
        </div>
      </div>

      {/* Pharmacy Finder */}
      <PharmacyFinder
        medicineIds={["med_001", "med_002", "med_003", "med_004", "med_005", "med_006"]}
        onPharmacySelected={handlePharmacySelected}
      />

      {selectedPharmacy && (
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-primary">Selected: {selectedPharmacy.name}</p>
        </div>
      )}
    </div>
  )
}
