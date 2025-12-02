#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("Verifying module exports...")

const files = [
  "src/services/AuthService.ts",
  "src/services/VehicleService.ts",
  "src/services/DriverService.ts",
  "src/services/MaintenanceService.ts",
  "src/services/QuestionnaireService.ts",
  "src/services/ReportService.ts",
  "src/controllers/AuthController.ts",
  "src/controllers/VehicleController.ts",
  "src/controllers/DriverController.ts",
  "src/routes/auth.ts",
  "src/routes/vehicles.ts",
  "src/routes/drivers.ts",
]

let hasErrors = false

files.forEach((file) => {
  const fullPath = path.join(__dirname, file)
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf8")
    if (content.includes("export ")) {
      console.log(`✓ ${file}`)
    } else {
      console.error(`✗ ${file} - no exports found`)
      hasErrors = true
    }
  } else {
    console.error(`✗ ${file} - file not found`)
    hasErrors = true
  }
})

if (hasErrors) {
  console.error("\nSome modules are missing exports!")
  process.exit(1)
} else {
  console.log("\n✓ All modules are properly exported")
  process.exit(0)
}
