import axios from "axios";
import { SMSProvider } from "./index";

export class MSG91Provider implements SMSProvider {
  async send(to: string, message: string) {
    return await axios.post(
      "https://api.msg91.com/api/v5/flow/",
      {
        template_id: process.env.MSG91_TEMPLATE!,
        sender: process.env.MSG91_SENDER!,
        short_url: "1",
        mobiles: to,
        VAR1: message,
      },
      {
        headers: { authkey: process.env.MSG91_AUTH_KEY! },
      }
    );
  }
}
