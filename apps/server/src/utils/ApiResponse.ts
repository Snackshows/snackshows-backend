class ApiResponse {
	statusCode: number;
	data: unknown;
	message: string;
	success: boolean;

	constructor(statusCode: number, data: unknown, message = 'Success') {
		this.statusCode = statusCode;
		this.message = message;
		this.success = statusCode < 400;
		this.data = data;
	}
}

export default ApiResponse;
