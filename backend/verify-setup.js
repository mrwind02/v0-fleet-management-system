const https = require("https")
const http = require("http")

const API_URL = process.env.API_URL || "http://localhost:3000"

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http
    const client = protocol.get(url, options, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null,
        })
      })
    })
    client.on("error", reject)
  })
}

async function verify() {
  console.log("\n🔍 Verificando setup do Fleet Management System...\n")

  try {
    // 1. Health Check
    console.log("1️⃣  Testando Health Check...")
    const health = await makeRequest(`${API_URL}/health`)
    console.log(`   ✅ Health OK - Status: ${health.status}`)
    console.log(`   API Status: ${health.body.status}`)

    // 2. Database Connection
    console.log("\n2️⃣  Verificando conexão com banco de dados...")
    const response = await makeRequest(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (response.status === 404) {
      console.log("   ❌ ERRO: Rotas não foram registradas!")
      console.log("   Verificar se backend/src/app.ts contém: setupRoutes(app)")
      return false
    }

    if (response.status === 500) {
      console.log("   ❌ ERRO: Banco de dados não está acessível")
      console.log("   Verifique: PostgreSQL está rodando? Variáveis DB estão corretas?")
      return false
    }

    // 3. Test Login
    console.log("\n3️⃣  Testando Login com credenciais de teste...")
    const loginResponse = await makeRequest(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@fleet.com",
        password: "password123",
      }),
    })

    if (loginResponse.status === 200 && loginResponse.body.data) {
      console.log(`   ✅ Login bem-sucedido!`)
      console.log(`   Usuário: ${loginResponse.body.data.user.email}`)
      console.log(`   Role: ${loginResponse.body.data.user.role}`)
      return true
    } else if (loginResponse.status === 401) {
      console.log("   ⚠️  Credenciais de teste não existem")
      console.log("   Execute: npm run db:seed")
      return false
    } else {
      console.log(`   ❌ ERRO: Status ${loginResponse.status}`)
      console.log(`   Resposta: ${JSON.stringify(loginResponse.body)}`)
      return false
    }
  } catch (error) {
    console.log(`\n❌ ERRO: Não foi possível conectar ao servidor`)
    console.log(`   ${error.message}`)
    console.log(`\n   Verifique se backend está rodando em ${API_URL}`)
    console.log(`   Execute: npm run dev`)
    return false
  }
}

verify().then((success) => {
  console.log("\n" + "=".repeat(50) + "\n")
  if (success) {
    console.log("✨ Setup verificado com sucesso!")
  } else {
    console.log("⚠️  Existem problemas no setup. Veja acima.")
  }
  process.exit(success ? 0 : 1)
})
