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
    // Timing fields instead of frequency
    morningDose: v.optional(v.string()),
    afternoonDose: v.optional(v.string()),
    eveningDose: v.optional(v.string()),
    nightDose: v.optional(v.string()),
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

    const medicationId = await ctx.db.insert("patientMedications", {
      patientId: args.patientId,
      organizationId: userProfile.organizationId!,
      medicationName: args.medicationName,
      dosage: args.dosage,
      // Timing fields instead of frequency
      morningDose: args.morningDose,
      afternoonDose: args.afternoonDose,
      eveningDose: args.eveningDose,
      nightDose: args.nightDose,
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

    // Log the medication addition
    await logMedicationChange(ctx, {
      patientId: args.patientId,
      medicationId,
      actionType: "added",
      medicationName: args.medicationName,
      performedBy: userProfile._id,
      performedByOrg: userProfile.organizationId!,
      currentDosage: args.dosage,
      currentMorningDose: args.morningDose,
      currentAfternoonDose: args.afternoonDose,
      currentEveningDose: args.eveningDose,
      currentNightDose: args.nightDose,
      currentInstructions: args.instructions,
    });

    // Add to communication log
    await ctx.db.insert("patientComments", {
      patientId: args.patientId,
      authorId: userProfile._id,
      authorOrg: userProfile.organizationId!,
      content: `Added medication: ${args.medicationName}${args.dosage ? ` (${args.dosage})` : ''}`,
      commentType: "system",
      isPrivate: false,
      isActive: true,
      createdAt: Date.now(),
    });

    return medicationId;
  },
});

// Update medication with FDA NDC support
export const updatePatientMedication = mutation({
  args: {
    medicationId: v.id("patientMedications"),
    medicationName: v.optional(v.string()),
    dosage: v.optional(v.string()),
    // Timing fields instead of frequency
    morningDose: v.optional(v.string()),
    afternoonDose: v.optional(v.string()),
    eveningDose: v.optional(v.string()),
    nightDose: v.optional(v.string()),
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
    // Timing fields instead of frequency
    if (args.morningDose !== undefined) updates.morningDose = args.morningDose;
    if (args.afternoonDose !== undefined) updates.afternoonDose = args.afternoonDose;
    if (args.eveningDose !== undefined) updates.eveningDose = args.eveningDose;
    if (args.nightDose !== undefined) updates.nightDose = args.nightDose;
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

    // Store previous state for logging
    const previousState = JSON.stringify({
      medicationName: medication.medicationName,
      dosage: medication.dosage,
      morningDose: medication.morningDose,
      afternoonDose: medication.afternoonDose,
      eveningDose: medication.eveningDose,
      nightDose: medication.nightDose,
      instructions: medication.instructions,
    });

    await ctx.db.patch(args.medicationId, updates);

    // Get updated medication for logging
    const updatedMedication = await ctx.db.get(args.medicationId);

    // Log the medication update
    await logMedicationChange(ctx, {
      patientId: medication.patientId,
      medicationId: args.medicationId,
      actionType: args.isActive === false ? "stopped" : "updated",
      medicationName: updatedMedication?.medicationName || medication.medicationName,
      performedBy: userProfile._id,
      performedByOrg: userProfile.organizationId!,
      currentDosage: updatedMedication?.dosage,
      currentMorningDose: updatedMedication?.morningDose,
      currentAfternoonDose: updatedMedication?.afternoonDose,
      currentEveningDose: updatedMedication?.eveningDose,
      currentNightDose: updatedMedication?.nightDose,
      currentInstructions: updatedMedication?.instructions,
      previousState,
    });

    // Add to communication log
    const action = args.isActive === false ? "stopped" : "updated";
    await ctx.db.insert("patientComments", {
      patientId: medication.patientId,
      authorId: userProfile._id,
      authorOrg: userProfile.organizationId!,
      content: `${action === "stopped" ? "Stopped" : "Updated"} medication: ${updatedMedication?.medicationName || medication.medicationName}`,
      commentType: "system",
      isPrivate: false,
      isActive: true,
      createdAt: Date.now(),
    });
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

    // Get pending addition requests
    const pendingAdditionRequests = await ctx.db
      .query("medicationChangeRequests")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.and(
        q.eq(q.field("requestType"), "add"),
        q.eq(q.field("status"), "pending")
      ))
      .collect();

    // Enrich existing medications with user, organization details, and pending requests
    const enrichedMedications = await Promise.all(
      medications.map(async (medication) => {
        const addedByUser = await ctx.db.get(medication.addedBy);
        const organization = await ctx.db.get(medication.organizationId);

        // Check for pending requests for this medication
        const pendingRequests = await ctx.db
          .query("medicationChangeRequests")
          .withIndex("by_medication", (q) => q.eq("medicationId", medication._id))
          .filter((q) => q.eq(q.field("status"), "pending"))
          .collect();

        // Get request details if any
        const pendingRequest = pendingRequests.length > 0 ? pendingRequests[0] : null;
        let requestDetails = null;

        if (pendingRequest) {
          const requestedByUser = await ctx.db.get(pendingRequest.requestedBy);
          const requestedByOrg = await ctx.db.get(pendingRequest.requestedByOrg);
          
          requestDetails = {
            requestId: pendingRequest._id,
            requestType: pendingRequest.requestType,
            requestedAt: pendingRequest.requestedAt,
            requestNotes: pendingRequest.requestNotes,
            requestedBy: requestedByUser ? {
              firstName: requestedByUser.firstName,
              lastName: requestedByUser.lastName,
            } : null,
            requestedByOrg: requestedByOrg ? {
              name: requestedByOrg.name,
              type: requestedByOrg.type,
            } : null,
            requestedChanges: pendingRequest.requestedChanges,
          };
        }

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
          pendingRequest: requestDetails,
          hasPendingRequest: pendingRequests.length > 0,
          isPendingAddition: false,
        };
      })
    );

    // Convert pending addition requests to medication-like objects
    const pendingAdditions = await Promise.all(
      pendingAdditionRequests.map(async (request) => {
        const requestedByUser = await ctx.db.get(request.requestedBy);
        const requestedByOrg = await ctx.db.get(request.requestedByOrg);
        
        return {
          _id: `pending_${request._id}`, // Use a prefixed ID to avoid conflicts
          patientId: request.patientId,
          organizationId: request.requestedByOrg,
          medicationName: request.requestedChanges.medicationName || "",
          dosage: request.requestedChanges.dosage || "",
          morningDose: request.requestedChanges.morningDose,
          afternoonDose: request.requestedChanges.afternoonDose,
          eveningDose: request.requestedChanges.eveningDose,
          nightDose: request.requestedChanges.nightDose,
          instructions: request.requestedChanges.instructions,
          prescribedBy: request.requestedChanges.prescribedBy,
          prescribedDate: request.requestedChanges.prescribedDate,
          startDate: request.requestedChanges.startDate,
          endDate: request.requestedChanges.endDate,
          fdaNdc: request.requestedChanges.fdaNdc,
          genericName: request.requestedChanges.genericName,
          brandName: request.requestedChanges.brandName,
          dosageForm: request.requestedChanges.dosageForm,
          route: request.requestedChanges.route,
          manufacturer: request.requestedChanges.manufacturer,
          activeIngredient: request.requestedChanges.activeIngredient,
          strength: request.requestedChanges.strength,
          isActive: true,
          addedBy: request.requestedBy,
          addedAt: request.requestedAt,
          addedByUser: requestedByUser ? {
            firstName: requestedByUser.firstName,
            lastName: requestedByUser.lastName,
          } : null,
          organization: requestedByOrg ? {
            name: requestedByOrg.name,
            type: requestedByOrg.type,
          } : null,
          pendingRequest: {
            requestId: request._id,
            requestType: "add",
            requestedAt: request.requestedAt,
            requestNotes: request.requestNotes,
            requestedBy: requestedByUser ? {
              firstName: requestedByUser.firstName,
              lastName: requestedByUser.lastName,
            } : null,
            requestedByOrg: requestedByOrg ? {
              name: requestedByOrg.name,
              type: requestedByOrg.type,
            } : null,
            requestedChanges: request.requestedChanges,
          },
          hasPendingRequest: true,
          isPendingAddition: true,
        };
      })
    );

    // Combine real medications and pending additions
    return [...enrichedMedications, ...pendingAdditions];
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
      .order("asc")
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

// Get patient medication logs
export const getPatientMedicationLogs = query({
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

    const logs = await ctx.db
      .query("medicationLogs")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    // Enrich with user and organization details
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const performedByUser = await ctx.db.get(log.performedBy);
        const performedByOrg = await ctx.db.get(log.performedByOrg);

        return {
          ...log,
          performedByUser: performedByUser ? {
            firstName: performedByUser.firstName,
            lastName: performedByUser.lastName,
          } : null,
          performedByOrg: performedByOrg ? {
            name: performedByOrg.name,
            type: performedByOrg.type,
          } : null,
        };
      })
    );

    return enrichedLogs;
  },
});

// Request medication change (for shared users)
export const requestMedicationChange = mutation({
  args: {
    medicationId: v.id("patientMedications"),
    requestType: v.union(v.literal("update"), v.literal("remove")),
    requestedChanges: v.optional(v.object({
      medicationName: v.optional(v.string()),
      dosage: v.optional(v.string()),
      morningDose: v.optional(v.string()),
      afternoonDose: v.optional(v.string()),
      eveningDose: v.optional(v.string()),
      nightDose: v.optional(v.string()),
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
    })),
    requestNotes: v.optional(v.string()),
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

    // Check if user is from a different organization (shared access)
    const isSharedAccess = userProfile.organizationId !== medication.organizationId;
    if (!isSharedAccess) {
      throw new Error("Only users from other organizations can request changes");
    }

    // Cancel any existing pending requests for this medication by this user
    const existingRequests = await ctx.db
      .query("medicationChangeRequests")
      .withIndex("by_medication", (q) => q.eq("medicationId", args.medicationId))
      .filter((q) => q.and(
        q.eq(q.field("requestedBy"), userProfile._id),
        q.eq(q.field("status"), "pending")
      ))
      .collect();

    for (const existingRequest of existingRequests) {
      await ctx.db.patch(existingRequest._id, { status: "canceled" });
      
      // Log the canceled request
      await logMedicationChange(ctx, {
        patientId: medication.patientId,
        medicationId: args.medicationId,
        actionType: "request_canceled",
        medicationName: medication.medicationName,
        performedBy: userProfile._id,
        performedByOrg: userProfile.organizationId!,
        status: "canceled",
      });
    }

    // Create original state for comparison
    const originalState = JSON.stringify({
      medicationName: medication.medicationName,
      dosage: medication.dosage,
      morningDose: medication.morningDose,
      afternoonDose: medication.afternoonDose,
      eveningDose: medication.eveningDose,
      nightDose: medication.nightDose,
      instructions: medication.instructions,
      prescribedBy: medication.prescribedBy,
      prescribedDate: medication.prescribedDate,
      startDate: medication.startDate,
      endDate: medication.endDate,
      fdaNdc: medication.fdaNdc,
      genericName: medication.genericName,
      brandName: medication.brandName,
      dosageForm: medication.dosageForm,
      route: medication.route,
      manufacturer: medication.manufacturer,
      activeIngredient: medication.activeIngredient,
      strength: medication.strength,
    });

    // Create the change request
    const requestId = await ctx.db.insert("medicationChangeRequests", {
      patientId: medication.patientId,
      medicationId: args.medicationId,
      requestType: args.requestType,
      requestedChanges: args.requestedChanges || {},
      requestNotes: args.requestNotes,
      requestedBy: userProfile._id,
      requestedByOrg: userProfile.organizationId!,
      requestedAt: Date.now(),
      status: "pending",
      originalState,
    });

    // Log the request
    const actionType = args.requestType === "remove" ? "removal_requested" : "change_requested";
    await logMedicationChange(ctx, {
      patientId: medication.patientId,
      medicationId: args.medicationId,
      actionType,
      medicationName: medication.medicationName,
      performedBy: userProfile._id,
      performedByOrg: userProfile.organizationId!,
      requestNotes: args.requestNotes,
      status: "pending",
    });

    // Add to communication log
    const requestTypeText = args.requestType === "remove" ? "removal" : "change";
    await ctx.db.insert("patientComments", {
      patientId: medication.patientId,
      authorId: userProfile._id,
      authorOrg: userProfile.organizationId!,
      content: `Requested ${requestTypeText} for medication: ${medication.medicationName}${args.requestNotes ? ` - ${args.requestNotes}` : ''}`,
      commentType: "system",
      isPrivate: false,
      isActive: true,
      createdAt: Date.now(),
    });

    return requestId;
  },
});

// Approve medication change request
export const approveMedicationRequest = mutation({
  args: {
    requestId: v.id("medicationChangeRequests"),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) throw new Error("User profile not found");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    // Check if user has access and is from the owning organization
    const hasAccess = await checkPatientAccess(ctx, request.patientId, userProfile._id);
    if (!hasAccess) {
      throw new Error("Unauthorized: No access to this patient");
    }

    // Get patient to check organization ownership
    const patient = await ctx.db.get(request.patientId);
    if (!patient) throw new Error("Patient not found");

    if (userProfile.organizationId !== patient.organizationId) {
      throw new Error("Only users from the owning organization can approve requests");
    }

    // Get medication if it's an update/remove request
    let medication = null;
    if (request.medicationId) {
      medication = await ctx.db.get(request.medicationId);
      if (!medication) throw new Error("Medication not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    // Apply the changes
    let medicationId = request.medicationId;
    let medicationName = medication?.medicationName || "";
    
    if (request.requestType === "add") {
      // Create new medication for addition requests
      const changes = request.requestedChanges;
      medicationId = await ctx.db.insert("patientMedications", {
        patientId: request.patientId,
        organizationId: userProfile.organizationId!,
        medicationName: changes.medicationName || "",
        dosage: changes.dosage || "",
        morningDose: changes.morningDose,
        afternoonDose: changes.afternoonDose,
        eveningDose: changes.eveningDose,
        nightDose: changes.nightDose,
        instructions: changes.instructions,
        prescribedBy: changes.prescribedBy,
        prescribedDate: changes.prescribedDate,
        startDate: changes.startDate,
        endDate: changes.endDate,
        fdaNdc: changes.fdaNdc,
        genericName: changes.genericName,
        brandName: changes.brandName,
        dosageForm: changes.dosageForm,
        route: changes.route,
        manufacturer: changes.manufacturer,
        activeIngredient: changes.activeIngredient,
        strength: changes.strength,
        isActive: true,
        addedBy: userProfile._id,
        addedAt: Date.now(),
      });
      medicationName = changes.medicationName || "";
    } else if (request.requestType === "update") {
      if (!medication || !request.medicationId) throw new Error("Invalid update request");
      
      const updates: any = {
        updatedBy: userProfile._id,
        updatedAt: Date.now(),
      };

      // Apply requested changes
      const changes = request.requestedChanges;
      if (changes.medicationName !== undefined) updates.medicationName = changes.medicationName;
      if (changes.dosage !== undefined) updates.dosage = changes.dosage;
      if (changes.morningDose !== undefined) updates.morningDose = changes.morningDose;
      if (changes.afternoonDose !== undefined) updates.afternoonDose = changes.afternoonDose;
      if (changes.eveningDose !== undefined) updates.eveningDose = changes.eveningDose;
      if (changes.nightDose !== undefined) updates.nightDose = changes.nightDose;
      if (changes.instructions !== undefined) updates.instructions = changes.instructions;
      if (changes.prescribedBy !== undefined) updates.prescribedBy = changes.prescribedBy;
      if (changes.prescribedDate !== undefined) updates.prescribedDate = changes.prescribedDate;
      if (changes.startDate !== undefined) updates.startDate = changes.startDate;
      if (changes.endDate !== undefined) updates.endDate = changes.endDate;
      if (changes.fdaNdc !== undefined) updates.fdaNdc = changes.fdaNdc;
      if (changes.genericName !== undefined) updates.genericName = changes.genericName;
      if (changes.brandName !== undefined) updates.brandName = changes.brandName;
      if (changes.dosageForm !== undefined) updates.dosageForm = changes.dosageForm;
      if (changes.route !== undefined) updates.route = changes.route;
      if (changes.manufacturer !== undefined) updates.manufacturer = changes.manufacturer;
      if (changes.activeIngredient !== undefined) updates.activeIngredient = changes.activeIngredient;
      if (changes.strength !== undefined) updates.strength = changes.strength;

      await ctx.db.patch(request.medicationId, updates);
    } else if (request.requestType === "remove") {
      if (!medication || !request.medicationId) throw new Error("Invalid remove request");
      
      // Mark medication as inactive
      await ctx.db.patch(request.medicationId, {
        isActive: false,
        updatedBy: userProfile._id,
        updatedAt: Date.now(),
      });
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "approved",
      reviewedBy: userProfile._id,
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes,
    });

    // Log the approval
    const actionType = request.requestType === "remove" ? "removal_approved" : 
                      request.requestType === "add" ? "addition_approved" : "change_approved";
    await logMedicationChange(ctx, {
      patientId: request.patientId,
      medicationId: medicationId,
      actionType,
      medicationName: medicationName,
      performedBy: userProfile._id,
      performedByOrg: userProfile.organizationId!,
      status: "approved",
    });

    // Add to communication log
    const requestTypeText = request.requestType === "remove" ? "removal" : 
                           request.requestType === "add" ? "addition" : "change";
    await ctx.db.insert("patientComments", {
      patientId: request.patientId,
      authorId: userProfile._id,
      authorOrg: userProfile.organizationId!,
      content: `Approved ${requestTypeText} for medication: ${medicationName}${args.reviewNotes ? ` - ${args.reviewNotes}` : ''}`,
      commentType: "system",
      isPrivate: false,
      isActive: true,
      createdAt: Date.now(),
    });

    return true;
  },
});

// Reject medication change request
export const rejectMedicationRequest = mutation({
  args: {
    requestId: v.id("medicationChangeRequests"),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) throw new Error("User profile not found");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    // Check if user has access and is from the owning organization
    const hasAccess = await checkPatientAccess(ctx, request.patientId, userProfile._id);
    if (!hasAccess) {
      throw new Error("Unauthorized: No access to this patient");
    }

    // Get patient to check organization ownership
    const patient = await ctx.db.get(request.patientId);
    if (!patient) throw new Error("Patient not found");

    if (userProfile.organizationId !== patient.organizationId) {
      throw new Error("Only users from the owning organization can reject requests");
    }

    // Get medication if it's an update/remove request
    let medication = null;
    let medicationName = "";
    if (request.medicationId) {
      medication = await ctx.db.get(request.medicationId);
      if (!medication) throw new Error("Medication not found");
      medicationName = medication.medicationName;
    } else if (request.requestType === "add") {
      medicationName = request.requestedChanges.medicationName || "";
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      reviewedBy: userProfile._id,
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes,
    });

    // Log the rejection
    const actionType = request.requestType === "remove" ? "removal_rejected" : 
                      request.requestType === "add" ? "addition_rejected" : "change_rejected";
    await logMedicationChange(ctx, {
      patientId: request.patientId,
      medicationId: request.medicationId || undefined,
      actionType,
      medicationName: medicationName,
      performedBy: userProfile._id,
      performedByOrg: userProfile.organizationId!,
      status: "rejected",
    });

    // Add to communication log
    const requestTypeText = request.requestType === "remove" ? "removal" : 
                           request.requestType === "add" ? "addition" : "change";
    await ctx.db.insert("patientComments", {
      patientId: request.patientId,
      authorId: userProfile._id,
      authorOrg: userProfile.organizationId!,
      content: `Rejected ${requestTypeText} for medication: ${medicationName}${args.reviewNotes ? ` - ${args.reviewNotes}` : ''}`,
      commentType: "system",
      isPrivate: false,
      isActive: true,
      createdAt: Date.now(),
    });

    return true;
  },
});


// Request medication addition (for shared users)
export const requestMedicationAddition = mutation({
  args: {
    patientId: v.id("patients"),
    medicationName: v.string(),
    dosage: v.string(),
    // Timing fields instead of frequency
    morningDose: v.optional(v.string()),
    afternoonDose: v.optional(v.string()),
    eveningDose: v.optional(v.string()),
    nightDose: v.optional(v.string()),
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
    requestNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) throw new Error("User profile not found");

    const patient = await ctx.db.get(args.patientId);
    if (!patient) throw new Error("Patient not found");

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, args.patientId, userProfile._id);
    if (!hasAccess) {
      throw new Error("Unauthorized: No access to this patient");
    }

    // Check if user is from a different organization (shared access)
    const isSharedAccess = userProfile.organizationId !== patient.organizationId;
    if (!isSharedAccess) {
      throw new Error("Only users from other organizations can request medication additions");
    }

    // Store the requested medication data
    const requestedMedication = {
      medicationName: args.medicationName,
      dosage: args.dosage,
      morningDose: args.morningDose,
      afternoonDose: args.afternoonDose,
      eveningDose: args.eveningDose,
      nightDose: args.nightDose,
      instructions: args.instructions,
      prescribedBy: args.prescribedBy,
      prescribedDate: args.prescribedDate,
      startDate: args.startDate,
      endDate: args.endDate,
      fdaNdc: args.fdaNdc,
      genericName: args.genericName,
      brandName: args.brandName,
      dosageForm: args.dosageForm,
      route: args.route,
      manufacturer: args.manufacturer,
      activeIngredient: args.activeIngredient,
      strength: args.strength,
    };

    // Create the addition request
    const requestId = await ctx.db.insert("medicationChangeRequests", {
      patientId: args.patientId,
      medicationId: undefined, // No existing medication ID for additions
      requestType: "add",
      requestedChanges: requestedMedication,
      requestNotes: args.requestNotes,
      requestedBy: userProfile._id,
      requestedByOrg: userProfile.organizationId!,
      requestedAt: Date.now(),
      status: "pending",
      originalState: undefined, // No original state for additions
    });

    // Log the request
    await logMedicationChange(ctx, {
      patientId: args.patientId,
      medicationId: undefined,
      actionType: "addition_requested",
      medicationName: args.medicationName,
      performedBy: userProfile._id,
      performedByOrg: userProfile.organizationId!,
      requestNotes: args.requestNotes,
      status: "pending",
      currentDosage: args.dosage,
      currentMorningDose: args.morningDose,
      currentAfternoonDose: args.afternoonDose,
      currentEveningDose: args.eveningDose,
      currentNightDose: args.nightDose,
      currentInstructions: args.instructions,
    });

    // Add to communication log
    await ctx.db.insert("patientComments", {
      patientId: args.patientId,
      authorId: userProfile._id,
      authorOrg: userProfile.organizationId!,
      content: `Requested addition of medication: ${args.medicationName}${args.requestNotes ? ` - ${args.requestNotes}` : ''}`,
      commentType: "system",
      isPrivate: false,
      isActive: true,
      createdAt: Date.now(),
    });

    return requestId;
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

// Helper function to log medication changes
async function logMedicationChange(ctx: any, params: {
  patientId: any;
  medicationId?: any;
  actionType: "added" | "updated" | "stopped" | "deleted" | "change_requested" | "change_approved" | "change_rejected" | "removal_requested" | "removal_approved" | "removal_rejected" | "request_canceled" | "addition_requested" | "addition_approved" | "addition_rejected";
  medicationName: string;
  performedBy: any;
  performedByOrg: any;
  currentDosage?: string;
  currentMorningDose?: string;
  currentAfternoonDose?: string;
  currentEveningDose?: string;
  currentNightDose?: string;
  currentInstructions?: string;
  changes?: string;
  previousState?: string;
  requestNotes?: string;
  status?: "completed" | "pending" | "approved" | "rejected" | "canceled";
}) {
  await ctx.db.insert("medicationLogs", {
    patientId: params.patientId,
    medicationId: params.medicationId || undefined,
    actionType: params.actionType,
    medicationName: params.medicationName,
    changes: params.changes,
    requestNotes: params.requestNotes,
    performedBy: params.performedBy,
    performedByOrg: params.performedByOrg,
    performedAt: Date.now(),
    currentDosage: params.currentDosage,
    currentMorningDose: params.currentMorningDose,
    currentAfternoonDose: params.currentAfternoonDose,
    currentEveningDose: params.currentEveningDose,
    currentNightDose: params.currentNightDose,
    currentInstructions: params.currentInstructions,
    previousState: params.previousState,
    status: params.status || "completed",
  });
} 