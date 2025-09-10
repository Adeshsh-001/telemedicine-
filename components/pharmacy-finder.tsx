"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Clock, Star, Navigation, Search, Pill, RefreshCw, Heart, CheckCircle } from "lucide-react"
import { pharmacyService, type Pharmacy, type PharmacyAvailabilityResult } from "@/lib/pharmacy-service"

interface PharmacyFinderProps {
  medicineIds?: string[]
  onPharmacySelected?: (pharmacy: Pharmacy) => void
}

export default function PharmacyFinder({ medicineIds = [], onPharmacySelected }: PharmacyFinderProps) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMedicine, setSelectedMedicine] = useState<string>("")
  const [medicineAvailability, setMedicineAvailability] = useState<PharmacyAvailabilityResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [viewMode, setViewMode] = useState<"all" | "nearby" | "open" | "medicine">("all")
  const [preferredPharmacies, setPreferredPharmacies] = useState<Pharmacy[]>([])

  useEffect(() => {
    loadPharmacies()
    loadPreferredPharmacies()
    getUserLocation()
  }, [])

  const loadPharmacies = () => {
    setPharmacies(pharmacyService.getAllPharmacies())
  }

  const loadPreferredPharmacies = () => {
    setPreferredPharmacies(pharmacyService.getPreferredPharmacies())
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Location access denied:", error)
          // Use default location (Khanna, Punjab)
          setUserLocation({ lat: 30.7046, lng: 76.2187 })
        },
      )
    } else {
      // Use default location
      setUserLocation({ lat: 30.7046, lng: 76.2187 })
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = pharmacyService.searchPharmacies(query)
      setPharmacies(results)
    } else {
      loadPharmacies()
    }
  }

  const handleViewModeChange = (mode: "all" | "nearby" | "open" | "medicine") => {
    setViewMode(mode)
    setIsLoading(true)

    setTimeout(() => {
      switch (mode) {
        case "all":
          setPharmacies(pharmacyService.getAllPharmacies())
          break
        case "nearby":
          if (userLocation) {
            setPharmacies(pharmacyService.getNearbyPharmacies(userLocation.lat, userLocation.lng, 5))
          }
          break
        case "open":
          setPharmacies(pharmacyService.getOpenPharmacies())
          break
        case "medicine":
          // Will be handled by medicine availability search
          break
      }
      setIsLoading(false)
    }, 500)
  }

  const checkMedicineAvailability = async (medicineId: string) => {
    setIsLoading(true)
    setSelectedMedicine(medicineId)

    try {
      const result = await pharmacyService.getMedicineAvailability(medicineId, userLocation?.lat, userLocation?.lng)
      setMedicineAvailability(result)
      setViewMode("medicine")
    } catch (error) {
      console.error("Error checking medicine availability:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePreferredPharmacy = (pharmacy: Pharmacy) => {
    pharmacyService.savePreferredPharmacy(pharmacy.id)
    loadPreferredPharmacies()
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "default"
      case "low_stock":
        return "secondary"
      case "out_of_stock":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getDistanceText = (distance?: number) => {
    if (!distance) return ""
    if (distance < 1) return `${Math.round(distance * 1000)}m away`
    return `${distance.toFixed(1)}km away`
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Pharmacy Finder
          </CardTitle>
          <p className="text-sm text-muted-foreground">Find nearby pharmacies and check medicine availability</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pharmacies by name or location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Mode Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={viewMode === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewModeChange("all")}
            >
              All Pharmacies
            </Button>
            <Button
              variant={viewMode === "nearby" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewModeChange("nearby")}
              disabled={!userLocation}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Nearby
            </Button>
            <Button
              variant={viewMode === "open" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewModeChange("open")}
            >
              <Clock className="h-4 w-4 mr-1" />
              Open Now
            </Button>
          </div>

          {/* Medicine Availability Check */}
          {medicineIds.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Check Medicine Availability:</p>
              <div className="flex flex-wrap gap-2">
                {medicineIds.map((medicineId) => (
                  <Button
                    key={medicineId}
                    variant={selectedMedicine === medicineId ? "default" : "outline"}
                    size="sm"
                    onClick={() => checkMedicineAvailability(medicineId)}
                    disabled={isLoading}
                  >
                    <Pill className="h-4 w-4 mr-1" />
                    {pharmacyService["getMedicineName"](medicineId)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {viewMode === "medicine" ? "Checking medicine availability..." : "Loading pharmacies..."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Medicine Availability Results */}
      {medicineAvailability && viewMode === "medicine" && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              {medicineAvailability.medicine.name} Availability
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Available at {medicineAvailability.totalAvailablePharmacies} pharmacies</span>
              <span>
                ₹{medicineAvailability.lowestPrice} - ₹{medicineAvailability.highestPrice}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {medicineAvailability.pharmacies.map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{item.pharmacy.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.pharmacy.address}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getAvailabilityColor(item.availability)} className="text-xs">
                          {item.availability.replace("_", " ")}
                        </Badge>
                        {item.distance > 0 && (
                          <span className="text-xs text-muted-foreground">{getDistanceText(item.distance)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.price}</p>
                      <p className="text-xs text-muted-foreground">{item.estimatedTime}</p>
                      {item.stock > 0 && <p className="text-xs text-muted-foreground">{item.stock} in stock</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.pharmacy.phone}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => togglePreferredPharmacy(item.pharmacy)}>
                        <Heart className="h-4 w-4" />
                      </Button>
                      {onPharmacySelected && (
                        <Button
                          size="sm"
                          onClick={() => onPharmacySelected(item.pharmacy)}
                          disabled={item.availability === "out_of_stock"}
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferred Pharmacies */}
      {preferredPharmacies.length > 0 && viewMode !== "medicine" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Preferred Pharmacies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {preferredPharmacies.map((pharmacy) => (
                <div key={pharmacy.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{pharmacy.name}</h4>
                      <p className="text-sm text-muted-foreground">{pharmacy.address}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={pharmacy.isOpen ? "default" : "secondary"} className="text-xs">
                          {pharmacy.isOpen ? "Open" : "Closed"}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{pharmacy.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {onPharmacySelected && (
                        <Button size="sm" onClick={() => onPharmacySelected(pharmacy)}>
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Pharmacies List */}
      {viewMode !== "medicine" && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>
              {viewMode === "all" && "All Pharmacies"}
              {viewMode === "nearby" && "Nearby Pharmacies"}
              {viewMode === "open" && "Open Pharmacies"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pharmacies.map((pharmacy) => (
                <div key={pharmacy.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{pharmacy.name}</h4>
                      <p className="text-sm text-muted-foreground">{pharmacy.address}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={pharmacy.isOpen ? "default" : "secondary"} className="text-xs">
                          {pharmacy.isOpen ? "Open" : "Closed"}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{pharmacy.rating}</span>
                        </div>
                        {pharmacy.verified && <CheckCircle className="h-3 w-3 text-primary" />}
                        {pharmacy.distance && (
                          <span className="text-xs text-muted-foreground">{getDistanceText(pharmacy.distance)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{pharmacy.phone}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => togglePreferredPharmacy(pharmacy)}>
                        <Heart className="h-4 w-4" />
                      </Button>
                      {onPharmacySelected && (
                        <Button size="sm" onClick={() => onPharmacySelected(pharmacy)}>
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {pharmacies.length === 0 && !isLoading && viewMode !== "medicine" && (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No pharmacies found. Try adjusting your search or location.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
