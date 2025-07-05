import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate unique share token for patient data sharing
function generateShareToken(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `PAT-${result.substring(0, 4)}-${result.substring(4, 8)}-${result.substring(8, 12)}`;
}

// Create a new patient
export const createPatient = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    streetAddress: v.string(),
    suburb: v.string(),
    state: v.string(),
    postcode: v.string(),
    preferredPack: v.union(v.literal("blister"), v.literal("sachets")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      throw new Error("User must be part of an organization to create patients");
    }

    // Generate unique share token
    let shareToken = generateShareToken();
    
    // Ensure token is unique
    while (await ctx.db.query("patients").withIndex("by_share_token", (q) => q.eq("shareToken", shareToken)).first()) {
      shareToken = generateShareToken();
    }

    const now = Date.now();
    
    const patientId = await ctx.db.insert("patients", {
      shareToken,
      organizationId: userProfile.organizationId,
      firstName: args.firstName,
      lastName: args.lastName,
      dateOfBirth: args.dateOfBirth,
      email: args.email,
      phone: args.phone,
      streetAddress: args.streetAddress,
      suburb: args.suburb,
      state: args.state,
      postcode: args.postcode,
      preferredPack: args.preferredPack,
      createdBy: userProfile._id,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });

    return patientId;
  },
});

// Get all patients for the current user's organization AND patients they have access to via token grants
export const getPatients = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      throw new Error("User must be part of an organization to view patients");
    }

    // Get patients from user's organization
    const ownOrgPatients = await ctx.db
      .query("patients")
      .withIndex("by_organization", (q) => q.eq("organizationId", userProfile.organizationId!))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get patients user has been granted access to via token access
    const accessGrants = await ctx.db
      .query("tokenAccessGrants")
      .withIndex("by_grantee", (q) => q.eq("grantedTo", userProfile._id))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get shared patients (excluding expired access)
    const sharedPatients = await Promise.all(
      accessGrants.map(async (grant) => {
        // Check if access has expired (but don't auto-revoke in query)
        if (grant.expiresAt && grant.expiresAt < Date.now()) {
          return null;
        }

        const patient = await ctx.db.get(grant.patientId);
        if (!patient || !patient.isActive) {
          return null;
        }

        // Mark as shared patient
        return {
          ...patient,
          isShared: true,
          accessType: grant.accessType,
          permissions: grant.permissions,
        };
      })
    );

    // Filter out null values and combine with own org patients
    const validSharedPatients = sharedPatients.filter(p => p !== null);
    
    // Mark own org patients as not shared
    const ownOrgPatientsWithMeta = ownOrgPatients.map(patient => ({
      ...patient,
      isShared: false,
      accessType: "same_organization" as const,
      permissions: ["view", "edit", "comment", "view_medications"] as const,
    }));

    // Combine and deduplicate (in case user has access to patient from their own org)
    const allPatients = [...ownOrgPatientsWithMeta, ...validSharedPatients];
    const uniquePatients = allPatients.filter((patient, index, self) => 
      index === self.findIndex(p => p._id === patient._id)
    );

    // Sort by creation date, newest first
    uniquePatients.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      return uniquePatients.slice(args.offset || 0, (args.offset || 0) + args.limit);
    }
    
    return uniquePatients.slice(args.offset || 0);
  },
});

// Get a specific patient by ID - supports cross-organization access via token grants
export const getPatient = query({
  args: { id: v.id("patients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      throw new Error("User must be part of an organization to view patients");
    }

    const patient = await ctx.db.get(args.id);
    
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, args.id, userProfile._id);
    if (!hasAccess) {
      throw new Error("Access denied: No access to this patient");
    }

    // Get patient's organization for context
    const patientOrg = await ctx.db.get(patient.organizationId);
    const isSameOrganization = patient.organizationId === userProfile.organizationId;
    
    // Get access grant info if it's a shared patient
    let accessInfo = null;
    if (!isSameOrganization) {
      const accessGrant = await ctx.db
        .query("tokenAccessGrants")
        .withIndex("by_patient", (q) => q.eq("patientId", args.id))
        .filter((q) => q.eq(q.field("grantedTo"), userProfile._id))
        .filter((q) => q.eq(q.field("status"), "approved"))
        .filter((q) => q.eq(q.field("isActive"), true))
        .first();
      
      if (accessGrant) {
        accessInfo = {
          isShared: true,
          accessType: accessGrant.accessType,
          permissions: accessGrant.permissions,
          expiresAt: accessGrant.expiresAt,
        };
      }
    }

    return {
      ...patient,
      organizationName: patientOrg?.name,
      organizationType: patientOrg?.type,
      accessType: isSameOrganization ? "same_organization" : "cross_organization",
      isShared: !isSameOrganization,
      permissions: accessInfo?.permissions || (isSameOrganization ? ["view", "edit", "comment", "view_medications"] : ["view"]),
      expiresAt: accessInfo?.expiresAt,
    };
  },
});

// Helper function to check if user has access to a patient
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
    return false;
  }

  return true;
}

// Update a patient - supports cross-organization access via token grants with edit permissions
export const updatePatient = mutation({
  args: {
    id: v.id("patients"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    streetAddress: v.optional(v.string()),
    suburb: v.optional(v.string()),
    state: v.optional(v.string()),
    postcode: v.optional(v.string()),
    preferredPack: v.optional(v.union(v.literal("blister"), v.literal("sachets"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      throw new Error("User must be part of an organization to update patients");
    }

    const patient = await ctx.db.get(args.id);
    
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, args.id, userProfile._id);
    if (!hasAccess) {
      throw new Error("Access denied: No access to this patient");
    }

    // Check edit permissions for cross-organization access
    if (patient.organizationId !== userProfile.organizationId) {
      const accessGrant = await ctx.db
        .query("tokenAccessGrants")
        .withIndex("by_patient", (q: any) => q.eq("patientId", args.id))
        .filter((q: any) => q.eq(q.field("grantedTo"), userProfile._id))
        .filter((q: any) => q.eq(q.field("status"), "approved"))
        .filter((q: any) => q.eq(q.field("isActive"), true))
        .first();

      if (!accessGrant) {
        throw new Error("Access denied: No access grant found");
      }

      // Check if user has edit permissions (for now, give full access like owner)
      // In the future, you might want to restrict this based on accessGrant.permissions
      if (accessGrant.expiresAt && accessGrant.expiresAt < Date.now()) {
        throw new Error("Access denied: Access grant has expired");
      }
    }

    const { id, ...updateData } = args;
    const now = Date.now();

    // Only update fields that are provided
    const fieldsToUpdate = Object.entries(updateData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    await ctx.db.patch(args.id, {
      ...fieldsToUpdate,
      updatedAt: now,
    });

    return args.id;
  },
});

// Soft delete a patient - only allowed by patient's owning organization
export const deletePatient = mutation({
  args: { id: v.id("patients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      throw new Error("User must be part of an organization to delete patients");
    }

    const patient = await ctx.db.get(args.id);
    
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Only allow deletion by patient's owning organization for data integrity
    if (patient.organizationId !== userProfile.organizationId) {
      throw new Error("Access denied: Only the patient's owning organization can delete patient records");
    }

    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Search patients by name or email
export const searchPatients = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      throw new Error("User must be part of an organization to search patients");
    }

    const searchTerm = args.searchTerm.toLowerCase();
    const limit = args.limit || 50;

    const allPatients = await ctx.db
      .query("patients")
      .withIndex("by_organization", (q) => q.eq("organizationId", userProfile.organizationId!))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter by search term
    const filteredPatients = allPatients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const email = patient.email?.toLowerCase() || '';
      const shareToken = patient.shareToken.toLowerCase();
      
      return fullName.includes(searchTerm) || 
             email.includes(searchTerm) || 
             shareToken.includes(searchTerm);
    });

    return filteredPatients.slice(0, limit);
  },
});

// Get patient by share token (for data sharing between organizations)
export const getPatientByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      throw new Error("User must be part of an organization to access patients");
    }

    const patient = await ctx.db
      .query("patients")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .first();

    if (!patient || !patient.isActive) {
      throw new Error("Patient not found or inactive");
    }

    // Get patient's organization for context
    const patientOrg = await ctx.db.get(patient.organizationId);
    
    if (!patientOrg) {
      throw new Error("Patient's organization not found");
    }

    // Users from the same organization can access without share token
    // Users from different organizations need the share token
    const isSameOrganization = patient.organizationId === userProfile.organizationId;
    
    return {
      ...patient,
      organizationName: patientOrg.name,
      organizationType: patientOrg.type,
      accessType: isSameOrganization ? "same_organization" : "cross_organization",
    };
  },
});

// Get patient statistics for dashboard
export const getPatientStats = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      throw new Error("User must be part of an organization to view statistics");
    }

    const allPatients = await ctx.db
      .query("patients")
      .withIndex("by_organization", (q) => q.eq("organizationId", userProfile.organizationId!))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const totalPatients = allPatients.length;
    const blisterPreference = allPatients.filter(p => p.preferredPack === "blister").length;
    const sachetsPreference = allPatients.filter(p => p.preferredPack === "sachets").length;
    
    // Patients added this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const thisMonthTimestamp = thisMonth.getTime();
    
    const patientsThisMonth = allPatients.filter(p => p.createdAt >= thisMonthTimestamp).length;

    return {
      totalPatients,
      patientsThisMonth,
      packingPreferences: {
        blister: blisterPreference,
        sachets: sachetsPreference,
      },
    };
  },
});

// Log access to a patient via share token (for audit purposes)
export const logShareTokenAccess = mutation({
  args: {
    patientId: v.id("patients"),
    shareToken: v.string(),
    accessType: v.union(
      v.literal("same_organization"),
      v.literal("cross_organization")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      throw new Error("User must be part of an organization");
    }

    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Log the access
    await ctx.db.insert("shareTokenAccess", {
      patientId: args.patientId,
      accessedBy: userProfile._id,
      accessedByOrg: userProfile.organizationId,
      patientOrg: patient.organizationId,
      shareToken: args.shareToken,
      accessType: args.accessType,
      accessedAt: Date.now(),
    });

    return { success: true };
  },
});