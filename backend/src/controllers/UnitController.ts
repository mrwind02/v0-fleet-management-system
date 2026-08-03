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

  async create(req: Request, res: Response) {
    try {
      const unit = await this.unitService.create(req.body)
      res.status(201).json({ success: true, data: unit })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const unit = await this.unitService.update(id, req.body)
      res.json({ success: true, data: unit })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      await this.unitService.delete(id)
      res.json({ success: true, message: "Filial excluída com sucesso" })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
}
