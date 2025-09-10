export interface BandwidthInfo {
  effectiveType: "2g" | "3g" | "4g" | "slow-2g"
  downlink: number
  rtt: number
  saveData: boolean
}

export interface OptimizationSettings {
  enableImageCompression: boolean
  enableDataCompression: boolean
  enableOfflineMode: boolean
  maxImageQuality: number
  enableProgressiveLoading: boolean
  enableLowBandwidthMode: boolean
}

class BandwidthOptimizer {
  private connection: any = null
  private isLowBandwidth = false
  private optimizationSettings: OptimizationSettings = {
    enableImageCompression: true,
    enableDataCompression: true,
    enableOfflineMode: true,
    maxImageQuality: 80,
    enableProgressiveLoading: true,
    enableLowBandwidthMode: false,
  }

  constructor() {
    this.initializeConnection()
    this.detectBandwidth()
  }

  private initializeConnection() {
    // @ts-ignore - Navigator connection API
    this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

    if (this.connection) {
      this.connection.addEventListener("change", () => {
        this.detectBandwidth()
      })
    }
  }

  private detectBandwidth() {
    if (this.connection) {
      const effectiveType = this.connection.effectiveType
      const downlink = this.connection.downlink
      const saveData = this.connection.saveData

      // Determine if connection is low bandwidth
      this.isLowBandwidth = effectiveType === "slow-2g" || effectiveType === "2g" || downlink < 1.5 || saveData

      // Auto-enable low bandwidth mode for poor connections
      if (this.isLowBandwidth) {
        this.optimizationSettings.enableLowBandwidthMode = true
        this.optimizationSettings.maxImageQuality = 60
      }

      // Notify listeners about bandwidth change
      this.notifyBandwidthChange()
    } else {
      // Fallback: Test connection speed
      this.testConnectionSpeed()
    }
  }

  private async testConnectionSpeed() {
    try {
      const startTime = Date.now()
      const response = await fetch("/api/ping", {
        method: "HEAD",
        cache: "no-cache",
      })
      const endTime = Date.now()
      const latency = endTime - startTime

      // Consider connection slow if latency > 1000ms
      this.isLowBandwidth = latency > 1000

      if (this.isLowBandwidth) {
        this.optimizationSettings.enableLowBandwidthMode = true
      }

      this.notifyBandwidthChange()
    } catch (error) {
      // Assume low bandwidth if test fails
      this.isLowBandwidth = true
      this.optimizationSettings.enableLowBandwidthMode = true
    }
  }

  private notifyBandwidthChange() {
    // Dispatch custom event for bandwidth change
    window.dispatchEvent(
      new CustomEvent("bandwidthchange", {
        detail: {
          isLowBandwidth: this.isLowBandwidth,
          settings: this.optimizationSettings,
        },
      }),
    )
  }

  getBandwidthInfo(): BandwidthInfo | null {
    if (!this.connection) return null

    return {
      effectiveType: this.connection.effectiveType || "4g",
      downlink: this.connection.downlink || 10,
      rtt: this.connection.rtt || 100,
      saveData: this.connection.saveData || false,
    }
  }

  isLowBandwidthConnection(): boolean {
    return this.isLowBandwidth
  }

  getOptimizationSettings(): OptimizationSettings {
    return { ...this.optimizationSettings }
  }

  updateOptimizationSettings(settings: Partial<OptimizationSettings>) {
    this.optimizationSettings = { ...this.optimizationSettings, ...settings }
    localStorage.setItem("bandwidth_settings", JSON.stringify(this.optimizationSettings))
  }

  // Compress data for transmission
  compressData(data: any): string {
    if (!this.optimizationSettings.enableDataCompression) {
      return JSON.stringify(data)
    }

    // Simple compression: remove unnecessary whitespace and compress common patterns
    let compressed = JSON.stringify(data)

    // Replace common patterns to reduce size
    compressed = compressed
      .replace(/"id":/g, '"i":')
      .replace(/"name":/g, '"n":')
      .replace(/"description":/g, '"d":')
      .replace(/"timestamp":/g, '"t":')
      .replace(/"available"/g, '"a"')
      .replace(/"unavailable"/g, '"u"')
      .replace(/true/g, "1")
      .replace(/false/g, "0")

    return compressed
  }

  // Decompress data after receiving
  decompressData(compressedData: string): any {
    if (!this.optimizationSettings.enableDataCompression) {
      return JSON.parse(compressedData)
    }

    // Reverse compression
    const decompressed = compressedData
      .replace(/"i":/g, '"id":')
      .replace(/"n":/g, '"name":')
      .replace(/"d":/g, '"description":')
      .replace(/"t":/g, '"timestamp":')
      .replace(/"a"/g, '"available"')
      .replace(/"u"/g, '"unavailable"')
      .replace(/(?<!")1(?!")/g, "true")
      .replace(/(?<!")0(?!")/g, "false")

    return JSON.parse(decompressed)
  }

  // Optimize image loading based on bandwidth
  getOptimizedImageUrl(originalUrl: string, width?: number, height?: number): string {
    if (!this.optimizationSettings.enableImageCompression) {
      return originalUrl
    }

    const quality = this.optimizationSettings.maxImageQuality
    const params = new URLSearchParams()

    if (width) params.append("w", width.toString())
    if (height) params.append("h", height.toString())
    params.append("q", quality.toString())

    // For placeholder images, add compression parameters
    if (originalUrl.includes("placeholder.svg")) {
      return `${originalUrl}&${params.toString()}`
    }

    return originalUrl
  }

  // Implement progressive loading strategy
  shouldLoadProgressively(): boolean {
    return this.optimizationSettings.enableProgressiveLoading && this.isLowBandwidth
  }

  // Cache management for offline functionality
  async cacheEssentialData(data: any, key: string): Promise<void> {
    if (!this.optimizationSettings.enableOfflineMode) return

    try {
      const compressed = this.compressData(data)
      localStorage.setItem(`cache_${key}`, compressed)
      localStorage.setItem(`cache_${key}_timestamp`, Date.now().toString())
    } catch (error) {
      console.warn("Failed to cache data:", error)
    }
  }

  async getCachedData(key: string, maxAge = 3600000): Promise<any | null> {
    if (!this.optimizationSettings.enableOfflineMode) return null

    try {
      const cached = localStorage.getItem(`cache_${key}`)
      const timestamp = localStorage.getItem(`cache_${key}_timestamp`)

      if (!cached || !timestamp) return null

      const age = Date.now() - Number.parseInt(timestamp)
      if (age > maxAge) {
        // Cache expired
        localStorage.removeItem(`cache_${key}`)
        localStorage.removeItem(`cache_${key}_timestamp`)
        return null
      }

      return this.decompressData(cached)
    } catch (error) {
      console.warn("Failed to retrieve cached data:", error)
      return null
    }
  }

  // Batch API requests to reduce network calls
  private requestQueue: Array<{ url: string; options: RequestInit; resolve: Function; reject: Function }> = []
  private batchTimeout: NodeJS.Timeout | null = null

  async optimizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.isLowBandwidth) {
      return fetch(url, options)
    }

    // For low bandwidth, batch requests
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ url, options, resolve, reject })

      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout)
      }

      this.batchTimeout = setTimeout(() => {
        this.processBatchedRequests()
      }, 100) // Batch requests for 100ms
    })
  }

  private async processBatchedRequests() {
    const requests = [...this.requestQueue]
    this.requestQueue = []

    // Process requests with delay to avoid overwhelming the connection
    for (let i = 0; i < requests.length; i++) {
      const { url, options, resolve, reject } = requests[i]

      try {
        const response = await fetch(url, options)
        resolve(response)
      } catch (error) {
        reject(error)
      }

      // Add delay between requests for low bandwidth
      if (i < requests.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }
  }

  // Monitor data usage
  private dataUsage = {
    sent: 0,
    received: 0,
    session: Date.now(),
  }

  trackDataUsage(bytes: number, type: "sent" | "received") {
    this.dataUsage[type] += bytes

    // Save to localStorage for persistence
    localStorage.setItem("data_usage", JSON.stringify(this.dataUsage))
  }

  getDataUsage() {
    const saved = localStorage.getItem("data_usage")
    if (saved) {
      this.dataUsage = JSON.parse(saved)
    }
    return { ...this.dataUsage }
  }

  // Reset data usage tracking
  resetDataUsage() {
    this.dataUsage = {
      sent: 0,
      received: 0,
      session: Date.now(),
    }
    localStorage.setItem("data_usage", JSON.stringify(this.dataUsage))
  }
}

export const bandwidthOptimizer = new BandwidthOptimizer()
