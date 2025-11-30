export interface SMSProvider {
  send(to: string, message: string): Promise<any>;
}
