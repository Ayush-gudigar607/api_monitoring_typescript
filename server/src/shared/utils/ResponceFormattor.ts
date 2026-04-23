import { ApiResponse, PaginatedResponse } from "./types/ResponceFormattor";

class ResponseFormatter {
  static success<T>(
    data: T | null = null,
    message: string = "Success",
    statusCode: number = 200
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static error<T>(
    message: string = "Error",
    statusCode: number = 500,
    data: T | null = null
  ): ApiResponse<T> {
    return {
      success: false,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[] = [],
    page: number = 1,
    limit: number = 10,
    total: number = 0,
    message: string = "Success",
    statusCode: number = 200
  ): PaginatedResponse<T> {
    return {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        totalPages: limit ? Math.ceil(total / limit) : 0,
      },
    };
  }
}

export default ResponseFormatter;