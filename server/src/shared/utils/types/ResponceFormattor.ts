export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;
  timestamp: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  statusCode: number;
  timestamp: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};