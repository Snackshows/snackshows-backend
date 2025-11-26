import { Request } from 'express';

export interface PaymentData {
	storeId: string;
	amount: number;
	currency: string;
	orderId: string;
	customerId: string;
	callbackUrl?: string;
}

export interface PaymentResponse {
	success: boolean;
	gateway: string;
	paymentUrl?: string;
	transactionId?: string;
	error?: string;
}

export interface IPaymentGateway {
	createPayment(data: PaymentData): Promise<PaymentResponse>;
	verifyWebhook(request: Request): Promise<boolean>;
	// refundPayment(transactionId:string):Promise<PaymentResponse>;
}
