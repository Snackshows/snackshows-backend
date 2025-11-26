// import Razorpay from 'razorpay';
// import { IPaymentGateway, PaymentData, PaymentResponse } from './types';
// import { Request } from 'express';

// export class RazorPayGateway implements IPaymentGateway {
// 	private instance: Razorpay;

// 	constructor(apiKey: string, apiSecret: string) {
// 		this.instance = new Razorpay({
// 			key_id: apiKey,
// 			key_secret: apiSecret,
// 		});
// 	}

// 	async createPayment(data: PaymentData): Promise<PaymentResponse> {
// 		try {
// 			const options = {
// 				amount: data.amount * 100,
// 				currency: data.currency,
// 				receipt: data.orderId,
// 				notes: {
// 					storeId: data.storeId,
// 					customerId: data.customerId,
// 				},
// 			};
// 			const razorpayOrder = await this.instance.orders.create(options);
// 			return {
// 				success: true,
// 				gateway: 'razorpay',
// 				paymentUrl: razorpayOrder.status,
// 				transactionId: razorpayOrder.id,
// 			};
// 		} catch (error) {
// 			console.log(error);
// 			return {
// 				transactionId: '',
// 				success: false,
// 				error: error as string,
// 				gateway: 'razorpay',
// 			};
// 		}
// 	}

// 	async verifyWebhook(request: Request): Promise<boolean> {
// 		const crypto = await import('crypto');
// 		const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
// 		const { order_id, razorpay_payment_id, signature } = request.body;

// 		const generated_signature = crypto
// 			.createHmac('sha256', secret)
// 			.update(`${order_id} + ' | ' + ${razorpay_payment_id}`)
// 			.digest('hex');

// 		if (generated_signature == signature) {
// 			return true;
// 		}

// 		// return expectedSignature === request.headers.get('x-razorpay-signature');
// 		return false;
// 	}

// 	// async refundPayment(transactionId: string): Promise<PaymentResponse> {
// 	// 	const refund = await this.instance.refunds.fetch({
// 	// 		payment_id: transactionId,
// 	// 	});
// 	// 	return { success: refund.status === 'processed',gateway:'razorpay',transactionId:refund.id };
// 	// }
// }

// export const razorpayCard = ({
// 	amount,
// 	orderId,
// 	apiKey,
// }: {
// 	amount: number;
// 	orderId: string;
// 	apiKey: string;
// }) => `
// <button id="rzp-button1">Pay with Razorpay</button>
// <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
// <script>
// var options = {
//     "key": "${apiKey}", // Enter the Key ID generated from the Dashboard
//     "amount": ${amount}, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
//     "currency": "INR",
//     "name": "Acme Corp",
//     "description": "Test Transaction",
//     "image": "https://example.com/your_logo",
//     "order_id": "${orderId}", //This is a sample Order ID. Pass the "id" obtained in the response of Step 1
//     "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
//     "prefill": {
//         "name": "Tejodeep Mitra Roy",
//         "email": "tejodeepmitraroy@gmail.com",
//         "contact": "9671671671"
//     },
//     "notes": {
//         "address": "Razorpay Corporate Office"
//     },
//     "theme": {
//         "color": "#3399cc"
//     }
// };
// var rzp1 = new Razorpay(options);
// document.getElementById('rzp-button1').onclick = function(e){
//     rzp1.open();
//     e.preventDefault();
// }
// </script>
// `;
