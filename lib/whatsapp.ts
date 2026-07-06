import twilio from 'twilio';

let client: any = null;


function getTwilioClient() {
  if (!client) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken || !accountSid.startsWith('AC')) {
      return null;
    }
    client = twilio(accountSid, authToken);
  }
  return client;
}

export async function sendWhatsAppNotification(to: string, message: string) {
  const twilioClient = getTwilioClient();
  if (!twilioClient) {
    console.warn('Skipping WhatsApp notification: Twilio is not configured or credentials are invalid.');
    return;
  }

  const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;
  try {
    await twilioClient.messages.create({
      body: message,
      from: fromWhatsApp,
      to: `whatsapp:${to}`,
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}