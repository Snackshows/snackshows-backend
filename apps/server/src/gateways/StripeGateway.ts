// interface IPaymentGateway {
// 	createPayment(data: PaymentMethodData): Promise<PaymentResponse>;
// 	verifyWebhook(request: any): boolean;
// 	refundPayment(transactionId: string): Promise<RefundResponse>;
// }
// class StripeAdapter implements IPaymentGateway {
// 	async createPayment(data: PaymentMethodData) {
// 		/* Stripe logic */
// 	}
// 	async verifyWebhook(request: any) {
// 		/* Stripe webhook verification */
// 	}
// 	async refundPayment(txnId: string) {
// 		/* Refund via Stripe */
// 	}
// }
