interface PatientData {
  id: string
  name: string
  age: number
  gender: string
  bloodType: string
  allergies: string[]
  medications: string[]
  conditions: string[]
  lastVisit: string
  vitals: {
    bloodPressure: string
    heartRate: number
    temperature: number
    weight: number
  }
  emergencyContact: {
    name: string
    phone: string
  }
  cardId: string
  encrypted: boolean
  lastSync: string
}

interface HealthRecord {
  id: string
  patientId: string
  date: string
  symptoms: string[]
  diagnosis: string
  treatment: string
  followUp: string
  ashaWorker: string
}

class OfflineStorage {
  private dbName = "HealthcareDB"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create patients store
        if (!db.objectStoreNames.contains("patients")) {
          const patientsStore = db.createObjectStore("patients", { keyPath: "id" })
          patientsStore.createIndex("cardId", "cardId", { unique: true })
          patientsStore.createIndex("name", "name", { unique: false })
        }

        // Create health records store
        if (!db.objectStoreNames.contains("healthRecords")) {
          const recordsStore = db.createObjectStore("healthRecords", { keyPath: "id" })
          recordsStore.createIndex("patientId", "patientId", { unique: false })
          recordsStore.createIndex("date", "date", { unique: false })
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", { keyPath: "id" })
        }
      }
    })
  }

  async savePatient(patient: PatientData): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["patients"], "readwrite")
    const store = transaction.objectStore("patients")

    // Encrypt sensitive data
    const encryptedPatient = {
      ...patient,
      encrypted: true,
      lastSync: new Date().toISOString(),
    }

    return new Promise((resolve, reject) => {
      const request = store.put(encryptedPatient)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getPatientByCardId(cardId: string): Promise<PatientData | null> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["patients"], "readonly")
    const store = transaction.objectStore("patients")
    const index = store.index("cardId")

    return new Promise((resolve, reject) => {
      const request = index.get(cardId)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async saveHealthRecord(record: HealthRecord): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["healthRecords"], "readwrite")
    const store = transaction.objectStore("healthRecords")

    return new Promise((resolve, reject) => {
      const request = store.add(record)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getPatientRecords(patientId: string): Promise<HealthRecord[]> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["healthRecords"], "readonly")
    const store = transaction.objectStore("healthRecords")
    const index = store.index("patientId")

    return new Promise((resolve, reject) => {
      const request = index.getAll(patientId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllPatients(): Promise<PatientData[]> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["patients"], "readonly")
    const store = transaction.objectStore("patients")

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Simple encryption for demo (use proper encryption in production)
  private encrypt(data: string): string {
    return btoa(data) // Base64 encoding for demo
  }

  private decrypt(data: string): string {
    return atob(data) // Base64 decoding for demo
  }
}

export const offlineStorage = new OfflineStorage()
export type { PatientData, HealthRecord }
