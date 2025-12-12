import { DriverService } from "../services/DriverService"
import { query } from "../config/database"

// Mock the database query function
jest.mock("../config/database")

describe("DriverService", () => {
    let driverService: DriverService

    beforeEach(() => {
        driverService = new DriverService()
            // Reset mocks
            ; (query as any).mockReset()
    })

    describe("update", () => {
        it("should not generate SQL with duplicate updated_at assignment", async () => {
            // Mock data
            const driverId = "driver-123"
            const updateData = {
                name: "Updated Name",
                updatedAt: new Date("2023-01-01T00:00:00Z"), // This should be filtered out from explicit assignments
            }

            const mockResult = {
                rows: [
                    {
                        id: driverId,
                        name: "Updated Name",
                        updated_at: new Date(),
                    },
                ],
            }

                // Mock the query response
                ; (query as any).mockResolvedValue(mockResult)

            // execution
            await driverService.update(driverId, updateData)

            // verification
            const expectedSqlStart = "UPDATE drivers SET"
            const expectedSqlEnd = "WHERE id = $3 RETURNING *"

            // Get the arguments called with query
            const [sql, params] = (query as any).mock.calls[0]

            console.log('Generated SQL:', sql)

            // The key assertion: check that updated_at appears only once in the SET clause
            // We expect "name = $1, updated_at = CURRENT_TIMESTAMP"
            // We DO NOT expect "name = $1, updated_at = $2, updated_at = CURRENT_TIMESTAMP"

            const occurrences = (sql.match(/updated_at/g) || []).length
            // It might appear more if my regex is loose, but specifically look at the SET clause assignments
            // Better check:
            expect(sql).toContain("updated_at = CURRENT_TIMESTAMP")
            expect(sql).not.toMatch(/updated_at = \$\d+,.*updated_at = CURRENT_TIMESTAMP/)
            // Or simply check that params does not contain the date object if we filter it out correctly
            // But wait, the current implementation blindly converts snakeKey.
            // So if updatedAt is passed, it becomes updated_at = $X.
            // And then updated_at = CURRENT_TIMESTAMP is appended.

            // If fixed, 'updatedAt' from input should be ignored.
        })
    })
})
