// Email template utility functions that generate HTML strings directly
// These are compatible with the Convex runtime environment

export function generateWelcomeEmailHTML(userName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0066cc; margin-bottom: 20px;">
          Welcome to PillFlow, ${userName}!
        </h1>
        
        <p style="margin-bottom: 20px;">
          Thank you for joining our healthcare medication management platform.
        </p>
        
        <p style="margin-bottom: 20px;">Get started by:</p>
        
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li style="margin-bottom: 10px;">Completing your professional profile</li>
          <li style="margin-bottom: 10px;">Setting up your organization</li>
          <li style="margin-bottom: 10px;">Inviting team members</li>
        </ul>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #334155;">
            Getting Started Tips:
          </h3>
          <p style="margin: 10px 0;">
            • Complete your professional profile to unlock all features
          </p>
          <p style="margin: 10px 0;">
            • Set up your organization details for better collaboration
          </p>
          <p style="margin: 10px 0;">
            • Invite team members to start working together
          </p>
        </div>
        
        <p style="margin-bottom: 20px;">
          If you have any questions, feel free to reach out to our support team.
        </p>
        
        <p style="margin-bottom: 20px;">
          Best regards,<br />
          The PillFlow Team
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">
            This email was sent from PillFlow, the healthcare medication management platform.
          </p>
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
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0066cc; margin-bottom: 20px;">
          You&apos;ve been invited to join ${organizationName}
        </h1>
        
        <p style="margin-bottom: 20px;">
          ${inviterName} has invited you to join their organization on PillFlow.
        </p>
        
        <p style="margin-bottom: 20px;">
          PillFlow is a healthcare medication management platform designed for medical professionals.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #334155;">
            Getting Started:
          </h3>
          <p style="margin-bottom: 10px;">
            <strong>If you already have an account:</strong> Sign in and you&apos;ll automatically join the organization.
          </p>
          <p style="margin-bottom: 0;">
            <strong>If you&apos;re new to PillFlow:</strong> Create your account and you&apos;ll be added to the organization immediately.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a 
            href="${joinUrl}"
            style="background-color: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;"
          >
            Accept Invitation & Join ${organizationName}
          </a>
        </div>
        
        <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">
            Your invitation token:
          </p>
          <code style="background-color: #e2e8f0; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 14px; display: block; text-align: center;">
            ${inviteToken}
          </code>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="margin-bottom: 10px; font-weight: bold;">
            Or copy and paste this link into your browser:
          </p>
          <div style="background-color: #f1f5f9; padding: 10px; border-radius: 4px; border: 1px solid #cbd5e1; word-break: break-all;">
            <a 
              href="${joinUrl}"
              style="color: #0066cc; text-decoration: underline; font-size: 14px;"
            >
              ${joinUrl}
            </a>
          </div>
        </div>
        
        <div style="background-color: #fef3cd; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>⏰ Important:</strong> This invitation will expire in 7 days. 
            Please accept it soon to join the team!
          </p>
        </div>
        
        <p style="margin-bottom: 20px;">
          Best regards,<br />
          The PillFlow Team
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">
            This invitation was sent from PillFlow. If you didn&apos;t expect this invitation, 
            you can safely ignore this email.
          </p>
        </div>
      </div>
    </div>
  `;
}

export function generatePasswordResetEmailHTML(resetUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0066cc; margin-bottom: 20px;">
          Reset your password
        </h1>
        
        <p style="margin-bottom: 20px;">
          You requested a password reset for your PillFlow account.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a 
            href="${resetUrl}"
            style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;"
          >
            Reset Password
          </a>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="margin-bottom: 10px; font-weight: bold;">
            Or copy and paste this link into your browser:
          </p>
          <div style="background-color: #f1f5f9; padding: 10px; border-radius: 4px; border: 1px solid #cbd5e1; word-break: break-all;">
            <a 
              href="${resetUrl}"
              style="color: #0066cc; text-decoration: underline; font-size: 14px;"
            >
              ${resetUrl}
            </a>
          </div>
        </div>
        
        <div style="background-color: #fef3cd; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>⏰ Important:</strong> This link will expire in 1 hour. 
            If you didn&apos;t request this reset, you can safely ignore this email.
          </p>
        </div>
        
        <p style="margin-bottom: 20px;">
          Best regards,<br />
          The PillFlow Team
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">
            This email was sent from PillFlow. If you didn&apos;t request a password reset, 
            please contact our support team.
          </p>
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
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0066cc; margin-bottom: 20px;">
          Email Test Successful! ✅
        </h1>
        
        <p style="margin-bottom: 20px;">
          This is a test email from PillFlow to verify that email sending is working correctly.
        </p>
        
        <p style="margin-bottom: 20px;">
          If you received this email, then:
        </p>
        
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li style="margin-bottom: 10px;">✅ Resend API is configured correctly</li>
          <li style="margin-bottom: 10px;">✅ Email sending functionality is working</li>
          <li style="margin-bottom: 10px;">✅ Your email domain is verified</li>
        </ul>
        
        ${(timestamp || siteUrl || hasResendKey !== undefined) ? `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #334155;">
              Configuration Details:
            </h3>
            ${siteUrl ? `<p style="margin: 10px 0;"><strong>Site URL:</strong> ${siteUrl}</p>` : ''}
            ${hasResendKey !== undefined ? `<p style="margin: 10px 0;"><strong>Resend API Key:</strong> ${hasResendKey ? "✅ Configured" : "❌ Not Set"}</p>` : ''}
            ${timestamp ? `<p style="margin: 10px 0;"><strong>Time sent:</strong> ${timestamp}</p>` : ''}
          </div>
        ` : ''}
        
        <p style="margin-bottom: 20px;">
          Best regards,<br />
          The PillFlow Team
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">
            This is a test email from PillFlow. You can safely ignore this message.
          </p>
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
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0066cc; margin-bottom: 20px;">
          Test Invitation Email ✅
        </h1>
        
        <p style="margin-bottom: 20px;">
          This is a test invitation email to verify that the invitation system is working correctly.
        </p>
        
        <p style="margin-bottom: 20px;">
          In a real invitation, you would be joining an organization on PillFlow.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #334155;">
            How it works:
          </h3>
          <p style="margin-bottom: 10px;">
            <strong>If you already have an account:</strong> Sign in and you&apos;ll automatically join the organization.
          </p>
          <p style="margin-bottom: 0;">
            <strong>If you&apos;re new to PillFlow:</strong> Create your account and you&apos;ll be added to the organization immediately.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a 
            href="${joinUrl}"
            style="background-color: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;"
          >
            Test Invitation Link (Non-functional)
          </a>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="margin-bottom: 10px; font-weight: bold;">
            Test URL:
          </p>
          <div style="background-color: #f1f5f9; padding: 10px; border-radius: 4px; border: 1px solid #cbd5e1; word-break: break-all;">
            <a 
              href="${joinUrl}"
              style="color: #0066cc; text-decoration: underline; font-size: 14px;"
            >
              ${joinUrl}
            </a>
          </div>
        </div>
        
        <div style="background-color: #d1fae5; border: 1px solid #10b981; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #065f46;">
            <strong>✅ If you received this email, the invitation system is working correctly!</strong>
          </p>
        </div>
        
        ${timestamp ? `<p style="margin-bottom: 20px; font-size: 14px; color: #64748b;">Time sent: ${timestamp}</p>` : ''}
        
        <p style="margin-bottom: 20px;">
          Best regards,<br />
          The PillFlow Team
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">
            This is a test email from PillFlow. You can safely ignore this message.
          </p>
        </div>
      </div>
    </div>
  `;
} 