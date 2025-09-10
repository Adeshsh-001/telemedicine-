export interface Pharmacy {
  id: string
  name: string
  address: string
  phone: string
  coordinates: {
    lat: number
    lng: number
  }
  distance?: number
  isOpen: boolean
  openingHours: {
    [key: string]: { open: string; close: string }
  }
  rating: number
  verified: boolean
  lastUpdated: string
}

export interface PharmacyMedicine {
  medicineId: string
  pharmacyId: string
  price: number
  stock: number
  availability: "available" | "low_stock" | "out_of_stock"
  lastUpdated: string
  expiryDate?: string
  batchNumber?: string
}

export interface PharmacyAvailabilityResult {
  medicine: {
    id: string
    name: string
    genericName: string
  }
  pharmacies: {
    pharmacy: Pharmacy
    price: number
    stock: number
    availability: "available" | "low_stock" | "out_of_stock"
    estimatedTime: string
    distance: number
  }[]
  averagePrice: number
  lowestPrice: number
  highestPrice: number
  totalAvailablePharmacies: number
}

class PharmacyService {
  private pharmacies: Pharmacy[] = [
    {
      id: "pharmacy_001",
      name: "Khanna Medical Store",
      address: "Main Market, Khanna Village, Punjab",
      phone: "+91-9876543210",
      coordinates: { lat: 30.7046, lng: 76.2187 },
      isOpen: true,
      openingHours: {
        monday: { open: "08:00", close: "20:00" },
        tuesday: { open: "08:00", close: "20:00" },
        wednesday: { open: "08:00", close: "20:00" },
        thursday: { open: "08:00", close: "20:00" },
        friday: { open: "08:00", close: "20:00" },
        saturday: { open: "08:00", close: "18:00" },
        sunday: { open: "09:00", close: "17:00" },
      },
      rating: 4.5,
      verified: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "pharmacy_002",
      name: "Punjab Pharmacy",
      address: "Civil Hospital Road, Khanna, Punjab",
      phone: "+91-9876543211",
      coordinates: { lat: 30.7056, lng: 76.2197 },
      isOpen: true,
      openingHours: {
        monday: { open: "07:00", close: "22:00" },
        tuesday: { open: "07:00", close: "22:00" },
        wednesday: { open: "07:00", close: "22:00" },
        thursday: { open: "07:00", close: "22:00" },
        friday: { open: "07:00", close: "22:00" },
        saturday: { open: "07:00", close: "22:00" },
        sunday: { open: "08:00", close: "21:00" },
      },
      rating: 4.2,
      verified: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "pharmacy_003",
      name: "Village Health Center Pharmacy",
      address: "PHC Building, Khanna Village, Punjab",
      phone: "+91-9876543212",
      coordinates: { lat: 30.7036, lng: 76.2177 },
      isOpen: true,
      openingHours: {
        monday: { open: "09:00", close: "17:00" },
        tuesday: { open: "09:00", close: "17:00" },
        wednesday: { open: "09:00", close: "17:00" },
        thursday: { open: "09:00", close: "17:00" },
        friday: { open: "09:00", close: "17:00" },
        saturday: { open: "09:00", close: "13:00" },
        sunday: { open: "closed", close: "closed" },
      },
      rating: 4.0,
      verified: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "pharmacy_004",
      name: "Apollo Pharmacy",
      address: "GT Road, Near Bus Stand, Khanna, Punjab",
      phone: "+91-9876543213",
      coordinates: { lat: 30.7066, lng: 76.2207 },
      isOpen: true,
      openingHours: {
        monday: { open: "24/7", close: "24/7" },
        tuesday: { open: "24/7", close: "24/7" },
        wednesday: { open: "24/7", close: "24/7" },
        thursday: { open: "24/7", close: "24/7" },
        friday: { open: "24/7", close: "24/7" },
        saturday: { open: "24/7", close: "24/7" },
        sunday: { open: "24/7", close: "24/7" },
      },
      rating: 4.7,
      verified: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "pharmacy_005",
      name: "Sharma Medical Hall",
      address: "Gurdwara Road, Khanna Village, Punjab",
      phone: "+91-9876543214",
      coordinates: { lat: 30.7026, lng: 76.2167 },
      isOpen: false,
      openingHours: {
        monday: { open: "08:30", close: "19:30" },
        tuesday: { open: "08:30", close: "19:30" },
        wednesday: { open: "08:30", close: "19:30" },
        thursday: { open: "08:30", close: "19:30" },
        friday: { open: "08:30", close: "19:30" },
        saturday: { open: "08:30", close: "16:00" },
        sunday: { open: "closed", close: "closed" },
      },
      rating: 3.8,
      verified: true,
      lastUpdated: new Date().toISOString(),
    },
  ]

  private pharmacyMedicines: PharmacyMedicine[] = [
    // Paracetamol availability
    {
      medicineId: "med_001",
      pharmacyId: "pharmacy_001",
      price: 15,
      stock: 50,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_001",
      pharmacyId: "pharmacy_002",
      price: 12,
      stock: 30,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_001",
      pharmacyId: "pharmacy_003",
      price: 18,
      stock: 25,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_001",
      pharmacyId: "pharmacy_004",
      price: 14,
      stock: 100,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_001",
      pharmacyId: "pharmacy_005",
      price: 16,
      stock: 0,
      availability: "out_of_stock",
      lastUpdated: new Date().toISOString(),
    },

    // Ibuprofen availability
    {
      medicineId: "med_002",
      pharmacyId: "pharmacy_001",
      price: 25,
      stock: 20,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_002",
      pharmacyId: "pharmacy_002",
      price: 22,
      stock: 8,
      availability: "low_stock",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_002",
      pharmacyId: "pharmacy_003",
      price: 28,
      stock: 15,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_002",
      pharmacyId: "pharmacy_004",
      price: 24,
      stock: 45,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_002",
      pharmacyId: "pharmacy_005",
      price: 26,
      stock: 5,
      availability: "low_stock",
      lastUpdated: new Date().toISOString(),
    },

    // Amoxicillin availability
    {
      medicineId: "med_003",
      pharmacyId: "pharmacy_001",
      price: 45,
      stock: 3,
      availability: "low_stock",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_003",
      pharmacyId: "pharmacy_002",
      price: 42,
      stock: 0,
      availability: "out_of_stock",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_003",
      pharmacyId: "pharmacy_003",
      price: 48,
      stock: 10,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_003",
      pharmacyId: "pharmacy_004",
      price: 44,
      stock: 25,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_003",
      pharmacyId: "pharmacy_005",
      price: 46,
      stock: 0,
      availability: "out_of_stock",
      lastUpdated: new Date().toISOString(),
    },

    // Cetirizine availability
    {
      medicineId: "med_004",
      pharmacyId: "pharmacy_001",
      price: 20,
      stock: 40,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_004",
      pharmacyId: "pharmacy_002",
      price: 18,
      stock: 35,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_004",
      pharmacyId: "pharmacy_003",
      price: 22,
      stock: 20,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_004",
      pharmacyId: "pharmacy_004",
      price: 19,
      stock: 60,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_004",
      pharmacyId: "pharmacy_005",
      price: 21,
      stock: 12,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },

    // Omeprazole availability
    {
      medicineId: "med_005",
      pharmacyId: "pharmacy_001",
      price: 35,
      stock: 15,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_005",
      pharmacyId: "pharmacy_002",
      price: 32,
      stock: 20,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_005",
      pharmacyId: "pharmacy_003",
      price: 38,
      stock: 8,
      availability: "low_stock",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_005",
      pharmacyId: "pharmacy_004",
      price: 34,
      stock: 30,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_005",
      pharmacyId: "pharmacy_005",
      price: 36,
      stock: 0,
      availability: "out_of_stock",
      lastUpdated: new Date().toISOString(),
    },

    // Salbutamol availability
    {
      medicineId: "med_006",
      pharmacyId: "pharmacy_001",
      price: 120,
      stock: 5,
      availability: "low_stock",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_006",
      pharmacyId: "pharmacy_002",
      price: 115,
      stock: 8,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_006",
      pharmacyId: "pharmacy_003",
      price: 125,
      stock: 3,
      availability: "low_stock",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_006",
      pharmacyId: "pharmacy_004",
      price: 118,
      stock: 12,
      availability: "available",
      lastUpdated: new Date().toISOString(),
    },
    {
      medicineId: "med_006",
      pharmacyId: "pharmacy_005",
      price: 122,
      stock: 0,
      availability: "out_of_stock",
      lastUpdated: new Date().toISOString(),
    },
  ]

  getAllPharmacies(): Pharmacy[] {
    return this.pharmacies
  }

  getPharmacyById(id: string): Pharmacy | undefined {
    return this.pharmacies.find((pharmacy) => pharmacy.id === id)
  }

  getNearbyPharmacies(userLat: number, userLng: number, radiusKm = 10): Pharmacy[] {
    return this.pharmacies
      .map((pharmacy) => ({
        ...pharmacy,
        distance: this.calculateDistance(userLat, userLng, pharmacy.coordinates.lat, pharmacy.coordinates.lng),
      }))
      .filter((pharmacy) => pharmacy.distance! <= radiusKm)
      .sort((a, b) => a.distance! - b.distance!)
  }

  getOpenPharmacies(): Pharmacy[] {
    return this.pharmacies.filter((pharmacy) => pharmacy.isOpen)
  }

  async getMedicineAvailability(
    medicineId: string,
    userLat?: number,
    userLng?: number,
  ): Promise<PharmacyAvailabilityResult | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const medicineAvailability = this.pharmacyMedicines.filter((pm) => pm.medicineId === medicineId)

    if (medicineAvailability.length === 0) {
      return null
    }

    let pharmacies = this.pharmacies
    if (userLat && userLng) {
      pharmacies = this.getNearbyPharmacies(userLat, userLng, 20)
    }

    const availabilityData = medicineAvailability
      .map((pm) => {
        const pharmacy = pharmacies.find((p) => p.id === pm.pharmacyId)
        if (!pharmacy) return null

        const distance =
          userLat && userLng
            ? this.calculateDistance(userLat, userLng, pharmacy.coordinates.lat, pharmacy.coordinates.lng)
            : 0

        return {
          pharmacy: { ...pharmacy, distance },
          price: pm.price,
          stock: pm.stock,
          availability: pm.availability,
          estimatedTime: this.calculateEstimatedTime(distance, pharmacy.isOpen),
          distance,
        }
      })
      .filter(Boolean)
      .sort((a, b) => a!.distance - b!.distance)

    const prices = availabilityData.map((item) => item!.price)
    const availablePharmacies = availabilityData.filter((item) => item!.availability !== "out_of_stock")

    // Get medicine details (this would normally come from medicine service)
    const medicineDetails = {
      id: medicineId,
      name: this.getMedicineName(medicineId),
      genericName: this.getMedicineGenericName(medicineId),
    }

    return {
      medicine: medicineDetails,
      pharmacies: availabilityData as any[],
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      totalAvailablePharmacies: availablePharmacies.length,
    }
  }

  async checkMultipleMedicinesAvailability(
    medicineIds: string[],
    userLat?: number,
    userLng?: number,
  ): Promise<PharmacyAvailabilityResult[]> {
    const results = await Promise.all(medicineIds.map((id) => this.getMedicineAvailability(id, userLat, userLng)))
    return results.filter(Boolean) as PharmacyAvailabilityResult[]
  }

  async updateMedicineStock(pharmacyId: string, medicineId: string, newStock: number): Promise<void> {
    const medicineIndex = this.pharmacyMedicines.findIndex(
      (pm) => pm.pharmacyId === pharmacyId && pm.medicineId === medicineId,
    )

    if (medicineIndex !== -1) {
      this.pharmacyMedicines[medicineIndex].stock = newStock
      this.pharmacyMedicines[medicineIndex].availability =
        newStock === 0 ? "out_of_stock" : newStock <= 10 ? "low_stock" : "available"
      this.pharmacyMedicines[medicineIndex].lastUpdated = new Date().toISOString()
    }
  }

  searchPharmacies(query: string): Pharmacy[] {
    const searchTerm = query.toLowerCase()
    return this.pharmacies.filter(
      (pharmacy) =>
        pharmacy.name.toLowerCase().includes(searchTerm) || pharmacy.address.toLowerCase().includes(searchTerm),
    )
  }

  getPharmacyMedicines(pharmacyId: string): PharmacyMedicine[] {
    return this.pharmacyMedicines.filter((pm) => pm.pharmacyId === pharmacyId)
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1)
    const dLng = this.deg2rad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  private calculateEstimatedTime(distance: number, isOpen: boolean): string {
    if (!isOpen) return "Closed"
    if (distance <= 1) return "5-10 mins"
    if (distance <= 3) return "10-15 mins"
    if (distance <= 5) return "15-25 mins"
    if (distance <= 10) return "25-40 mins"
    return "40+ mins"
  }

  private getMedicineName(medicineId: string): string {
    const names: Record<string, string> = {
      med_001: "Paracetamol",
      med_002: "Ibuprofen",
      med_003: "Amoxicillin",
      med_004: "Cetirizine",
      med_005: "Omeprazole",
      med_006: "Salbutamol",
    }
    return names[medicineId] || "Unknown Medicine"
  }

  private getMedicineGenericName(medicineId: string): string {
    const names: Record<string, string> = {
      med_001: "Acetaminophen",
      med_002: "Ibuprofen",
      med_003: "Amoxicillin",
      med_004: "Cetirizine HCl",
      med_005: "Omeprazole",
      med_006: "Salbutamol",
    }
    return names[medicineId] || "Unknown"
  }

  // Real-time updates simulation
  startRealTimeUpdates(): void {
    setInterval(() => {
      // Simulate random stock updates
      const randomMedicine = this.pharmacyMedicines[Math.floor(Math.random() * this.pharmacyMedicines.length)]
      const stockChange = Math.floor(Math.random() * 10) - 5 // -5 to +5 change
      const newStock = Math.max(0, randomMedicine.stock + stockChange)

      this.updateMedicineStock(randomMedicine.pharmacyId, randomMedicine.medicineId, newStock)
    }, 30000) // Update every 30 seconds
  }

  // Save user's preferred pharmacies
  savePreferredPharmacy(pharmacyId: string): void {
    const preferred = JSON.parse(localStorage.getItem("preferred_pharmacies") || "[]")
    if (!preferred.includes(pharmacyId)) {
      preferred.push(pharmacyId)
      localStorage.setItem("preferred_pharmacies", JSON.stringify(preferred))
    }
  }

  getPreferredPharmacies(): Pharmacy[] {
    const preferred = JSON.parse(localStorage.getItem("preferred_pharmacies") || "[]")
    return preferred.map((id: string) => this.getPharmacyById(id)).filter(Boolean)
  }
}

export const pharmacyService = new PharmacyService()
