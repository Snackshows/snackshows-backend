class ApiResponse {
  statusCode: number;
  data: unknown;
  message: string;
  success: boolean;
  total?: number;

  constructor(
    statusCode: number,
    data: unknown,
    message = "Success",
    total?: number
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
    this.total = total;
    this.data = data;
  }
}

export default ApiResponse;
