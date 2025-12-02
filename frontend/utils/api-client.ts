export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return new ApiError(error.response.status, error.response.data?.error || error.message, error.response.data)
  }
  return new ApiError(500, error.message || "Erro desconhecido")
}
