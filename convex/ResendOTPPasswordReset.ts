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
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0066cc; margin-bottom: 20px;">Reset your PillFlow password</h1>
            
            <p style="margin-bottom: 20px;">You requested a password reset for your PillFlow account.</p>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-size: 16px;">Your password reset code is:</p>
              <div style="font-size: 24px; font-weight: bold; color: #0066cc; letter-spacing: 2px;">
                ${token}
              </div>
            </div>
            
            <div style="background-color: #fef3cd; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>⏰ Important:</strong> This code will expire in 10 minutes. 
                If you didn't request this reset, you can safely ignore this email.
              </p>
            </div>
            
            <p style="margin-bottom: 20px;">
              Best regards,<br />
              The PillFlow Team
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      throw new Error("Could not send password reset email");
    }
  },
});