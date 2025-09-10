"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Wifi, WifiOff, Signal, Download, Upload, Settings, Zap, Database } from "lucide-react"
import { bandwidthOptimizer, type BandwidthInfo, type OptimizationSettings } from "@/lib/bandwidth-optimizer"

interface LowBandwidthModeProps {
  onSettingsChange?: (settings: OptimizationSettings) => void
}

export default function LowBandwidthMode({ onSettingsChange }: LowBandwidthModeProps) {
  const [bandwidthInfo, setBandwidthInfo] = useState<BandwidthInfo | null>(null)
  const [isLowBandwidth, setIsLowBandwidth] = useState(false)
  const [settings, setSettings] = useState<OptimizationSettings>(bandwidthOptimizer.getOptimizationSettings())
  const [dataUsage, setDataUsage] = useState(bandwidthOptimizer.getDataUsage())
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // Initial setup
    setBandwidthInfo(bandwidthOptimizer.getBandwidthInfo())
    setIsLowBandwidth(bandwidthOptimizer.isLowBandwidthConnection())

    // Listen for bandwidth changes
    const handleBandwidthChange = (event: CustomEvent) => {
      setIsLowBandwidth(event.detail.isLowBandwidth)
      setSettings(event.detail.settings)
    }

    window.addEventListener("bandwidthchange", handleBandwidthChange as EventListener)

    // Update data usage periodically
    const usageInterval = setInterval(() => {
      setDataUsage(bandwidthOptimizer.getDataUsage())
    }, 5000)

    return () => {
      window.removeEventListener("bandwidthchange", handleBandwidthChange as EventListener)
      clearInterval(usageInterval)
    }
  }, [])

  const handleSettingChange = (key: keyof OptimizationSettings, value: boolean | number) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    bandwidthOptimizer.updateOptimizationSettings(newSettings)

    if (onSettingsChange) {
      onSettingsChange(newSettings)
    }
  }

  const getConnectionIcon = () => {
    if (!bandwidthInfo) return <WifiOff className="h-4 w-4" />

    switch (bandwidthInfo.effectiveType) {
      case "slow-2g":
      case "2g":
        return <Signal className="h-4 w-4 text-destructive" />
      case "3g":
        return <Signal className="h-4 w-4 text-secondary" />
      case "4g":
        return <Wifi className="h-4 w-4 text-primary" />
      default:
        return <Wifi className="h-4 w-4" />
    }
  }

  const getConnectionQuality = () => {
    if (!bandwidthInfo) return "Unknown"

    if (bandwidthInfo.effectiveType === "slow-2g") return "Very Slow"
    if (bandwidthInfo.effectiveType === "2g") return "Slow"
    if (bandwidthInfo.effectiveType === "3g") return "Moderate"
    if (bandwidthInfo.effectiveType === "4g") return "Fast"
    return "Unknown"
  }

  const formatDataSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getOptimizationLevel = () => {
    let level = 0
    if (settings.enableImageCompression) level++
    if (settings.enableDataCompression) level++
    if (settings.enableOfflineMode) level++
    if (settings.enableProgressiveLoading) level++
    if (settings.enableLowBandwidthMode) level++
    return (level / 5) * 100
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getConnectionIcon()}
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Connection Quality</span>
            <Badge variant={isLowBandwidth ? "destructive" : "default"}>{getConnectionQuality()}</Badge>
          </div>

          {bandwidthInfo && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span>Download Speed</span>
                <span>{bandwidthInfo.downlink} Mbps</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Latency</span>
                <span>{bandwidthInfo.rtt} ms</span>
              </div>
              {bandwidthInfo.saveData && (
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>Data Saver mode is enabled on your device</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Low Bandwidth Alert */}
      {isLowBandwidth && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            Low bandwidth detected. Optimizations are automatically enabled to improve performance.
          </AlertDescription>
        </Alert>
      )}

      {/* Data Usage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Data Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <span className="text-sm">Downloaded</span>
            </div>
            <span className="text-sm font-medium">{formatDataSize(dataUsage.received)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-secondary" />
              <span className="text-sm">Uploaded</span>
            </div>
            <span className="text-sm font-medium">{formatDataSize(dataUsage.sent)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Total Usage</span>
            <span className="text-sm font-bold">{formatDataSize(dataUsage.sent + dataUsage.received)}</span>
          </div>

          <Button variant="outline" size="sm" onClick={() => bandwidthOptimizer.resetDataUsage()} className="w-full">
            Reset Usage
          </Button>
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Optimization Settings
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
              {showSettings ? "Hide" : "Show"}
            </Button>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Optimization Level</span>
            <Progress value={getOptimizationLevel()} className="flex-1 h-2" />
            <span className="text-sm font-medium">{Math.round(getOptimizationLevel())}%</span>
          </div>
        </CardHeader>

        {showSettings && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Low Bandwidth Mode</p>
                <p className="text-xs text-muted-foreground">Enables all optimizations automatically</p>
              </div>
              <Switch
                checked={settings.enableLowBandwidthMode}
                onCheckedChange={(checked) => handleSettingChange("enableLowBandwidthMode", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Image Compression</p>
                <p className="text-xs text-muted-foreground">Reduces image quality to save bandwidth</p>
              </div>
              <Switch
                checked={settings.enableImageCompression}
                onCheckedChange={(checked) => handleSettingChange("enableImageCompression", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Data Compression</p>
                <p className="text-xs text-muted-foreground">Compresses API responses</p>
              </div>
              <Switch
                checked={settings.enableDataCompression}
                onCheckedChange={(checked) => handleSettingChange("enableDataCompression", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Offline Mode</p>
                <p className="text-xs text-muted-foreground">Caches data for offline access</p>
              </div>
              <Switch
                checked={settings.enableOfflineMode}
                onCheckedChange={(checked) => handleSettingChange("enableOfflineMode", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Progressive Loading</p>
                <p className="text-xs text-muted-foreground">Loads content gradually</p>
              </div>
              <Switch
                checked={settings.enableProgressiveLoading}
                onCheckedChange={(checked) => handleSettingChange("enableProgressiveLoading", checked)}
              />
            </div>

            {settings.enableImageCompression && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Image Quality</p>
                  <span className="text-sm">{settings.maxImageQuality}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="10"
                  value={settings.maxImageQuality}
                  onChange={(e) => handleSettingChange("maxImageQuality", Number.parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Optimization Tips */}
      {isLowBandwidth && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bandwidth Saving Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use voice recording instead of typing for faster input</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Enable offline mode to cache essential data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Sync data when connection improves</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use SMS alerts for critical notifications</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
