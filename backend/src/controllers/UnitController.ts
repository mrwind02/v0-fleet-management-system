import type { Request, Response } from "express"
import { UnitService } from "../services/UnitService"

export class UnitController {
  private unitService = new UnitService()

  async getAll(req: Request, res: Response) {
    try {
      const units = await this.unitService.getAll()
      res.json({ success: true, data: units })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
}
