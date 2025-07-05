import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// TOKEN ACCESS MANAGEMENT

// Request access via share token (creates pending request)
export const requestTokenAccess = mutation({
  args: {
    shareToken: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) throw new Error("User profile not found");

    // Get patient by share token
    const patient = await ctx.db
      .query("patients")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .first();

    if (!patient) throw new Error("Invalid share token");

    // Check if access already exists
    const existingAccess = await ctx.db
      .query("tokenAccessGrants")
      .withIndex("by_patient", (q) => q.eq("patientId", patient._id))
      .filter((q) => q.eq(q.field("grantedTo"), userProfile._id))
      .filter((q) => q.neq(q.field("status"), "denied"))
      .first();

    if (existingAccess) {
      if (existingAccess.status === "approved" && existingAccess.isActive) {
        throw new Error("You already have active access to this patient");
      }
      if (existingAccess.status === "pending") {
        throw new Error("Your access request is already pending approval");
      }
    }

    const accessType = patient.organizationId === userProfile.organizationId 
      ? "same_organization" 
      : "cross_organization";

    // Create pending access request
    return await ctx.db.insert("tokenAccessGrants", {
      patientId: patient._id,
      shareToken: args.shareToken,
      grantedTo: userProfile._id,
      grantedToOrg: userProfile.organizationId!,
      grantedByOrg: patient.organizationId,
      accessType,
      status: accessType === "same_organization" ? "approved" : "pending",
      permissions: ["view", "comment", "view_medications"], // Default permissions
      isActive: accessType === "same_organization",
      requestedAt: Date.now(),
      grantedAt: accessType === "same_organization" ? Date.now() : undefined,
    });
  },
});

// Approve pending access request
export const approveTokenAccess = mutation({
  args: {
    accessGrantId: v.id("tokenAccessGrants"),
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

    const accessGrant = await ctx.db.get(args.accessGrantId);
    if (!accessGrant) throw new Error("Access grant not found");

    // Verify user has permission to approve (must be from same org as patient)
    if (accessGrant.grantedByOrg !== userProfile.organizationId) {
      throw new Error("Unauthorized: Cannot approve access for this patient");
    }

    if (accessGrant.status !== "pending") {
      throw new Error("Access request is not pending");
    }

    // Calculate expiry date
    const expiresAt = args.expiresInDays 
      ? Date.now() + (args.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    await ctx.db.patch(args.accessGrantId, {
      status: "approved",
      permissions: args.permissions,
      expiresAt,
      grantedBy: userProfile._id,
      grantedAt: Date.now(),
      isActive: true,
    });
  },
});

// Deny pending access request
export const denyTokenAccess = mutation({
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

    // Verify user has permission to deny (must be from same org as patient)
    if (accessGrant.grantedByOrg !== userProfile.organizationId) {
      throw new Error("Unauthorized: Cannot deny access for this patient");
    }

    if (accessGrant.status !== "pending") {
      throw new Error("Access request is not pending");
    }

    await ctx.db.patch(args.accessGrantId, {
      status: "denied",
      deniedBy: userProfile._id,
      deniedAt: Date.now(),
      isActive: false,
    });
  },
});

// Grant access to a patient's data (direct grant)
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
        status: "approved",
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
      status: "approved",
      permissions: args.permissions,
      expiresAt,
      isActive: true,
      requestedAt: Date.now(),
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
      status: "revoked",
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
      .collect();

    // Enrich with user and organization details
    const enrichedGrants = await Promise.all(
      accessGrants.map(async (grant) => {
        const grantedToUser = await ctx.db.get(grant.grantedTo);
        const grantedToOrg = await ctx.db.get(grant.grantedToOrg);
        const grantedByUser = grant.grantedBy ? await ctx.db.get(grant.grantedBy) : null;

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

// Add medication to a patient with FDA NDC support
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
    // FDA NDC fields
    fdaNdc: v.optional(v.string()),
    genericName: v.optional(v.string()),
    brandName: v.optional(v.string()),
    dosageForm: v.optional(v.string()),
    route: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    activeIngredient: v.optional(v.string()),
    strength: v.optional(v.string()),
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
      // FDA NDC fields
      fdaNdc: args.fdaNdc,
      genericName: args.genericName,
      brandName: args.brandName,
      dosageForm: args.dosageForm,
      route: args.route,
      manufacturer: args.manufacturer,
      activeIngredient: args.activeIngredient,
      strength: args.strength,
      isActive: true,
      addedBy: userProfile._id,
      addedAt: Date.now(),
    });
  },
});

// Update medication with FDA NDC support
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
    // FDA NDC fields
    fdaNdc: v.optional(v.string()),
    genericName: v.optional(v.string()),
    brandName: v.optional(v.string()),
    dosageForm: v.optional(v.string()),
    route: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    activeIngredient: v.optional(v.string()),
    strength: v.optional(v.string()),
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
    // FDA NDC fields
    if (args.fdaNdc !== undefined) updates.fdaNdc = args.fdaNdc;
    if (args.genericName !== undefined) updates.genericName = args.genericName;
    if (args.brandName !== undefined) updates.brandName = args.brandName;
    if (args.dosageForm !== undefined) updates.dosageForm = args.dosageForm;
    if (args.route !== undefined) updates.route = args.route;
    if (args.manufacturer !== undefined) updates.manufacturer = args.manufacturer;
    if (args.activeIngredient !== undefined) updates.activeIngredient = args.activeIngredient;
    if (args.strength !== undefined) updates.strength = args.strength;

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
    .filter((q: any) => q.eq(q.field("status"), "approved"))
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .first();

  if (!accessGrant) return false;

  // Check if access has expired
  if (accessGrant.expiresAt && accessGrant.expiresAt < Date.now()) {
    // Automatically revoke expired access
    await ctx.db.patch(accessGrant._id, {
      status: "revoked",
      isActive: false,
      revokedAt: Date.now(),
    });
    return false;
  }

  return true;
} 