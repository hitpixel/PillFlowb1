import { components, internal } from "./_generated/api";
import { Resend, vEmailId, vEmailEvent } from "@convex-dev/resend";
import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

export const resend: Resend = new Resend(components.resend, {
  testMode: false, // Production mode - emails will be sent to real addresses
  // onEmailEvent will be added after first deployment
});

// Handle email status events from webhook
export const handleEmailEvent = internalMutation({
  args: {
    id: vEmailId,
    event: vEmailEvent,
  },
  handler: async (ctx, args) => {
    console.log("Email event received:", args.id, args.event);
    // You can add custom logic here to track email deliverability
    // For example, update user records, retry failed emails, etc.
  },
});

// Send welcome email to new users
export const sendWelcomeEmail = internalMutation({
  args: {
    userEmail: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Sending welcome email to:", args.userEmail);
      
      const emailId = await resend.sendEmail(
        ctx,
        "PillFlow Onboarding <onboarding@pillflow.com.au>",
        args.userEmail,
        "Welcome to PillFlow!",
        `
          <h1>Welcome to PillFlow, ${args.userName}!</h1>
          <p>Thank you for joining our healthcare medication management platform.</p>
          <p>Get started by:</p>
          <ul>
            <li>Completing your professional profile</li>
            <li>Setting up your organization</li>
            <li>Inviting team members</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The PillFlow Team</p>
        `,
        `Welcome to PillFlow, ${args.userName}!
        
Thank you for joining our healthcare medication management platform.

Get started by:
- Completing your professional profile
- Setting up your organization  
- Inviting team members

If you have any questions, feel free to reach out to our support team.

Best regards,
The PillFlow Team`
      );
      
      console.log("Welcome email queued successfully:", emailId);
      return emailId;
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      // Don't throw - we don't want email failures to break user creation
      return null;
    }
  },
});

// Send organization invitation email
export const sendOrganizationInvite = internalMutation({
  args: {
    inviteEmail: v.string(),
    organizationName: v.string(),
    inviterName: v.string(),
    inviteToken: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Sending organization invite email to:", args.inviteEmail);
      
      const joinUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/signin?invite=${args.inviteToken}`;
      
      const emailId = await resend.sendEmail(
        ctx,
        "PillFlow <noreply@pillflow.com.au>",
        args.inviteEmail,
        `You've been invited to join ${args.organizationName} on PillFlow`,
        `
          <h1>You've been invited to join ${args.organizationName}</h1>
          <p>${args.inviterName} has invited you to join their organization on PillFlow.</p>
          <p>PillFlow is a healthcare medication management platform designed for medical professionals.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #334155;">Getting Started:</h3>
            <p style="margin-bottom: 10px;"><strong>If you already have an account:</strong> Sign in and you'll automatically join the organization.</p>
            <p style="margin-bottom: 0;"><strong>If you're new to PillFlow:</strong> Create your account and you'll be added to the organization immediately.</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${joinUrl}" style="background-color: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Accept Invitation & Join ${args.organizationName}
            </a>
          </p>
          
          <p><strong>Or copy and paste this link into your browser:</strong></p>
          <p style="background-color: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all;">
            <a href="${joinUrl}">${joinUrl}</a>
          </p>
          
          <div style="background-color: #fef3cd; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⏰ Important:</strong> This invitation will expire in 7 days. Please accept it soon to join the team!</p>
          </div>
          
          <p>Best regards,<br>The PillFlow Team</p>
        `,
        `You've been invited to join ${args.organizationName}

${args.inviterName} has invited you to join their organization on PillFlow.

PillFlow is a healthcare medication management platform designed for medical professionals.

GETTING STARTED:
- If you already have an account: Sign in and you'll automatically join the organization
- If you're new to PillFlow: Create your account and you'll be added to the organization immediately

Accept your invitation by visiting: ${joinUrl}

⏰ Important: This invitation will expire in 7 days. Please accept it soon to join the team!

Best regards,
The PillFlow Team`
      );
      
      console.log("Organization invite email queued successfully:", emailId);
      return emailId;
    } catch (error) {
      console.error("Failed to send organization invite email:", error);
      // Don't throw - we don't want email failures to break invitation creation
      return null;
    }
  },
});

// Send password reset email
export const sendPasswordResetEmail = mutation({
  args: {
    userEmail: v.string(),
    resetToken: v.string(),
  },
  handler: async (ctx, args) => {
    const resetUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/reset-password?token=${args.resetToken}`;
    
    const emailId = await resend.sendEmail(
      ctx,
      "PillFlow <noreply@pillflow.com.au>",
      args.userEmail,
      "Reset your PillFlow password",
      `
        <h1>Reset your password</h1>
        <p>You requested a password reset for your PillFlow account.</p>
        <p>
          <a href="${resetUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.</p>
        <p>Best regards,<br>The PillFlow Team</p>
      `,
      `Reset your password

You requested a password reset for your PillFlow account.

Reset your password by visiting: ${resetUrl}

This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.

Best regards,
The PillFlow Team`
    );
    
    console.log("Password reset email queued:", emailId);
    return emailId;
  },
});

// Test email sending function
export const sendTestEmail = mutation({
  args: {
    testEmail: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Sending test email to:", args.testEmail);
      
      const emailId = await resend.sendEmail(
        ctx,
        "PillFlow <noreply@pillflow.com.au>",
        args.testEmail,
        "PillFlow Email Test",
        `
          <h1>Email Test Successful! ✅</h1>
          <p>This is a test email from PillFlow to verify that email sending is working correctly.</p>
          <p>If you received this email, then:</p>
          <ul>
            <li>✅ Resend API is configured correctly</li>
            <li>✅ Email sending functionality is working</li>
            <li>✅ Your email domain is verified</li>
          </ul>
          <p>Time sent: ${new Date().toISOString()}</p>
          <p>Best regards,<br>The PillFlow Team</p>
        `,
        `Email Test Successful!

This is a test email from PillFlow to verify that email sending is working correctly.

If you received this email, then:
- Resend API is configured correctly
- Email sending functionality is working
- Your email domain is verified

Time sent: ${new Date().toISOString()}

Best regards,
The PillFlow Team`
      );
      
      console.log("Test email sent successfully:", emailId);
      return { success: true, emailId };
    } catch (error) {
      console.error("Failed to send test email:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
}); 

// Test invitation email sending function
export const sendTestInvitationEmail = mutation({
  args: {
    testEmail: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Sending test invitation email to:", args.testEmail);
      
      const testToken = "TEST-1234-5678-9012";
      const joinUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/signin?invite=${testToken}`;
      
      const emailId = await resend.sendEmail(
        ctx,
        "PillFlow <noreply@pillflow.com.au>",
        args.testEmail,
        "Test Invitation to PillFlow",
        `
          <h1>Test Invitation Email ✅</h1>
          <p>This is a test invitation email to verify that the invitation system is working correctly.</p>
          <p>In a real invitation, you would be joining an organization on PillFlow.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #334155;">How it works:</h3>
            <p style="margin-bottom: 10px;"><strong>If you already have an account:</strong> Sign in and you'll automatically join the organization.</p>
            <p style="margin-bottom: 0;"><strong>If you're new to PillFlow:</strong> Create your account and you'll be added to the organization immediately.</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${joinUrl}" style="background-color: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Test Invitation Link (Non-functional)
            </a>
          </p>
          
          <p><strong>Test URL:</strong></p>
          <p style="background-color: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all;">
            <a href="${joinUrl}">${joinUrl}</a>
          </p>
          
          <p><strong>✅ If you received this email, the invitation system is working correctly!</strong></p>
          
          <p>Time sent: ${new Date().toISOString()}</p>
          <p>Best regards,<br>The PillFlow Team</p>
        `,
        `Test Invitation Email

This is a test invitation email to verify that the invitation system is working correctly.

In a real invitation, you would be joining an organization on PillFlow.

HOW IT WORKS:
- If you already have an account: Sign in and you'll automatically join the organization
- If you're new to PillFlow: Create your account and you'll be added to the organization immediately

Test invitation link: ${joinUrl}

✅ If you received this email, the invitation system is working correctly!

Time sent: ${new Date().toISOString()}

Best regards,
The PillFlow Team`
      );
      
      console.log("Test invitation email sent successfully:", emailId);
      return { success: true, emailId };
    } catch (error) {
      console.error("Failed to send test invitation email:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
}); 