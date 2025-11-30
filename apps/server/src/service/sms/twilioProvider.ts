import twilio from "twilio";
import { SMSProvider } from "./index";

export class TwilioProvider implements SMSProvider {
  private client;
  private from;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
    this.from = process.env.TWILIO_PHONE_NUMBER!;
  }

  async send(to: string, message: string) {
    return await this.client.messages.create({
      from: this.from,
      to,
      body: message,
    });
  }
}
