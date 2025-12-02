# Fleet Management System - API Documentation

## Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

## Authentication

All endpoints (except login and register) require a JWT Bearer token in the Authorization header:

\`\`\`
Authorization: Bearer <access_token>
\`\`\`

## Authentication Endpoints

### Register User
\`\`\`
POST /auth/register
\`\`\`

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "João Silva",
  "role": "driver"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João Silva",
    "role": "driver",
    "isActive": true,
    "createdAt": "2024-11-28T10:00:00Z",
    "updatedAt": "2024-11-28T10:00:00Z"
  }
}
\`\`\`

### Login
\`\`\`
POST /auth/login
\`\`\`

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "João Silva",
      "role": "driver"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
\`\`\`

## Vehicle Endpoints

### Create Vehicle
\`\`\`
POST /vehicles
Authorization: Bearer <admin|manager>
\`\`\`

**Request Body:**
\`\`\`json
{
  "plate": "ABC1234",
  "renavam": "12345678901",
  "brand": "Volvo",
  "model": "FH16",
  "year": 2020,
  "color": "Branco",
  "transportType": "Rodoviário",
  "chassisNumber": "ABC123456789",
  "loadCapacity": 25000,
  "observations": "Caminhão de carga"
}
\`\`\`

### Get All Vehicles
\`\`\`
GET /vehicles?active=true
Authorization: Bearer <token>
\`\`\`

### Get Vehicle by ID
\`\`\`
GET /vehicles/:id
Authorization: Bearer <token>
\`\`\`

## Driver Endpoints

### Create Driver
\`\`\`
POST /drivers
Authorization: Bearer <admin|manager>
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "João Silva",
  "cnhNumber": "12345678901",
  "cnhCategory": "D",
  "cnhExpiryDate": "2026-12-31",
  "phone": "11999999999",
  "email": "joao@example.com",
  "specialLoadCertified": true,
  "userId": "uuid"
}
\`\`\`

### Assign Driver to Vehicle
\`\`\`
POST /drivers/:driverId/assign-vehicle
Authorization: Bearer <admin|manager>
\`\`\`

**Request Body:**
\`\`\`json
{
  "vehicleId": "vehicle-uuid",
  "notes": "Motorista principal"
}
\`\`\`

## Maintenance Endpoints

### Create Maintenance Record
\`\`\`
POST /maintenance
Authorization: Bearer <token>
\`\`\`

**Request Body:**
\`\`\`json
{
  "vehicleId": "vehicle-uuid",
  "maintenanceDate": "2024-11-15",
  "maintenanceType": "preventiva",
  "mechanicName": "Carlos Silva",
  "establishmentName": "Oficina ABC",
  "serviceDescription": "Troca de óleo e filtro",
  "cost": 500.00,
  "odometerReading": 150000
}
\`\`\`

### Get Maintenance by Vehicle
\`\`\`
GET /maintenance/vehicle/:vehicleId?startDate=2024-01-01&endDate=2024-12-31&maintenanceType=preventiva
Authorization: Bearer <token>
\`\`\`

## Questionnaire Endpoints

### Record Status
\`\`\`
POST /questionnaire
Authorization: Bearer <token>
\`\`\`

**Request Body:**
\`\`\`json
{
  "driverId": "driver-uuid",
  "vehicleId": "vehicle-uuid",
  "status": "driving",
  "gpsLatitude": -23.550520,
  "gpsLongitude": -46.633309
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "driverId": "driver-uuid",
    "vehicleId": "vehicle-uuid",
    "status": "driving",
    "gpsLatitude": -23.550520,
    "gpsLongitude": -46.633309,
    "timestampResponse": "2024-11-28T10:30:00Z",
    "createdAt": "2024-11-28T10:30:00Z"
  }
}
\`\`\`

## Report Endpoints

### Dashboard Metrics
\`\`\`
GET /reports/metrics
Authorization: Bearer <admin|manager>
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "activeVehicles": 3,
    "activeDrivers": 5,
    "maintenancesToday": 1,
    "totalKilometers": 450000
  }
}
\`\`\`

### Export Maintenance CSV
\`\`\`
GET /reports/maintenance/csv?vehicleId=uuid&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin|manager>
\`\`\`

### Export Questionnaire CSV
\`\`\`
GET /reports/questionnaire/csv?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin|manager>
\`\`\`

## Error Responses

All errors follow this format:

\`\`\`json
{
  "success": false,
  "error": "Error message"
}
\`\`\`

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Server Error
