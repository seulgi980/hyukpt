export interface ApiError {
  statusCode: number;
  error: string;
  code: string;
  message: string;
  detail: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  status: string;
  result: T;
}

export interface GameResult {
  top1: string;
  jg1: string;
  mid1: string;
  ad1: string;
  sup1: string;
  top2: string;
  jg2: string;
  mid2: string;
  ad2: string;
  sup2: string;
}