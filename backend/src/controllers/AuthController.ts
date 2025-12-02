import type { Request, Response } from "express"
import { AuthService } from "../services/AuthService"
import { verifyRefreshToken, generateToken } from "../utils/jwt"

export class AuthController {
  private authService = new AuthService()

  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body

      if (!email || !password || !name) {
        return res.status(400).json({ success: false, error: "Email, password and name are required" })
      }

      const user = await this.authService.register(email, password, name, role || "driver")
      res.status(201).json({ success: true, data: user })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ success: false, error: "Email and password are required" })
      }

      const result = await this.authService.login(email, password)
      res.json({ success: true, data: result })
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message })
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(400).json({ success: false, error: "Refresh token is required" })
      }

      const decoded = verifyRefreshToken(refreshToken)
      if (!decoded) {
        return res.status(403).json({ success: false, error: "Invalid or expired refresh token" })
      }

      const newAccessToken = generateToken(decoded)
      res.json({ success: true, data: { accessToken: newAccessToken } })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: "Not authenticated" })
      }

      const user = await this.authService.getUserById(req.user.id)
      res.json({ success: true, data: user })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
}
