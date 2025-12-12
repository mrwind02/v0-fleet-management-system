import type { Request, Response } from "express"
import { DriverService } from "../services/DriverService"

export class DriverController {
  private driverService = new DriverService()

  async create(req: Request, res: Response) {
    try {
      const { name, cnhNumber, cnhCategory, cnhExpiryDate, phone, email, specialLoadCertified, photoUrl, userId } =
        req.body

      // Validações
      if (!name || !cnhNumber || !cnhCategory || !cnhExpiryDate) {
        return res.status(400).json({ success: false, error: "Missing required fields" })
      }

      // Verificar CNH única
      const existing = await this.driverService.getByCNH(cnhNumber)
      if (existing) {
        return res.status(409).json({ success: false, error: "CNH already registered" })
      }

      const driver = await this.driverService.create({
        userId,
        name,
        cnhNumber,
        cnhCategory,
        cnhExpiryDate: new Date(cnhExpiryDate),
        phone,
        email,
        specialLoadCertified,
        photoUrl,
      })

      res.status(201).json({ success: true, data: driver })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const isActive = req.query.active === "true" ? true : req.query.active === "false" ? false : undefined
      const drivers = await this.driverService.getAll(isActive)
      res.json({ success: true, data: drivers })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const driver = await this.driverService.getById(id)

      if (!driver) {
        return res.status(404).json({ success: false, error: "Driver not found" })
      }

      res.json({ success: true, data: driver })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const driver = await this.driverService.update(id, req.body)
      res.json({ success: true, data: driver })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async assignToVehicle(req: Request, res: Response) {
    try {
      const { driverId } = req.params
      const { vehicleId, notes } = req.body

      if (!vehicleId) {
        return res.status(400).json({ success: false, error: "vehicleId is required" })
      }

      const assignment = await this.driverService.assignToVehicle(driverId, vehicleId, notes)
      res.json({ success: true, data: assignment })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async getCurrentVehicle(req: Request, res: Response) {
    try {
      const { driverId } = req.params
      const vehicle = await this.driverService.getCurrentVehicle(driverId)

      if (!vehicle) {
        return res.status(404).json({ success: false, error: "No vehicle assigned" })
      }

      res.json({ success: true, data: vehicle })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      await this.driverService.delete(id)
      res.json({ success: true, message: "Driver deleted successfully" })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
}
