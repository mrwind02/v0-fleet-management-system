"use client"

import { useState, useEffect } from "react"
import { reportService, vehicleService, driverService } from "@/services/api"
import { useAuthStore } from "@/store/authStore"

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<any>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role !== "driver") {
          try {
            const metricsRes = await reportService.getMetrics()
            setMetrics(metricsRes.data.data || {
              activeVehicles: 0,
              activeDrivers: 0,
              maintenancesToday: 0,
              totalCosts: 0
            })
          } catch (error) {
            console.error("Error fetching metrics:", error)
            setMetrics({
              activeVehicles: 0,
              activeDrivers: 0,
              maintenancesToday: 0,
              totalCosts: 0
            })
          }

          try {
            const [vehiclesRes, driversRes] = await Promise.all([
              vehicleService.getAll(),
              driverService.getAll()
            ])
            setVehicles(vehiclesRes.data.data || [])
            setDrivers(driversRes.data.data || [])
          } catch (error) {
            console.error("Error fetching vehicles/drivers:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  useEffect(() => {
    const fetchActivities = async () => {
      if (user?.role !== "driver") {
        try {
          const activitiesRes = await reportService.getRecentActivities(10, selectedVehicle || undefined)
          setRecentActivities(activitiesRes.data.data || [])
        } catch (error) {
          console.error("Error fetching recent activities:", error)
          setRecentActivities([])
        }
      }
    }
    fetchActivities()
  }, [selectedVehicle, user])

  return {
    metrics,
    recentActivities,
    vehicles,
    drivers,
    selectedVehicle,
    setSelectedVehicle,
    isLoading,
    user
  }
}
