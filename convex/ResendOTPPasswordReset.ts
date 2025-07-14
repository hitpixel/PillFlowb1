import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { alphabet, generateRandomString } from "oslo/crypto";

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "PillFlow <onboarding@pillflow.com.au>",
      to: [email],
      subject: `Reset your password in PillFlow`,
      text: `Your password reset code is ${token}`,
      html: `
        <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000000; background-color: #F9F9F9; margin: 0; padding: 0;">
          <div style="max-width: 480px; margin: 0 auto; padding: 70px 24px;">
            <div style="background-color: #FFFFFF; border: 1px solid #CECECE; border-radius: 20px; padding: 50px 40px 40px 40px; text-align: center;">
              <div style="font-family: Inter, sans-serif; font-size: 24px; font-weight: 700; color: #000000; margin-bottom: 40px; letter-spacing: -0.02em;">
                PillFlow
              </div>

              <h1 style="font-size: 32px; font-weight: 600; color: #000000; margin: 0 0 17px 0; letter-spacing: -1.2px; line-height: 1.2;">
                Reset your PillFlow password
              </h1>

              <p style="font-size: 16px; color: #000000; margin: 0 0 40px 0; line-height: 1.5; font-weight: 500;">
                You requested a password reset for your PillFlow account.
              </p>

              <div style="background-color: #F8FAFC; border: 2px solid #000000; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 16px 0; font-size: 16px; color: #000000; font-weight: 500;">Your password reset code is:</p>
                <div style="font-size: 32px; font-weight: bold; color: #000000; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                  ${token}
                </div>
              </div>

              <div style="background-color: #FFF3CD; border: 1px solid #FFEAA7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #000000; font-size: 14px; font-weight: 500; line-height: 1.5;">
                  <strong>⏰ Important:</strong> This code will expire in 10 minutes.
                  If you didn't request this reset, you can safely ignore this email.
                </p>
              </div>

              <div style="border-top: 1px solid #E5E5E5; padding-top: 30px; margin-top: 40px;">
                <p style="font-size: 16px; color: #000000; margin: 0; line-height: 1.5; font-weight: 500;">
                  Best regards,<br />
                  The PillFlow Team
                </p>
                <p style="font-size: 12px; color: #666666; margin: 16px 0 0 0; font-weight: 500;">
                  This email was sent from PillFlow
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      throw new Error("Could not send password reset email");
    }
  },
});