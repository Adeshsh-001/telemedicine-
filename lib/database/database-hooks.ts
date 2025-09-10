"use client"

import { useState, useEffect, useCallback } from "react"
import realmService from "./realm-client"

// Custom hook for user authentication
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const authenticatedUser = await realmService.authenticate(email, password)
      setUser(authenticatedUser)
      return authenticatedUser
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (userData: any) => {
    try {
      setLoading(true)
      setError(null)
      const newUser = await realmService.register(userData)
      setUser(newUser)
      return newUser
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await realmService.close()
      setUser(null)
    } catch (err: any) {
      setError(err.message)
    }
  }, [])

  return { user, loading, error, login, register, logout }
}

// Custom hook for patient data
export function usePatients(villageId: string) {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const patientData = await realmService.getPatientsByVillage(villageId)
      setPatients(Array.from(patientData))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [villageId])

  const createPatient = useCallback(
    async (patientData: any) => {
      try {
        const newPatient = await realmService.createPatient(patientData)
        await fetchPatients() // Refresh list
        return newPatient
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [fetchPatients],
  )

  const updateHealthRecord = useCallback(
    async (patientId: string, healthRecord: any) => {
      try {
        await realmService.updatePatientHealthRecord(patientId, healthRecord)
        await fetchPatients() // Refresh list
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [fetchPatients],
  )

  useEffect(() => {
    if (villageId) {
      fetchPatients()
    }
  }, [villageId, fetchPatients])

  return { patients, loading, error, createPatient, updateHealthRecord, refetch: fetchPatients }
}

// Custom hook for medicine search
export function useMedicines() {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchMedicines = useCallback(async (query: string, category?: string) => {
    try {
      setLoading(true)
      setError(null)
      const results = await realmService.searchMedicines(query, category)
      setMedicines(Array.from(results))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const getMedicinesByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true)
      setError(null)
      const results = await realmService.getMedicinesByCategory(category)
      setMedicines(Array.from(results))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { medicines, loading, error, searchMedicines, getMedicinesByCategory }
}

// Custom hook for prescriptions
export function usePrescriptions(patientId?: string) {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPrescriptions = useCallback(async () => {
    if (!patientId) return

    try {
      setLoading(true)
      setError(null)
      const results = await realmService.getPrescriptionsByPatient(patientId)
      setPrescriptions(Array.from(results))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [patientId])

  const createPrescription = useCallback(
    async (prescriptionData: any) => {
      try {
        const newPrescription = await realmService.createPrescription(prescriptionData)
        await fetchPrescriptions() // Refresh list
        return newPrescription
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [fetchPrescriptions],
  )

  useEffect(() => {
    fetchPrescriptions()
  }, [fetchPrescriptions])

  return { prescriptions, loading, error, createPrescription, refetch: fetchPrescriptions }
}

// Custom hook for pharmacies
export function usePharmacies(villageId: string) {
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPharmacies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const results = await realmService.getPharmaciesByVillage(villageId)
      setPharmacies(Array.from(results))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [villageId])

  const updateInventory = useCallback(
    async (pharmacyId: string, medicineId: string, quantity: number) => {
      try {
        await realmService.updatePharmacyInventory(pharmacyId, medicineId, quantity)
        await fetchPharmacies() // Refresh list
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [fetchPharmacies],
  )

  useEffect(() => {
    if (villageId) {
      fetchPharmacies()
    }
  }, [villageId, fetchPharmacies])

  return { pharmacies, loading, error, updateInventory, refetch: fetchPharmacies }
}

// Custom hook for notifications
export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const results = await realmService.getNotificationsByUser(userId)
      setNotifications(Array.from(results))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const createNotification = useCallback(
    async (notificationData: any) => {
      try {
        const newNotification = await realmService.createNotification(notificationData)
        await fetchNotifications() // Refresh list
        return newNotification
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [fetchNotifications],
  )

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId, fetchNotifications])

  return { notifications, loading, error, createNotification, refetch: fetchNotifications }
}

// Custom hook for sync status
export function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState("synced")

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      realmService.resumeSync()
      setSyncStatus("syncing")
    }

    const handleOffline = () => {
      setIsOnline(false)
      realmService.pauseSync()
      setSyncStatus("offline")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const waitForSync = useCallback(async () => {
    try {
      setSyncStatus("syncing")
      await realmService.waitForSync()
      setSyncStatus("synced")
    } catch (error) {
      setSyncStatus("error")
    }
  }, [])

  return { isOnline, syncStatus, waitForSync }
}
