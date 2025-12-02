import { VehicleService } from "../services/VehicleService"
import { query } from "../config/database"
import jest from "jest"

jest.mock("../config/database")

describe("VehicleService", () => {
  let vehicleService: VehicleService

  beforeEach(() => {
    vehicleService = new VehicleService()
  })

  describe("create", () => {
    it("should create a new vehicle", async () => {
      const vehicleData = {
        plate: "ABC1234",
        brand: "Volvo",
        model: "FH16",
        year: 2020,
        chassisNumber: "ABC123",
        transportType: "Rodoviário",
      }
      ;(query as jest.Mock).mockResolvedValue({
        rows: [{ id: "vehicle-1", ...vehicleData, created_at: new Date(), updated_at: new Date() }],
      })

      const result = await vehicleService.create(vehicleData)

      expect(result.plate).toBe("ABC1234")
      expect(result.brand).toBe("Volvo")
    })
  })

  describe("getAll", () => {
    it("should return all active vehicles", async () => {
      const mockVehicles = [
        { id: "v1", plate: "ABC1234", brand: "Volvo", is_active: true },
        { id: "v2", plate: "DEF5678", brand: "Scania", is_active: true },
      ]
      ;(query as jest.Mock).mockResolvedValue({ rows: mockVehicles })

      const result = await vehicleService.getAll(true)

      expect(result).toHaveLength(2)
    })
  })

  describe("getByPlate", () => {
    it("should return vehicle by plate", async () => {
      const mockVehicle = { id: "v1", plate: "ABC1234", brand: "Volvo" }
      ;(query as jest.Mock).mockResolvedValue({ rows: [mockVehicle] })

      const result = await vehicleService.getByPlate("ABC1234")

      expect(result?.plate).toBe("ABC1234")
    })
  })
})
