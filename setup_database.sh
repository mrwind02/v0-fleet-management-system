#!/bin/bash

# Function to check command status
check_cmd() {
    command -v "$1" >/dev/null 2>&1
}

echo "🔍 Verificando ambiente..."

# Check if Docker is installed
if ! check_cmd docker; then
    echo "❌ Docker não encontrado."
    echo "⚠️  Tentando instalar Docker (será necessário senha de sudo)..."
    
    if check_cmd sudo; then
        sudo apt-get update
        sudo apt-get install -y docker.io docker-compose-v2
        
        # Add user to docker group to avoid sudo for docker commands
        sudo usermod -aG docker $USER
        echo "✅ Docker instalado! Nota: Pode ser necessário fazer logout/login para usar sem sudo."
    else
        echo "❌ 'sudo' não disponível. Por favor instale o Docker manualmente."
        exit 1
    fi
else
    echo "✅ Docker já instalado."
fi

# Start Postgres Container
echo "🚀 Iniciando Container do Banco de Dados..."

# Check if container exists (stopped or running)
if docker ps -a --format '{{.Names}}' | grep -q "^postgres$"; then
    echo "📦 Container 'postgres' já existe."
    if docker ps --format '{{.Names}}' | grep -q "^postgres$"; then
        echo "✅ Container já está rodando."
    else
        echo "▶️  Iniciando container parado..."
        docker start postgres
    fi
else
    echo "🆕 Criando e iniciando novo container Postgres..."
    docker run -d \
        --name postgres \
        -p 5432:5432 \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=fleet_management \
        postgres:15-alpine
fi

echo "⏳ Aguardando banco de dados iniciar..."
sleep 5

echo "✅ Banco de dados configurado na porta 5432!"
echo "📋 Credenciais: postgres / postgres / fleet_management"
