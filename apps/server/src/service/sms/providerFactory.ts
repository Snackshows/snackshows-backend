import { TwilioProvider } from "./twilioProvider";
import { MSG91Provider } from "./msg91Provider";
import { SMSProvider } from "./index";

export const getSMSProvider = (): SMSProvider => {
  switch (process.env.SMS_PROVIDER) {
    case "TWILIO":
      return new TwilioProvider();
    case "MSG91":
      return new MSG91Provider();
    default:
      throw new Error("Unsupported SMS provider");
  }
};
