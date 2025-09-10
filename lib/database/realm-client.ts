import Realm from "realm"

// User Schema
const UserSchema = {
  name: "User",
  primaryKey: "_id",
  properties: {
    _id: "objectId",
    village_id: "string",
    email: "string",
    phone: "string?",
    role: "string",
    profile: "mixed",
    medical_info: "mixed",
    location: "mixed",
    is_active: { type: "bool", default: true },
    is_verified: { type: "bool", default: false },
    last_login: "date?",
    created_at: "date",
    updated_at: "date",
  },
}

// Patient Schema
const PatientSchema = {
  name: "Patient",
  primaryKey: "_id",
  properties: {
    _id: "objectId",
    village_id: "string",
    user_id: "objectId",
    patient_id: "string?",
    smart_card_data: "mixed",
    health_records: "mixed[]",
    vaccination_records: "mixed[]",
    assigned_asha: "objectId?",
    created_at: "date",
    updated_at: "date",
  },
}

// Medicine Schema
const MedicineSchema = {
  name: "Medicine",
  primaryKey: "_id",
  properties: {
    _id: "objectId",
    village_id: "string",
    name: "string",
    generic_name: "string",
    brand_names: "string[]",
    category: "string",
    composition: "mixed[]",
    dosage_forms: "string[]",
    indications: "string[]",
    contraindications: "string[]",
    side_effects: "mixed[]",
    dosage_guidelines: "mixed",
    storage_conditions: "string?",
    prescription_required: { type: "bool", default: false },
    pregnancy_category: "string?",
    drug_interactions: "mixed[]",
    ai_recommendation_score: { type: "double", default: 0.0 },
    is_active: { type: "bool", default: true },
    created_at: "date",
    updated_at: "date",
  },
}

// Prescription Schema
const PrescriptionSchema = {
  name: "Prescription",
  primaryKey: "_id",
  properties: {
    _id: "objectId",
    village_id: "string",
    prescription_id: "string?",
    patient_id: "objectId",
    prescribed_by: "objectId",
    consultation_type: "string",
    symptoms: "mixed[]",
    diagnosis: "mixed",
    prescribed_medicines: "mixed[]",
    vitals: "mixed",
    ai_analysis: "mixed",
    follow_up: "mixed",
    status: { type: "string", default: "active" },
    pharmacy_dispensed: "mixed[]",
    created_at: "date",
    updated_at: "date",
  },
}

// Pharmacy Schema
const PharmacySchema = {
  name: "Pharmacy",
  primaryKey: "_id",
  properties: {
    _id: "objectId",
    village_id: "string",
    name: "string",
    owner_id: "objectId",
    license_number: "string?",
    contact_info: "mixed",
    location: "mixed",
    operating_hours: "mixed",
    services: "string[]",
    inventory: "mixed[]",
    delivery_options: "mixed",
    rating: "mixed",
    is_verified: { type: "bool", default: false },
    is_active: { type: "bool", default: true },
    created_at: "date",
    updated_at: "date",
  },
}

// Notification Schema
const NotificationSchema = {
  name: "Notification",
  primaryKey: "_id",
  properties: {
    _id: "objectId",
    village_id: "string",
    recipient_id: "objectId",
    sender_id: "objectId?",
    type: "string",
    category: "string",
    priority: { type: "string", default: "medium" },
    message: "string",
    message_translations: "mixed",
    delivery_status: "mixed",
    metadata: "mixed",
    scheduled_for: "date?",
    expires_at: "date?",
    is_read: { type: "bool", default: false },
    created_at: "date",
    updated_at: "date",
  },
}

class RealmDatabaseService {
  private realm: Realm | null = null
  private app: Realm.App | null = null

  async initialize(appId: string) {
    try {
      this.app = new Realm.App({ id: appId })
      console.log("[v0] Realm app initialized")
    } catch (error) {
      console.error("[v0] Failed to initialize Realm app:", error)
      throw error
    }
  }

  async authenticate(email: string, password: string) {
    if (!this.app) throw new Error("Realm app not initialized")

    try {
      const credentials = Realm.Credentials.emailPassword(email, password)
      const user = await this.app.logIn(credentials)

      // Open synced realm
      const config = {
        schema: [UserSchema, PatientSchema, MedicineSchema, PrescriptionSchema, PharmacySchema, NotificationSchema],
        sync: {
          user: user,
          partitionValue: user.customData?.village_id || "default",
        },
      }

      this.realm = await Realm.open(config)
      console.log("[v0] Realm database opened with sync")
      return user
    } catch (error) {
      console.error("[v0] Authentication failed:", error)
      throw error
    }
  }

  async register(userData: any) {
    if (!this.app) throw new Error("Realm app not initialized")

    try {
      await this.app.emailPasswordAuth.registerUser({
        email: userData.email,
        password: userData.password,
      })

      // Create user profile
      const user = await this.authenticate(userData.email, userData.password)
      await this.createUser({
        ...userData,
        _id: new Realm.BSON.ObjectId(),
        created_at: new Date(),
        updated_at: new Date(),
      })

      return user
    } catch (error) {
      console.error("[v0] Registration failed:", error)
      throw error
    }
  }

  // User operations
  async createUser(userData: any) {
    if (!this.realm) throw new Error("Realm not opened")

    return new Promise((resolve, reject) => {
      this.realm!.write(() => {
        try {
          const user = this.realm!.create("User", userData)
          resolve(user)
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  async getUser(userId: string) {
    if (!this.realm) throw new Error("Realm not opened")

    return this.realm.objectForPrimaryKey("User", new Realm.BSON.ObjectId(userId))
  }

  async updateUser(userId: string, updates: any) {
    if (!this.realm) throw new Error("Realm not opened")

    return new Promise((resolve, reject) => {
      this.realm!.write(() => {
        try {
          const user = this.realm!.objectForPrimaryKey("User", new Realm.BSON.ObjectId(userId))
          if (user) {
            Object.assign(user, { ...updates, updated_at: new Date() })
            resolve(user)
          } else {
            reject(new Error("User not found"))
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  // Patient operations
  async createPatient(patientData: any) {
    if (!this.realm) throw new Error("Realm not opened")

    return new Promise((resolve, reject) => {
      this.realm!.write(() => {
        try {
          const patient = this.realm!.create("Patient", {
            ...patientData,
            _id: new Realm.BSON.ObjectId(),
            created_at: new Date(),
            updated_at: new Date(),
          })
          resolve(patient)
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  async getPatientsByVillage(villageId: string) {
    if (!this.realm) throw new Error("Realm not opened")

    return this.realm.objects("Patient").filtered("village_id == $0", villageId)
  }

  async updatePatientHealthRecord(patientId: string, healthRecord: any) {
    if (!this.realm) throw new Error("Realm not opened")

    return new Promise((resolve, reject) => {
      this.realm!.write(() => {
        try {
          const patient = this.realm!.objectForPrimaryKey("Patient", new Realm.BSON.ObjectId(patientId))
          if (patient) {
            const healthRecords = patient.health_records || []
            healthRecords.push({
              ...healthRecord,
              record_id: new Realm.BSON.ObjectId(),
              date: new Date(),
            })
            patient.health_records = healthRecords
            patient.updated_at = new Date()
            resolve(patient)
          } else {
            reject(new Error("Patient not found"))
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  // Medicine operations
  async searchMedicines(query: string, category?: string) {
    if (!this.realm) throw new Error("Realm not opened")

    let filter = `name CONTAINS[c] $0 OR generic_name CONTAINS[c] $0`
    const params = [query]

    if (category) {
      filter += ` AND category == $1`
      params.push(category)
    }

    return this.realm.objects("Medicine").filtered(filter, ...params)
  }

  async getMedicinesByCategory(category: string) {
    if (!this.realm) throw new Error("Realm not opened")

    return this.realm.objects("Medicine").filtered("category == $0 AND is_active == true", category)
  }

  // Prescription operations
  async createPrescription(prescriptionData: any) {
    if (!this.realm) throw new Error("Realm not opened")

    return new Promise((resolve, reject) => {
      this.realm!.write(() => {
        try {
          const prescription = this.realm!.create("Prescription", {
            ...prescriptionData,
            _id: new Realm.BSON.ObjectId(),
            prescription_id: `RX-${Date.now()}`,
            created_at: new Date(),
            updated_at: new Date(),
          })
          resolve(prescription)
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  async getPrescriptionsByPatient(patientId: string) {
    if (!this.realm) throw new Error("Realm not opened")

    return this.realm
      .objects("Prescription")
      .filtered("patient_id == $0", new Realm.BSON.ObjectId(patientId))
      .sorted("created_at", true)
  }

  // Pharmacy operations
  async getPharmaciesByVillage(villageId: string) {
    if (!this.realm) throw new Error("Realm not opened")

    return this.realm.objects("Pharmacy").filtered("village_id == $0 AND is_active == true", villageId)
  }

  async updatePharmacyInventory(pharmacyId: string, medicineId: string, quantity: number) {
    if (!this.realm) throw new Error("Realm not opened")

    return new Promise((resolve, reject) => {
      this.realm!.write(() => {
        try {
          const pharmacy = this.realm!.objectForPrimaryKey("Pharmacy", new Realm.BSON.ObjectId(pharmacyId))
          if (pharmacy) {
            const inventory = pharmacy.inventory || []
            const existingItem = inventory.find((item: any) => item.medicine_id === medicineId)

            if (existingItem) {
              existingItem.quantity_available = quantity
              existingItem.last_updated = new Date()
            } else {
              inventory.push({
                medicine_id: new Realm.BSON.ObjectId(medicineId),
                quantity_available: quantity,
                last_updated: new Date(),
              })
            }

            pharmacy.inventory = inventory
            pharmacy.updated_at = new Date()
            resolve(pharmacy)
          } else {
            reject(new Error("Pharmacy not found"))
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  // Notification operations
  async createNotification(notificationData: any) {
    if (!this.realm) throw new Error("Realm not opened")

    return new Promise((resolve, reject) => {
      this.realm!.write(() => {
        try {
          const notification = this.realm!.create("Notification", {
            ...notificationData,
            _id: new Realm.BSON.ObjectId(),
            delivery_status: { status: "pending", retry_count: 0 },
            created_at: new Date(),
            updated_at: new Date(),
          })
          resolve(notification)
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  async getNotificationsByUser(userId: string) {
    if (!this.realm) throw new Error("Realm not opened")

    return this.realm
      .objects("Notification")
      .filtered("recipient_id == $0", new Realm.BSON.ObjectId(userId))
      .sorted("created_at", true)
  }

  // Sync operations
  async waitForSync() {
    if (!this.realm) throw new Error("Realm not opened")

    return new Promise<void>((resolve) => {
      if (this.realm!.syncSession) {
        this.realm!.syncSession.addProgressNotification("upload", "reportIndefinitely", (transferred, total) => {
          if (transferred === total) {
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }

  async pauseSync() {
    if (this.realm?.syncSession) {
      this.realm.syncSession.pause()
    }
  }

  async resumeSync() {
    if (this.realm?.syncSession) {
      this.realm.syncSession.resume()
    }
  }

  async close() {
    if (this.realm) {
      this.realm.close()
      this.realm = null
    }
  }
}

export const realmService = new RealmDatabaseService()
export default realmService
