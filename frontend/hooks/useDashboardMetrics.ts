"use client"

import { useState, useEffect } from "react"
import { dashboardService, reportService, vehicleService, driverService } from "@/services/api"
import { useAuthStore } from "@/store/authStore"

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<any>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  
  // Date filter state
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [startDate, setStartDate] = useState<Date | undefined>(thirtyDaysAgo)
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  
  const [isLoading, setIsLoading] = useState(true)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role !== "driver") {
          try {
            const metricsRes = await dashboardService.getMetrics(
              startDate?.toISOString(), 
              endDate?.toISOString()
            )
            const data = metricsRes.data
            setMetrics({
              activeVehicles: data.vehicles.active,
              activeDrivers: data.drivers.active,
              maintenancesToday: data.vehicles.maintenance,
              totalCosts: data.costs.totalMonthly,
              costs: data.costs
            })
          } catch (error) {
            console.error("Error fetching metrics:", error)
            setMetrics({
              activeVehicles: 0,
              activeDrivers: 0,
              maintenancesToday: 0,
              totalCosts: 0,
              costs: null
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
  }, [startDate, endDate, user])

  useEffect(() => {
    const fetchActivities = async () => {
      if (user?.role !== "driver") {
        try {
          const activitiesRes = await reportService.getRecentActivities(10, undefined)
          // Ideally we would pass dates to getRecentActivities too, but its current backend implementation might not support it yet.
          // We can filter locally for now if needed, or update backend later.
          // Let's filter locally if dates are set.
          let activities = activitiesRes.data.data || [];
          if (startDate && endDate) {
             activities = activities.filter((act: any) => {
               const d = new Date(act.date);
               return d >= startDate && d <= endDate;
             });
          }
          setRecentActivities(activities)
        } catch (error) {
          console.error("Error fetching recent activities:", error)
          setRecentActivities([])
        }
      }
    }
    fetchActivities()
  }, [startDate, endDate, user])

  return {
    metrics,
    recentActivities,
    vehicles,
    drivers,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    user
  }
}
