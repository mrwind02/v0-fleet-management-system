#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("Verifying frontend module exports...\n")

const checks = [
  {
    file: "store/authStore.ts",
    exports: ["useAuthStore"],
  },
  {
    file: "services/api.ts",
    exports: [
      "authService",
      "vehicleService",
      "driverService",
      "maintenanceService",
      "questionnaireService",
      "reportService",
    ],
  },
  {
    file: "components/auth/LoginForm.tsx",
    exports: ["LoginForm"],
  },
  {
    file: "components/layout/MainLayout.tsx",
    exports: ["MainLayout"],
  },
  {
    file: "components/layout/Header.tsx",
    exports: ["Header"],
  },
  {
    file: "components/layout/Sidebar.tsx",
    exports: ["Sidebar"],
  },
  {
    file: "components/vehicles/VehicleForm.tsx",
    exports: ["VehicleForm"],
  },
  {
    file: "components/vehicles/VehicleList.tsx",
    exports: ["VehicleList"],
  },
  {
    file: "components/drivers/DriverForm.tsx",
    exports: ["DriverForm"],
  },
  {
    file: "components/maintenance/MaintenanceForm.tsx",
    exports: ["MaintenanceForm"],
  },
]

let hasErrors = false

checks.forEach(({ file, exports: expectedExports }) => {
  const fullPath = path.join(__dirname, file)
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf8")
    const missing = []

    expectedExports.forEach((exp) => {
      if (
        !content.includes(`export ${exp}`) &&
        !content.includes(`export const ${exp}`) &&
        !content.includes(`export function ${exp}`)
      ) {
        missing.push(exp)
      }
    })

    if (missing.length === 0) {
      console.log(`✓ ${file}`)
    } else {
      console.error(`✗ ${file} - missing exports: ${missing.join(", ")}`)
      hasErrors = true
    }
  } else {
    console.error(`✗ ${file} - file not found`)
    hasErrors = true
  }
})

if (hasErrors) {
  console.error("\n✗ Some modules are missing required exports!")
  process.exit(1)
} else {
  console.log("\n✓ All modules are properly exported")
  process.exit(0)
}
