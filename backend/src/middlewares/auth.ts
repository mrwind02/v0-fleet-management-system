import type { Request, Response, NextFunction } from "express"
import { verifyToken } from "../utils/jwt"

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: string
      }
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ success: false, error: "Token not provided" })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(403).json({ success: false, error: "Invalid or expired token" })
  }

  req.user = decoded
  next()
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Insufficient permissions" })
    }
    next()
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      req.user = decoded
    }
  }

  next()
}
