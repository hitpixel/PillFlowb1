import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// TOKEN ACCESS MANAGEMENT

// Grant access to a patient's data
export const grantTokenAccess = mutation({
  args: {
    patientId: v.id("patients"),
    grantedToUserId: v.id("userProfiles"),
    permissions: v.array(v.union(
      v.literal("view"),
      v.literal("comment"),
      v.literal("view_medications")
    )),
    expiresInDays: v.optional(v.number()), // null means never expires
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) throw new Error("User profile not found");

    // Get patient and verify ownership
    const patient = await ctx.db.get(args.patientId);
    if (!patient) throw new Error("Patient not found");

    if (patient.organizationId !== userProfile.organizationId) {
      throw new Error("Unauthorized: Patient not in your organization");
    }

    // Get the user being granted access
    const grantedToUser = await ctx.db.get(args.grantedToUserId);
    if (!grantedToUser) throw new Error("User to grant access not found");

    // Calculate expiry date
    const expiresAt = args.expiresInDays 
      ? Date.now() + (args.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    // Check if access already exists and is active
    const existingAccess = await ctx.db
      .query("tokenAccessGrants")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("grantedTo"), args.grantedToUserId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existingAccess) {
      // Update existing access
      await ctx.db.patch(existingAccess._id, {
        permissions: args.permissions,
        expiresAt,
        grantedBy: userProfile._id,
        grantedAt: Date.now(),
      });
      return existingAccess._id;
    }

    // Create new access grant
    const accessType = patient.organizationId === grantedToUser.organizationId 
      ? "same_organization" 
      : "cross_organization";

    return await ctx.db.insert("tokenAccessGrants", {
      patientId: args.patientId,
      shareToken: patient.shareToken,
      grantedTo: args.grantedToUserId,
      grantedToOrg: grantedToUser.organizationId!,
      grantedBy: userProfile._id,
      grantedByOrg: userProfile.organizationId!,
      accessType,
      permissions: args.permissions,
      expiresAt,
      isActive: true,
      grantedAt: Date.now(),
    });
  },
});

// Revoke access to a patient's data
export const revokeTokenAccess = mutation({
  args: {
    accessGrantId: v.id("tokenAccessGrants"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) throw new Error("User profile not found");

    const accessGrant = await ctx.db.get(args.accessGrantId);
    if (!accessGrant) throw new Error("Access grant not found");

    // Verify user has permission to revoke (must be from same org as patient)
    const patient = await ctx.db.get(accessGrant.patientId);
    if (!patient) throw new Error("Patient not found");

    if (patient.organizationId !== userProfile.organizationId) {
      throw new Error("Unauthorized: Cannot revoke access for this patient");
    }

    await ctx.db.patch(args.accessGrantId, {
      isActive: false,
      revokedAt: Date.now(),
      revokedBy: userProfile._id,
    });
  },
});

// Get all access grants for a patient
export const getPatientAccessGrants = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) throw new Error("User profile not found");

    // Get patient and verify access
    const patient = await ctx.db.get(args.patientId);
    if (!patient) throw new Error("Patient not found");

    if (patient.organizationId !== userProfile.organizationId) {
      throw new Error("Unauthorized: Patient not in your organization");
    }

    const accessGrants = await ctx.db
      .query("tokenAccessGrants")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Enrich with user and organization details
    const enrichedGrants = await Promise.all(
      accessGrants.map(async (grant) => {
        const grantedToUser = await ctx.db.get(grant.grantedTo);
        const grantedToOrg = await ctx.db.get(grant.grantedToOrg);
        const grantedByUser = await ctx.db.get(grant.grantedBy);

        return {
          ...grant,
          grantedToUser: grantedToUser ? {
            firstName: grantedToUser.firstName,
            lastName: grantedToUser.lastName,
            email: grantedToUser.email,
          } : null,
          grantedToOrg: grantedToOrg ? {
            name: grantedToOrg.name,
            type: grantedToOrg.type,
          } : null,
          grantedByUser: grantedByUser ? {
            firstName: grantedByUser.firstName,
            lastName: grantedByUser.lastName,
          } : null,
        };
      })
    );

    return enrichedGrants;
  },
});

// MEDICATION MANAGEMENT

// Add medication to a patient
export const addPatientMedication = mutation({
  args: {
    patientId: v.id("patients"),
    medicationName: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    instructions: v.optional(v.string()),
    prescribedBy: v.optional(v.string()),
    prescribedDate: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) throw new Error("User profile not found");

    // Get patient and verify access
    const patient = await ctx.db.get(args.patientId);
    if (!patient) throw new Error("Patient not found");

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, args.patientId, userProfile._id);
    if (!hasAccess) {
      throw new Error("Unauthorized: No access to this patient");
    }

    return await ctx.db.insert("patientMedications", {
      patientId: args.patientId,
      organizationId: userProfile.organizationId!,
      medicationName: args.medicationName,
      dosage: args.dosage,
      frequency: args.frequency,
      instructions: args.instructions,
      prescribedBy: args.prescribedBy,
      prescribedDate: args.prescribedDate,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
      addedBy: userProfile._id,
      addedAt: Date.now(),
    });
  },
});

// Update medication
export const updatePatientMedication = mutation({
  args: {
    medicationId: v.id("patientMedications"),
    medicationName: v.optional(v.string()),
    dosage: v.optional(v.string()),
    frequency: v.optional(v.string()),
    instructions: v.optional(v.string()),
    prescribedBy: v.optional(v.string()),
    prescribedDate: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) throw new Error("User profile not found");

    const medication = await ctx.db.get(args.medicationId);
    if (!medication) throw new Error("Medication not found");

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, medication.patientId, userProfile._id);
    if (!hasAccess) {
      throw new Error("Unauthorized: No access to this patient");
    }

    const updates: any = {
      updatedBy: userProfile._id,
      updatedAt: Date.now(),
    };

    if (args.medicationName !== undefined) updates.medicationName = args.medicationName;
    if (args.dosage !== undefined) updates.dosage = args.dosage;
    if (args.frequency !== undefined) updates.frequency = args.frequency;
    if (args.instructions !== undefined) updates.instructions = args.instructions;
    if (args.prescribedBy !== undefined) updates.prescribedBy = args.prescribedBy;
    if (args.prescribedDate !== undefined) updates.prescribedDate = args.prescribedDate;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.medicationId, updates);
  },
});

// Get patient medications
export const getPatientMedications = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) throw new Error("User profile not found");

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, args.patientId, userProfile._id);
    if (!hasAccess) {
      throw new Error("Unauthorized: No access to this patient");
    }

    const medications = await ctx.db
      .query("patientMedications")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Enrich with user and organization details
    const enrichedMedications = await Promise.all(
      medications.map(async (medication) => {
        const addedByUser = await ctx.db.get(medication.addedBy);
        const organization = await ctx.db.get(medication.organizationId);

        return {
          ...medication,
          addedByUser: addedByUser ? {
            firstName: addedByUser.firstName,
            lastName: addedByUser.lastName,
          } : null,
          organization: organization ? {
            name: organization.name,
            type: organization.type,
          } : null,
        };
      })
    );

    return enrichedMedications;
  },
});

// COMMENT MANAGEMENT

// Add comment to a patient
export const addPatientComment = mutation({
  args: {
    patientId: v.id("patients"),
    content: v.string(),
    commentType: v.union(
      v.literal("note"),
      v.literal("chat"),
      v.literal("system")
    ),
    isPrivate: v.boolean(),
    replyToId: v.optional(v.id("patientComments")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) throw new Error("User profile not found");

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, args.patientId, userProfile._id);
    if (!hasAccess) {
      throw new Error("Unauthorized: No access to this patient");
    }

    return await ctx.db.insert("patientComments", {
      patientId: args.patientId,
      authorId: userProfile._id,
      authorOrg: userProfile.organizationId!,
      content: args.content,
      commentType: args.commentType,
      isPrivate: args.isPrivate,
      replyToId: args.replyToId,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

// Get patient comments
export const getPatientComments = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) throw new Error("User profile not found");

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, args.patientId, userProfile._id);
    if (!hasAccess) {
      throw new Error("Unauthorized: No access to this patient");
    }

    const comments = await ctx.db
      .query("patientComments")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    // Filter out private comments if user is from different org
    const patient = await ctx.db.get(args.patientId);
    const filteredComments = comments.filter(comment => {
      if (!comment.isPrivate) return true;
      return comment.authorOrg === userProfile.organizationId;
    });

    // Enrich with author details
    const enrichedComments = await Promise.all(
      filteredComments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        const authorOrg = await ctx.db.get(comment.authorOrg);

        return {
          ...comment,
          author: author ? {
            firstName: author.firstName,
            lastName: author.lastName,
          } : null,
          authorOrg: authorOrg ? {
            name: authorOrg.name,
            type: authorOrg.type,
          } : null,
        };
      })
    );

    return enrichedComments;
  },
});

// HELPER FUNCTIONS

// Check if user has access to a patient
async function checkPatientAccess(ctx: any, patientId: any, userProfileId: any) {
  const patient = await ctx.db.get(patientId);
  if (!patient) return false;

  const userProfile = await ctx.db.get(userProfileId);
  if (!userProfile) return false;

  // Same organization always has access
  if (patient.organizationId === userProfile.organizationId) {
    return true;
  }

  // Check if user has been granted access via token
  const accessGrant = await ctx.db
    .query("tokenAccessGrants")
    .withIndex("by_patient", (q: any) => q.eq("patientId", patientId))
    .filter((q: any) => q.eq(q.field("grantedTo"), userProfileId))
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .first();

  if (!accessGrant) return false;

  // Check if access has expired
  if (accessGrant.expiresAt && accessGrant.expiresAt < Date.now()) {
    // Automatically revoke expired access
    await ctx.db.patch(accessGrant._id, {
      isActive: false,
      revokedAt: Date.now(),
    });
    return false;
  }

  return true;
} 