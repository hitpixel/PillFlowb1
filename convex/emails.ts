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
    const joinUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/setup?invite=${args.inviteToken}`;
    
    const emailId = await resend.sendEmail(
      ctx,
      "PillFlow <noreply@pillflow.com.au>",
      args.inviteEmail,
      `You've been invited to join ${args.organizationName} on PillFlow`,
      `
        <h1>You've been invited to join ${args.organizationName}</h1>
        <p>${args.inviterName} has invited you to join their organization on PillFlow.</p>
        <p>PillFlow is a healthcare medication management platform designed for medical professionals.</p>
        <p>
          <a href="${joinUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${joinUrl}">${joinUrl}</a></p>
        <p>This invitation will expire in 7 days.</p>
        <p>Best regards,<br>The PillFlow Team</p>
      `,
      `You've been invited to join ${args.organizationName}

${args.inviterName} has invited you to join their organization on PillFlow.

PillFlow is a healthcare medication management platform designed for medical professionals.

Accept your invitation by visiting: ${joinUrl}

This invitation will expire in 7 days.

Best regards,
The PillFlow Team`
    );
    
    console.log("Organization invite email queued:", emailId);
    return emailId;
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