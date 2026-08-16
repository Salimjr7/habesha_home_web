// ============================================================================
// Habesha Home — Email & Notification Dispatcher Abstraction
// ============================================================================

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailService {
  sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }>;
}

export class ConsoleEmailService implements EmailService {
  async sendEmail(options: SendEmailOptions) {
    if (process.env.NODE_ENV !== "production") {
      console.log("==================== [HABESHA HOME EMAIL DISPATCH] ====================");
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`From: ${options.from || "Habesha Home <noreply@habeshahome.et>"}`);
      console.log("----------------------------------------------------------------------");
      console.log(options.text || options.html);
      console.log("======================================================================");
    }
    return { success: true, id: `mock-${Date.now()}` };
  }
}

export class ResendEmailService implements EmailService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.RESEND_API_KEY || "";
  }

  async sendEmail(options: SendEmailOptions) {
    if (!this.apiKey) {
      return new ConsoleEmailService().sendEmail(options);
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: options.from || "Habesha Home <notifications@habeshahome.et>",
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.message || "Failed to send email" };
      }
      return { success: true, id: json.id };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to dispatch email";
      return { success: false, error: message };
    }
  }
}

export function getEmailService(): EmailService {
  if (process.env.RESEND_API_KEY) {
    return new ResendEmailService();
  }
  return new ConsoleEmailService();
}

/**
 * Template helpers for transactional emails
 */
export const EmailTemplates = {
  bookingConfirmed(renterName: string, propertyTitle: string, checkIn: string, checkOut: string, total: string) {
    return {
      subject: `Booking Confirmed: ${propertyTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #d97706; margin-top: 0;">Habesha Home Booking Confirmation</h2>
          <p>Selam <strong>${renterName}</strong>,</p>
          <p>Your stay at <strong>${propertyTitle}</strong> has been successfully confirmed!</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Check-in:</strong> ${checkIn}</p>
            <p style="margin: 4px 0;"><strong>Check-out:</strong> ${checkOut}</p>
            <p style="margin: 4px 0;"><strong>Total Paid:</strong> ${total}</p>
          </div>
          <p>You can message your host or view check-in details inside your Habesha Home account.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Melkam Gize (Have a wonderful stay) — The Habesha Home Team</p>
        </div>
      `,
    };
  },

  payoutProcessed(ownerName: string, amount: string, reference: string) {
    return {
      subject: `Payout Processed: ${amount}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #10b981; margin-top: 0;">Payout Transfer Successful</h2>
          <p>Selam <strong>${ownerName}</strong>,</p>
          <p>Your withdrawal of <strong>${amount}</strong> has been processed to your payout account.</p>
          <p><strong>Reference:</strong> ${reference}</p>
          <p>The funds should reflect in your account according to your bank or mobile money processing times.</p>
        </div>
      `,
    };
  },
};
