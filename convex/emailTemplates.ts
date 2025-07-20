// Email template utility functions that generate HTML strings directly
// These are compatible with the Convex runtime environment

export function generateWelcomeEmailHTML(userName: string): string {
  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000000; background-color: #F9F9F9; margin: 0; padding: 0;">
      <div style="max-width: 480px; margin: 0 auto; padding: 70px 24px;">
        <div style="background-color: #FFFFFF; border: 1px solid #CECECE; border-radius: 20px; padding: 50px 40px 40px 40px; text-align: center;">
          <div style="font-family: Inter, sans-serif; font-size: 24px; font-weight: 700; color: #000000; margin-bottom: 40px; letter-spacing: -0.02em;">
            PillFlow
          </div>

          <h1 style="font-size: 32px; font-weight: 600; color: #000000; margin: 0 0 17px 0; letter-spacing: -1.2px; line-height: 1.2;">
            Welcome to PillFlow, ${userName}
          </h1>

          <p style="font-size: 16px; color: #000000; margin: 0 0 40px 0; line-height: 1.5; font-weight: 500;">
            Thank you for joining our healthcare medication management platform. We're excited to help you streamline your workflow.
          </p>

          <div style="background-color: #F9F9F9; border-radius: 12px; padding: 40px; margin-bottom: 40px; text-align: left;">
            <h2 style="font-size: 20px; font-weight: 600; color: #000000; margin: 0 0 24px 0;">
              Getting Started
            </h2>
            
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 24px; height: 24px; background-color: #000000; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; flex-shrink: 0;">1</div>
                <div>
                  <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">Complete your profile</p>
                  <p style="margin: 4px 0 0 0; font-size: 16px; color: #000000; font-weight: 500;">Add your professional details to unlock all features</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 24px; height: 24px; background-color: #000000; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; flex-shrink: 0;">2</div>
                <div>
                  <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">Set up your organization</p>
                  <p style="margin: 4px 0 0 0; font-size: 16px; color: #000000; font-weight: 500;">Configure your team and workspace settings</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 24px; height: 24px; background-color: #000000; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; flex-shrink: 0;">3</div>
                <div>
                  <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">Invite your team</p>
                  <p style="margin: 4px 0 0 0; font-size: 16px; color: #000000; font-weight: 500;">Start collaborating with colleagues</p>
                </div>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 40px;">
            <a href="https://pillflow.app" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 700; padding: 16px 32px; border-radius: 8px; text-decoration: none; letter-spacing: -0.5px; min-width: 154px;">
              Get Started
            </a>
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
  `;
}

export function generateOrganizationInviteEmailHTML({
  organizationName,
  inviterName,
  inviteToken,
  joinUrl
}: {
  organizationName: string;
  inviterName: string;
  inviteToken: string;
  joinUrl: string;
}): string {
  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000000; background-color: #F9F9F9; margin: 0; padding: 0;">
      <div style="max-width: 480px; margin: 0 auto; padding: 70px 24px;">
        <div style="background-color: #FFFFFF; border: 1px solid #CECECE; border-radius: 20px; padding: 50px 40px 40px 40px; text-align: center;">
          <div style="font-family: Inter, sans-serif; font-size: 24px; font-weight: 700; color: #000000; margin-bottom: 40px; letter-spacing: -0.02em;">
            PillFlow
          </div>

          <h1 style="font-size: 32px; font-weight: 600; color: #000000; margin: 0 0 17px 0; letter-spacing: -1.2px; line-height: 1.2;">
            You're invited to join ${organizationName}
          </h1>

          <p style="font-size: 16px; color: #000000; margin: 0 0 40px 0; line-height: 1.5; font-weight: 500;">
            ${inviterName} has invited you to join their organization on PillFlow, a healthcare medication management platform.
          </p>

          <div style="margin-bottom: 40px;">
            <a href="${joinUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 700; padding: 16px 32px; border-radius: 8px; text-decoration: none; letter-spacing: -0.5px; min-width: 154px;">
              Accept Invitation
            </a>
          </div>

          <div style="background-color: #F9F9F9; border-radius: 12px; padding: 40px; margin-bottom: 40px; text-align: left;">
            <h2 style="font-size: 20px; font-weight: 600; color: #000000; margin: 0 0 24px 0;">
              How to join
            </h2>
            
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">Existing users</p>
                <p style="margin: 4px 0 0 0; font-size: 16px; color: #000000; font-weight: 500;">Sign in and you'll automatically join the organization</p>
              </div>
              
              <div>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">New users</p>
                <p style="margin: 4px 0 0 0; font-size: 16px; color: #000000; font-weight: 500;">Create your account and you'll be added to the organization immediately</p>
              </div>
            </div>
          </div>

          <div style="background-color: #F9F9F9; border-radius: 8px; padding: 24px; margin-bottom: 40px; text-align: left;">
            <p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0 0 8px 0;">
              Your invitation code:
            </p>
            <code style="font-family: monospace; font-size: 14px; color: #000000; background-color: #FFFFFF; padding: 8px 12px; border-radius: 4px; border: 1px solid #E5E5E5; display: block; text-align: center; letter-spacing: 0.05em;">
              ${inviteToken}
            </code>
          </div>

          <div style="margin-bottom: 40px;">
            <p style="font-size: 16px; color: #000000; margin: 0 0 16px 0; font-weight: 500;">
              Or copy and paste this link:
            </p>
            <div style="background-color: #F5F5F5; padding: 16px; border-radius: 8px; font-size: 14px; color: #000000; word-break: break-all; font-family: monospace; text-align: left;">
              <a href="${joinUrl}" style="color: #000000; text-decoration: none;">
                ${joinUrl}
              </a>
            </div>
          </div>

          <div style="background-color: #FFF3CD; border: 1px solid #FFEAA7; border-radius: 8px; padding: 20px; margin-bottom: 40px; text-align: left;">
            <p style="font-size: 16px; color: #000000; margin: 0; line-height: 1.5; font-weight: 500;">
              <strong>Important:</strong> This invitation expires in 7 days. Please accept it soon to join the team!
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
  `;
}

export function generatePasswordResetEmailHTML(resetUrl: string): string {
  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000000; background-color: #F9F9F9; margin: 0; padding: 0;">
      <div style="max-width: 480px; margin: 0 auto; padding: 70px 24px;">
        <div style="background-color: #FFFFFF; border: 1px solid #CECECE; border-radius: 20px; padding: 50px 40px 40px 40px; text-align: center;">
          <div style="font-family: Inter, sans-serif; font-size: 24px; font-weight: 700; color: #000000; margin-bottom: 40px; letter-spacing: -0.02em;">
            PillFlow
          </div>

          <h1 style="font-size: 32px; font-weight: 600; color: #000000; margin: 0 0 17px 0; letter-spacing: -1.2px; line-height: 1.2;">
            Reset your password
          </h1>

          <p style="font-size: 16px; color: #000000; margin: 0 0 40px 0; line-height: 1.5; font-weight: 500;">
            You requested a password reset for your PillFlow account. Click the button below to create a new password.
          </p>

          <div style="margin-bottom: 40px;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 700; padding: 16px 32px; border-radius: 8px; text-decoration: none; letter-spacing: -0.5px; min-width: 154px;">
              Reset Password
            </a>
          </div>

          <div style="margin-bottom: 40px;">
            <p style="font-size: 16px; color: #000000; margin: 0 0 16px 0; font-weight: 500;">
              Or copy and paste this link:
            </p>
            <div style="background-color: #F5F5F5; padding: 16px; border-radius: 8px; font-size: 14px; color: #000000; word-break: break-all; font-family: monospace; text-align: left;">
              <a href="${resetUrl}" style="color: #000000; text-decoration: none;">
                ${resetUrl}
              </a>
            </div>
          </div>

          <div style="background-color: #FFF3CD; border: 1px solid #FFEAA7; border-radius: 8px; padding: 20px; margin-bottom: 40px; text-align: left;">
            <p style="font-size: 14px; color: #000000; margin: 0; line-height: 1.5; font-weight: 500;">
              <strong>Important:</strong> This link expires in 1 hour. If you didn't request this reset, you can safely ignore this email.
            </p>
          </div>

          <div style="border-top: 1px solid #E5E5E5; padding-top: 30px; margin-top: 40px;">
            <p style="font-size: 14px; color: #000000; margin: 0; line-height: 1.5; font-weight: 500;">
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
  `;
}

export function generateTestEmailHTML({
  timestamp,
  siteUrl,
  hasResendKey
}: {
  timestamp?: string;
  siteUrl?: string;
  hasResendKey?: boolean;
}): string {
  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000000; background-color: #F9F9F9; margin: 0; padding: 0;">
      <div style="max-width: 480px; margin: 0 auto; padding: 70px 24px;">
        <div style="background-color: #FFFFFF; border: 1px solid #CECECE; border-radius: 20px; padding: 50px 40px 40px 40px; text-align: center;">
          <div style="font-family: Inter, sans-serif; font-size: 24px; font-weight: 700; color: #000000; margin-bottom: 40px; letter-spacing: -0.02em;">
            PillFlow
          </div>

          <h1 style="font-size: 32px; font-weight: 600; color: #000000; margin: 0 0 17px 0; letter-spacing: -1.2px; line-height: 1.2;">
            Email Test Successful! ✅
          </h1>

          <p style="font-size: 16px; color: #000000; margin: 0 0 20px 0; line-height: 1.5; font-weight: 500;">
            This is a test email from PillFlow to verify that email sending is working correctly.
          </p>

          <p style="font-size: 16px; color: #000000; margin: 0 0 40px 0; line-height: 1.5; font-weight: 500;">
            If you received this email, then:
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; text-align: left;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #10b981; font-size: 16px;">✅</span>
              <span style="font-size: 16px; color: #000000; font-weight: 500;">Resend API is configured correctly</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #10b981; font-size: 16px;">✅</span>
              <span style="font-size: 16px; color: #000000; font-weight: 500;">Email sending functionality is working</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #10b981; font-size: 16px;">✅</span>
              <span style="font-size: 16px; color: #000000; font-weight: 500;">Your email domain is verified</span>
            </div>
          </div>
          
          ${(timestamp || siteUrl || hasResendKey !== undefined) ? `
            <div style="background-color: #F9F9F9; border-radius: 12px; padding: 40px; margin-bottom: 40px; text-align: left;">
              <h2 style="font-size: 20px; font-weight: 600; color: #000000; margin: 0 0 24px 0;">
                Configuration Details:
              </h2>
              ${siteUrl ? `<p style="margin: 8px 0; font-size: 16px; color: #000000; font-weight: 500;"><strong>Site URL:</strong> ${siteUrl}</p>` : ''}
              ${hasResendKey !== undefined ? `<p style="margin: 8px 0; font-size: 16px; color: #000000; font-weight: 500;"><strong>Resend API Key:</strong> ${hasResendKey ? "✅ Configured" : "❌ Not Set"}</p>` : ''}
              ${timestamp ? `<p style="margin: 8px 0; font-size: 16px; color: #000000; font-weight: 500;"><strong>Time sent:</strong> ${timestamp}</p>` : ''}
            </div>
          ` : ''}
          
          <div style="border-top: 1px solid #E5E5E5; padding-top: 30px; margin-top: 40px;">
            <p style="font-size: 16px; color: #000000; margin: 0; line-height: 1.5; font-weight: 500;">
              Best regards,<br />
              The PillFlow Team
            </p>
            <p style="font-size: 12px; color: #666666; margin: 16px 0 0 0; font-weight: 500;">
              This is a test email from PillFlow. You can safely ignore this message.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function generateTestInvitationEmailHTML({
  joinUrl,
  timestamp
}: {
  joinUrl: string;
  timestamp?: string;
}): string {
  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000000; background-color: #F9F9F9; margin: 0; padding: 0;">
      <div style="max-width: 480px; margin: 0 auto; padding: 70px 24px;">
        <div style="background-color: #FFFFFF; border: 1px solid #CECECE; border-radius: 20px; padding: 50px 40px 40px 40px; text-align: center;">
          <div style="font-family: Inter, sans-serif; font-size: 24px; font-weight: 700; color: #000000; margin-bottom: 40px; letter-spacing: -0.02em;">
            PillFlow
          </div>

          <h1 style="font-size: 32px; font-weight: 600; color: #000000; margin: 0 0 17px 0; letter-spacing: -1.2px; line-height: 1.2;">
            Test Invitation Email ✅
          </h1>

          <p style="font-size: 16px; color: #000000; margin: 0 0 20px 0; line-height: 1.5; font-weight: 500;">
            This is a test invitation email to verify that the invitation system is working correctly.
          </p>

          <p style="font-size: 16px; color: #000000; margin: 0 0 40px 0; line-height: 1.5; font-weight: 500;">
            In a real invitation, you would be joining an organization on PillFlow.
          </p>

          <div style="background-color: #F9F9F9; border-radius: 12px; padding: 40px; margin-bottom: 40px; text-align: left;">
            <h2 style="font-size: 20px; font-weight: 600; color: #000000; margin: 0 0 24px 0;">
              How it works:
            </h2>
            <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #000000;">Existing users</p>
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #000000; font-weight: 500;">Sign in and you'll automatically join the organization.</p>
            <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #000000;">New users</p>
            <p style="margin: 0; font-size: 16px; color: #000000; font-weight: 500;">Create your account and you'll be added to the organization immediately.</p>
          </div>

          <div style="margin-bottom: 40px;">
            <a href="${joinUrl}" style="display: inline-block; background-color: #6b7280; color: #ffffff; font-size: 16px; font-weight: 700; padding: 16px 32px; border-radius: 8px; text-decoration: none; letter-spacing: -0.5px; min-width: 154px;">
              Test Invitation Link
            </a>
          </div>

          <div style="margin-bottom: 40px;">
            <p style="font-size: 16px; color: #000000; margin: 0 0 16px 0; font-weight: 500;">
              Test URL:
            </p>
            <div style="background-color: #F5F5F5; padding: 16px; border-radius: 8px; font-size: 14px; color: #000000; word-break: break-all; font-family: monospace; text-align: left;">
              <a href="${joinUrl}" style="color: #000000; text-decoration: none;">
                ${joinUrl}
              </a>
            </div>
          </div>

          <div style="background-color: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 40px;">
            <p style="font-size: 16px; color: #065f46; margin: 0; line-height: 1.5; font-weight: 500;">
              <strong>✅ If you received this email, the invitation system is working correctly!</strong>
            </p>
          </div>

          ${timestamp ? `<p style="font-size: 14px; color: #666666; margin: 0 0 40px 0; font-weight: 500;">Time sent: ${timestamp}</p>` : ''}

          <div style="border-top: 1px solid #E5E5E5; padding-top: 30px; margin-top: 40px;">
            <p style="font-size: 16px; color: #000000; margin: 0; line-height: 1.5; font-weight: 500;">
              Best regards,<br />
              The PillFlow Team
            </p>
            <p style="font-size: 12px; color: #666666; margin: 16px 0 0 0; font-weight: 500;">
              This is a test email from PillFlow. You can safely ignore this message.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function generateOTPEmailHTML({
  userName,
  otp,
}: {
  userName: string;
  otp: string;
}): string {
  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000000; background-color: #F9F9F9; margin: 0; padding: 0;">
      <div style="max-width: 480px; margin: 0 auto; padding: 70px 24px;">
        <div style="background-color: #FFFFFF; border: 1px solid #CECECE; border-radius: 20px; padding: 50px 40px 40px 40px; text-align: center;">
          <div style="font-family: Inter, sans-serif; font-size: 24px; font-weight: 700; color: #000000; margin-bottom: 40px; letter-spacing: -0.02em;">
            PillFlow
          </div>

          <h1 style="font-size: 32px; font-weight: 600; color: #000000; margin: 0 0 17px 0; letter-spacing: -1.2px; line-height: 1.2;">
            Email Verification Code
          </h1>

          <p style="font-size: 16px; color: #000000; margin: 0 0 20px 0; line-height: 1.5; font-weight: 500;">
            Hi ${userName || 'there'},
          </p>

          <p style="font-size: 16px; color: #000000; margin: 0 0 40px 0; line-height: 1.5; font-weight: 500;">
            Please use the following verification code to complete your PillFlow account setup:
          </p>

          <div style="background-color: #F8FAFC; border: 2px solid #000000; border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000000; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>

          <div style="background-color: #FFF3CD; border: 1px solid #FFEAA7; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404; font-size: 16px; font-weight: 600;">
              ⏰ Important:
            </h3>
            <p style="margin: 10px 0; font-size: 14px; color: #000000; font-weight: 500;">
              • This code will expire in <strong>10 minutes</strong>
            </p>
            <p style="margin: 10px 0; font-size: 14px; color: #000000; font-weight: 500;">
              • Enter this code exactly as shown (6 digits)
            </p>
            <p style="margin: 10px 0; font-size: 14px; color: #000000; font-weight: 500;">
              • If you didn't request this code, you can safely ignore this email
            </p>
          </div>

          <p style="font-size: 16px; color: #000000; margin: 0 0 20px 0; line-height: 1.5; font-weight: 500;">
            Once verified, you'll be able to complete your account setup and start using PillFlow.
          </p>

          <p style="font-size: 16px; color: #000000; margin: 0 0 40px 0; line-height: 1.5; font-weight: 500;">
            If you're having trouble, you can request a new verification code from the signup page.
          </p>

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
  `;
}

export function generatePatientAccessGrantEmailHTML({
  patientName,
  grantedByName,
  grantedByOrganization,
  permissions,
  expiresAt,
  accessUrl,
}: {
  patientName: string;
  grantedByName: string;
  grantedByOrganization: string;
  permissions: string[];
  expiresAt?: string;
  accessUrl: string;
}): string {
  const permissionLabels = {
    view: "View patient details",
    comment: "Add comments and notes",
    view_medications: "View medication list",
  };

  const permissionList = permissions.map(p => permissionLabels[p as keyof typeof permissionLabels] || p);

  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000000; background-color: #F9F9F9; margin: 0; padding: 0;">
      <div style="max-width: 480px; margin: 0 auto; padding: 70px 24px;">
        <div style="background-color: #FFFFFF; border: 1px solid #CECECE; border-radius: 20px; padding: 50px 40px 40px 40px; text-align: center;">
          <div style="font-family: Inter, sans-serif; font-size: 24px; font-weight: 700; color: #000000; margin-bottom: 40px; letter-spacing: -0.02em;">
            PillFlow
          </div>

          <h1 style="font-size: 32px; font-weight: 600; color: #000000; margin: 0 0 17px 0; letter-spacing: -1.2px; line-height: 1.2;">
            Patient Access Granted
          </h1>

          <p style="font-size: 16px; color: #000000; margin: 0 0 40px 0; line-height: 1.5; font-weight: 500;">
            ${grantedByName} from ${grantedByOrganization} has granted you access to patient ${patientName}.
          </p>

          <div style="background-color: #F9F9F9; border-radius: 12px; padding: 40px; margin-bottom: 40px; text-align: left;">
            <h2 style="font-size: 20px; font-weight: 600; color: #000000; margin: 0 0 24px 0;">
              Your Access Permissions
            </h2>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${permissionList.map(permission => `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: #10b981; font-size: 16px;">✅</span>
                  <span style="font-size: 16px; color: #000000; font-weight: 500;">${permission}</span>
                </div>
              `).join('')}
            </div>
            
            ${expiresAt ? `
              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #E5E5E5;">
                <p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0 0 8px 0;">
                  Access expires:
                </p>
                <p style="font-size: 16px; color: #000000; font-weight: 500;">
                  ${expiresAt}
                </p>
              </div>
            ` : `
              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #E5E5E5;">
                <p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0 0 8px 0;">
                  Access duration:
                </p>
                <p style="font-size: 16px; color: #000000; font-weight: 500;">
                  No expiration
                </p>
              </div>
            `}
          </div>

          <div style="background-color: #FFF3CD; border: 1px solid #FFEAA7; border-radius: 8px; padding: 20px; margin-bottom: 40px; text-align: left;">
            <h3 style="margin-top: 0; color: #856404; font-size: 16px; font-weight: 600;">
              🔒 Important Security Notice:
            </h3>
            <p style="margin: 10px 0; font-size: 14px; color: #000000; font-weight: 500;">
              • This access is granted for healthcare collaboration purposes only
            </p>
            <p style="margin: 10px 0; font-size: 14px; color: #000000; font-weight: 500;">
              • All actions are logged for audit purposes
            </p>
            <p style="margin: 10px 0; font-size: 14px; color: #000000; font-weight: 500;">
              • You can request medication changes, but they require approval
            </p>
          </div>

          <div style="margin-bottom: 40px;">
            <a href="${accessUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 700; padding: 16px 32px; border-radius: 8px; text-decoration: none; letter-spacing: -0.5px; min-width: 154px;">
              View Patient
            </a>
          </div>

          <div style="margin-bottom: 40px;">
            <p style="font-size: 16px; color: #000000; margin: 0 0 16px 0; font-weight: 500;">
              Or copy and paste this link:
            </p>
            <div style="background-color: #F5F5F5; padding: 16px; border-radius: 8px; font-size: 14px; color: #000000; word-break: break-all; font-family: monospace; text-align: left;">
              <a href="${accessUrl}" style="color: #000000; text-decoration: none;">
                ${accessUrl}
              </a>
            </div>
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
  `;
}