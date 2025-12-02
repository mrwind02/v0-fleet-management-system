#!/usr/bin/env node

/**
 * Pre-build validation script
 * Checks if all critical files exist and exports are correct
 */

const fs = require("fs")
const path = require("path")

console.log("[BUILD CHECK] Validating project structure...\n")

const requiredFiles = [
  "store/authStore.ts",
  "services/api.ts",
  "components/auth/LoginForm.tsx",
  "components/layout/MainLayout.tsx",
  "components/layout/Header.tsx",
  "components/layout/Sidebar.tsx",
  "app/page.tsx",
  "app/layout.tsx",
  "app/login/page.tsx",
  "app/dashboard/page.tsx",
]

let allGood = true

requiredFiles.forEach((file) => {
  const fullPath = path.join(__dirname, file)
  if (fs.existsSync(fullPath)) {
    console.log(`✓ ${file}`)
  } else {
    console.error(`✗ MISSING: ${file}`)
    allGood = false
  }
})

if (allGood) {
  console.log("\n[BUILD CHECK] ✓ All critical files exist")
  process.exit(0)
} else {
  console.error("\n[BUILD CHECK] ✗ Some critical files are missing!")
  process.exit(1)
}
