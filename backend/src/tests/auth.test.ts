import { AuthService } from "../services/AuthService"
import * as jwt from "../utils/jwt"
import { query } from "../config/database"
import jest from "jest" // Declare the jest variable

jest.mock("../config/database")
jest.mock("../utils/jwt")

describe("AuthService", () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService()
  })

  describe("register", () => {
    it("should create a new user", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "driver",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }
      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [] }) // Check existing
      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] }) // Create

      const result = await authService.register("test@example.com", "password123", "Test User")

      expect(result.email).toBe("test@example.com")
      expect(result.name).toBe("Test User")
    })

    it("should throw error if email already exists", async () => {
      ;(query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: "existing" }] })

      await expect(authService.register("test@example.com", "password123", "Test User")).rejects.toThrow(
        "Email already registered",
      )
    })
  })

  describe("login", () => {
    it("should return user and tokens on successful login", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "driver",
        password_hash: "hashed_password",
        is_active: true,
      }
      ;(query as jest.Mock).mockResolvedValue({ rows: [mockUser] })
      ;(jwt.generateToken as jest.Mock).mockReturnValue("access-token")
      ;(jwt.generateRefreshToken as jest.Mock).mockReturnValue("refresh-token")

      const result = await authService.login("test@example.com", "password123")

      expect(result.accessToken).toBe("access-token")
      expect(result.refreshToken).toBe("refresh-token")
      expect(result.user.email).toBe("test@example.com")
    })
  })
})
