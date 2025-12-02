"use client"

import { useState } from "react"
import { useLoginDebug } from "@/hooks/useLoginDebug"

export function LoginDebugPanel() {
  const [showPanel, setShowPanel] = useState(false)
  const { testLogin, testApiHealth, results } = useLoginDebug()
  const [testEmail, setTestEmail] = useState("admin@fleet.com")

  const handleQuickTest = async () => {
    console.log("[v0] Starting quick login test")
    await testLogin(testEmail, "password123")
  }

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg"
      >
        {showPanel ? "Fechar Debug" : "Abrir Debug"}
      </button>

      {showPanel && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleQuickTest}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold"
              >
                Testar Login
              </button>
              <button
                onClick={testApiHealth}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold"
              >
                Health Check
              </button>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold mb-2">Resultados Recentes:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-xs text-gray-500">Nenhum resultado ainda</p>
                ) : (
                  results.slice(0, 5).map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-xs font-mono border ${
                        result.success ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
                      }`}
                    >
                      <p className="font-semibold">
                        [{result.status || "???"}] {result.success ? "✓" : "✗"}
                      </p>
                      <p className="text-xs">{result.message}</p>
                      <p className="text-xs text-gray-500">{result.timestamp}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
