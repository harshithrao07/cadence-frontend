export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
