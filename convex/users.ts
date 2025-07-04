import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";

// Create user profile after signup
export const createUserProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      return existingProfile._id;
    }

    // Create new profile
    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      profileCompleted: false,
      setupCompleted: false,
      createdAt: Date.now(),
      isActive: true,
    });

    // Send welcome email to the new user (don't let email failure block user creation)
    try {
      await ctx.scheduler.runAfter(0, internal.emails.sendWelcomeEmail, {
        userEmail: args.email,
        userName: args.firstName,
      });
    } catch (error) {
      // Log email error but don't fail user creation
      console.error("Failed to schedule welcome email:", error);
    }

    return profileId;
  },
});

// Update user profile with professional details
export const updateUserProfile = mutation({
  args: {
    phoneNumber: v.string(),
    aphraRegistrationNumber: v.string(),
    healthcareProfessionalType: v.union(
      v.literal("pharmacist"),
      v.literal("general_practitioner"), 
      v.literal("nurse"),
      v.literal("administration"),
      v.literal("aged_care_worker"),
      v.literal("specialist"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("User profile not found");
    }

    await ctx.db.patch(profile._id, {
      phoneNumber: args.phoneNumber,
      aphraRegistrationNumber: args.aphraRegistrationNumber,
      healthcareProfessionalType: args.healthcareProfessionalType,
      profileCompleted: true,
    });

    return profile._id;
  },
});

// Get current user's profile
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();
  },
});

// Check if user has completed setup
export const getSetupStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return { needsSetup: true, hasProfile: false, needsProfileCompletion: false };
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile) {
      return { needsSetup: true, hasProfile: false, needsProfileCompletion: false };
    }

    return {
      needsSetup: !profile.setupCompleted,
      hasProfile: true,
      needsProfileCompletion: !profile.profileCompleted,
      hasOrganization: !!profile.organizationId,
    };
  },
});

// Generate secure access token for organization
function generateAccessToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Format as XXX-XXX-XXX-XXX for readability
  return result.match(/.{1,3}/g)?.join('-') || result;
}

// Generate secure invitation token (different format)
function generateInviteToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Format as XXXX-XXXX-XXXX-XXXX for invites
  return result.match(/.{1,4}/g)?.join('-') || result;
}

// Generate partnership token (different format)
function generatePartnershipToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Format as XXXXX-XXXXX-XXXXX-XXXXX for partnerships
  return result.match(/.{1,5}/g)?.join('-') || result;
}

// Create organization with detailed information
export const createOrganization = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("pharmacy"),
      v.literal("gp_clinic"),
      v.literal("hospital"),
      v.literal("aged_care")
    ),
    contactPersonName: v.string(),
    phoneNumber: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    streetAddress: v.string(),
    suburb: v.string(),
    state: v.string(),
    postcode: v.string(),
    abn: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("User profile not found");
    }

    if (profile.organizationId) {
      throw new Error("User already belongs to an organization");
    }

    // Generate unique access token
    let accessToken: string;
    let existing;
    do {
      accessToken = generateAccessToken();
      existing = await ctx.db
        .query("organizations")
        .withIndex("by_access_token", q => q.eq("accessToken", accessToken))
        .first();
    } while (existing);

    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      type: args.type,
      contactPersonName: args.contactPersonName,
      phoneNumber: args.phoneNumber,
      email: args.email,
      website: args.website,
      streetAddress: args.streetAddress,
      suburb: args.suburb,
      state: args.state,
      postcode: args.postcode,
      country: "Australia",
      abn: args.abn,
      accessToken,
      ownerId: profile._id,
      createdAt: Date.now(),
      isActive: true,
    });

    // Update user profile
    await ctx.db.patch(profile._id, {
      organizationId: orgId,
      role: "owner",
      setupCompleted: true,
    });

    return { organizationId: orgId, accessToken };
  },
});

// Update organization details
export const updateOrganization = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("pharmacy"),
      v.literal("gp_clinic"),
      v.literal("hospital"),
      v.literal("aged_care")
    ),
    contactPersonName: v.string(),
    phoneNumber: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    streetAddress: v.string(),
    suburb: v.string(),
    state: v.string(),
    postcode: v.string(),
    abn: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile || !profile.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Check if user has permission to update (owner or admin)
    if (profile.role !== "owner" && profile.role !== "admin") {
      throw new Error("Insufficient permissions to update organization");
    }

    await ctx.db.patch(profile.organizationId, {
      name: args.name,
      type: args.type,
      contactPersonName: args.contactPersonName,
      phoneNumber: args.phoneNumber,
      email: args.email,
      website: args.website,
      streetAddress: args.streetAddress,
      suburb: args.suburb,
      state: args.state,
      postcode: args.postcode,
      abn: args.abn,
    });

    return profile.organizationId;
  },
});

// Get organization details
export const getOrganization = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile) {
      return null;
    }

    const orgId = profile.organizationId;
    if (!orgId) {
      return null;
    }

    return await ctx.db.get(orgId);
  },
});

// Get organization members
export const getOrganizationMembers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile || !profile.organizationId) {
      return [];
    }

    return await ctx.db
      .query("userProfiles")
      .withIndex("by_organization", q => q.eq("organizationId", profile.organizationId!))
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Create member invitation
export const createMemberInvitation = mutation({
  args: {
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile || !profile.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Check if user has permission to invite (owner or admin)
    if (profile.role !== "owner" && profile.role !== "admin") {
      throw new Error("Insufficient permissions to invite members");
    }

    // Check if user is already a member
    const existingMember = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (existingMember && existingMember.organizationId === profile.organizationId) {
      throw new Error("User is already a member of this organization");
    }

    // Generate unique invite token
    let inviteToken: string;
    let existing;
    do {
      inviteToken = generateInviteToken();
      existing = await ctx.db
        .query("memberInvitations")
        .withIndex("by_invite_token", q => q.eq("inviteToken", inviteToken))
        .first();
    } while (existing);

    // Create invitation (expires in 7 days)
    const invitationId = await ctx.db.insert("memberInvitations", {
      organizationId: profile.organizationId!,
      invitedBy: profile._id,
      inviteToken,
      email: args.email,
      role: args.role,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      isUsed: false,
      createdAt: Date.now(),
      isActive: true,
    });

    return { invitationId, inviteToken };
  },
});

// Get pending invitations
export const getPendingInvitations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile || !profile.organizationId) {
      return [];
    }

    return await ctx.db
      .query("memberInvitations")
      .withIndex("by_organization", q => q.eq("organizationId", profile.organizationId!))
      .filter(q => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("isUsed"), false),
          q.gt(q.field("expiresAt"), Date.now())
        )
      )
      .collect();
  },
});

// Update member role
export const updateMemberRole = mutation({
  args: {
    memberId: v.id("userProfiles"),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile || !profile.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Check if user has permission (owner or admin)
    if (profile.role !== "owner" && profile.role !== "admin") {
      throw new Error("Insufficient permissions to update member roles");
    }

    const member = await ctx.db.get(args.memberId);
    if (!member || member.organizationId !== profile.organizationId!) {
      throw new Error("Member not found in organization");
    }

    // Prevent demoting the owner
    if (member.role === "owner") {
      throw new Error("Cannot change owner role");
    }

    await ctx.db.patch(args.memberId, {
      role: args.role,
    });

    return args.memberId;
  },
});

// Remove member from organization
export const removeMember = mutation({
  args: {
    memberId: v.id("userProfiles"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile || !profile.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Check if user has permission (owner or admin)
    if (profile.role !== "owner" && profile.role !== "admin") {
      throw new Error("Insufficient permissions to remove members");
    }

    const member = await ctx.db.get(args.memberId);
    if (!member || member.organizationId !== profile.organizationId!) {
      throw new Error("Member not found in organization");
    }

    // Prevent removing the owner
    if (member.role === "owner") {
      throw new Error("Cannot remove organization owner");
    }

    await ctx.db.patch(args.memberId, {
      organizationId: undefined,
      role: undefined,
    });

    return args.memberId;
  },
});

// Create organization partnership
export const createPartnership = mutation({
  args: {
    partnershipType: v.union(
      v.literal("data_sharing"),
      v.literal("referral_network"),
      v.literal("merger")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile || !profile.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Check if user has permission (owner or admin)
    if (profile.role !== "owner" && profile.role !== "admin") {
      throw new Error("Insufficient permissions to create partnerships");
    }

    // Generate unique partnership token
    let partnershipToken: string;
    let existing;
    do {
      partnershipToken = generatePartnershipToken();
      existing = await ctx.db
        .query("organizationPartnerships")
        .withIndex("by_partnership_token", q => q.eq("partnershipToken", partnershipToken))
        .first();
    } while (existing);

    // Create partnership (expires in 30 days)
    const partnershipId = await ctx.db.insert("organizationPartnerships", {
      initiatorOrgId: profile.organizationId!,
      partnershipToken,
      partnershipType: args.partnershipType,
      status: "pending",
      initiatedBy: profile._id,
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: Date.now(),
      isActive: true,
      notes: args.notes,
    });

    return { partnershipId, partnershipToken };
  },
});

// Search organization by access token
export const findOrganizationByToken = query({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_access_token", q => q.eq("accessToken", args.accessToken.toUpperCase()))
      .first();

    if (!organization || !organization.isActive) {
      return null;
    }

    return {
      _id: organization._id,
      name: organization.name,
      type: organization.type,
      contactPersonName: organization.contactPersonName,
    };
  },
});

// Join organization
export const joinOrganization = mutation({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("User profile not found");
    }

    if (profile.organizationId) {
      throw new Error("User already belongs to an organization");
    }

    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_access_token", q => q.eq("accessToken", args.accessToken.toUpperCase()))
      .first();

    if (!organization || !organization.isActive) {
      throw new Error("Invalid access token or organization not found");
    }

    // Update user profile
    await ctx.db.patch(profile._id, {
      organizationId: organization._id,
      role: "member",
      setupCompleted: true,
    });

    return { organizationId: organization._id };
  },
});

// Invite user to organization
export const inviteUserToOrganization = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile || !profile.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Check if user has permission (owner or admin)
    if (profile.role !== "owner" && profile.role !== "admin") {
      throw new Error("Insufficient permissions to invite members");
    }

    // Check if user is already a member
    const existingMember = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (existingMember && existingMember.organizationId) {
      throw new Error("User is already a member of an organization");
    }

    // Check if there's already a pending invitation
    const existingInvitation = await ctx.db
      .query("memberInvitations")
      .withIndex("by_email", q => q.eq("email", args.email))
      .filter(q => q.eq(q.field("organizationId"), profile.organizationId))
      .filter(q => q.eq(q.field("isUsed"), false))
      .first();

    if (existingInvitation && existingInvitation.expiresAt > Date.now()) {
      throw new Error("An invitation has already been sent to this email");
    }

    // Get organization details
    const organization = await ctx.db.get(profile.organizationId!);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Generate unique invitation token
    let inviteToken: string;
    let existing;
    do {
      inviteToken = generateInviteToken();
      existing = await ctx.db
        .query("memberInvitations")
        .withIndex("by_invite_token", q => q.eq("inviteToken", inviteToken))
        .first();
    } while (existing);

    // Create invitation (expires in 7 days)
    const invitationId = await ctx.db.insert("memberInvitations", {
      organizationId: profile.organizationId!,
      email: args.email,
      role: args.role,
      inviteToken,
      invitedBy: profile._id,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      isUsed: false,
      createdAt: Date.now(),
      isActive: true,
    });

    // Send invitation email
    try {
      await ctx.scheduler.runAfter(0, internal.emails.sendOrganizationInvite, {
        inviteEmail: args.email,
        organizationName: organization.name,
        inviterName: `${profile.firstName} ${profile.lastName}`,
        inviteToken,
      });
    } catch (error) {
      console.error("Failed to send invitation email:", error);
      // Don't fail the invitation creation if email fails
    }

    return { invitationId, inviteToken };
  },
});

// Accept organization invitation
export const acceptInvitation = mutation({
  args: {
    inviteToken: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("User profile not found");
    }

    if (profile.organizationId) {
      throw new Error("User already belongs to an organization");
    }

    // Find invitation
    const invitation = await ctx.db
      .query("memberInvitations")
      .withIndex("by_invite_token", q => q.eq("inviteToken", args.inviteToken))
      .first();

    if (!invitation) {
      throw new Error("Invalid invitation token");
    }

    if (invitation.isUsed) {
      throw new Error("Invitation has already been used");
    }

    if (invitation.expiresAt < Date.now()) {
      throw new Error("Invitation has expired");
    }

    if (invitation.email !== profile.email) {
      throw new Error("Invitation email does not match user email");
    }

    // Accept invitation
    await ctx.db.patch(profile._id, {
      organizationId: invitation.organizationId,
      role: invitation.role,
      setupCompleted: true,
    });

    // Mark invitation as used
    await ctx.db.patch(invitation._id, {
      isUsed: true,
      usedBy: profile._id,
      usedAt: Date.now(),
    });

    return { organizationId: invitation.organizationId };
  },
});

// Cancel/revoke invitation
export const cancelInvitation = mutation({
  args: {
    invitationId: v.id("memberInvitations"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!profile || !profile.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Check if user has permission (owner or admin)
    if (profile.role !== "owner" && profile.role !== "admin") {
      throw new Error("Insufficient permissions to cancel invitations");
    }

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation || invitation.organizationId !== profile.organizationId) {
      throw new Error("Invitation not found");
    }

    // Cancel invitation by marking as inactive
    await ctx.db.patch(args.invitationId, {
      isActive: false,
    });

    return args.invitationId;
  },
}); 