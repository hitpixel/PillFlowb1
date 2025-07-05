import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Create a new Webster pack check
export const createWebsterPackCheck = mutation({
  args: {
    patientId: v.id("patients"),
    websterPackId: v.string(),
    packType: v.union(v.literal("blister"), v.literal("sachets")),
    checkStatus: v.union(
      v.literal("passed"),
      v.literal("failed"),
      v.literal("requires_review")
    ),
    notes: v.optional(v.string()),
    issues: v.optional(v.array(v.string())),
    medicationCount: v.optional(v.number()),
    packWeight: v.optional(v.number()),
    batchNumber: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
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

    // Get organization to verify it's a pharmacy
    const organization = await ctx.db.get(userProfile.organizationId);
    if (!organization || organization.type !== "pharmacy") {
      throw new Error("Webster pack checking is only available to pharmacy organizations");
    }

    // Get patient details
    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, args.patientId, userProfile._id);
    if (!hasAccess) {
      throw new Error("Access denied: You don't have permission to check packs for this patient");
    }

    const now = Date.now();

    // Create the Webster pack check record
    const checkId = await ctx.db.insert("websterPackChecks", {
      patientId: args.patientId,
      websterPackId: args.websterPackId,
      packType: args.packType,
      checkStatus: args.checkStatus,
      notes: args.notes,
      issues: args.issues,
      checkedBy: userProfile._id,
      checkedByOrg: userProfile.organizationId,
      checkedAt: now,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPreferredPack: patient.preferredPack,
      medicationCount: args.medicationCount,
      packWeight: args.packWeight,
      batchNumber: args.batchNumber,
      expiryDate: args.expiryDate,
      isActive: true,
    });

    // Log the check in patient comments if there are issues or failures
    if (args.checkStatus === "failed" || args.checkStatus === "requires_review" || (args.issues && args.issues.length > 0)) {
      const statusText = args.checkStatus === "failed" ? "failed quality check" : 
                        args.checkStatus === "requires_review" ? "requires review" : "has issues";
      
      let commentContent = `Webster pack ${args.websterPackId} ${statusText}`;
      if (args.issues && args.issues.length > 0) {
        commentContent += `\nIssues identified: ${args.issues.join(", ")}`;
      }
      if (args.notes) {
        commentContent += `\nNotes: ${args.notes}`;
      }

      await ctx.db.insert("patientComments", {
        patientId: args.patientId,
        authorId: userProfile._id,
        authorOrg: userProfile.organizationId,
        content: commentContent,
        commentType: "system",
        isPrivate: false, // Quality check info should be visible to all with access
        isActive: true,
        createdAt: now,
      });
    }

    return checkId;
  },
});

// Get Webster pack checks for a patient
export const getPatientWebsterChecks = query({
  args: {
    patientId: v.id("patients"),
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
      throw new Error("User must be part of an organization");
    }

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, args.patientId, userProfile._id);
    if (!hasAccess) {
      throw new Error("Access denied: You don't have permission to view pack checks for this patient");
    }

    // Get Webster checks for the patient
    const checks = await ctx.db
      .query("websterPackChecks")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .take(args.limit || 50);

    // Get checker details for each check
    const checksWithChecker = await Promise.all(
      checks.map(async (check) => {
        const checker = await ctx.db.get(check.checkedBy);
        const checkerOrg = await ctx.db.get(check.checkedByOrg);
        
        return {
          ...check,
          checkerName: checker ? `${checker.firstName} ${checker.lastName}` : "Unknown User",
          checkerOrganization: checkerOrg?.name || "Unknown Organization",
        };
      })
    );

    return checksWithChecker;
  },
});

// Get recent Webster pack checks across all patients (for recent activity)
export const getRecentWebsterChecks = query({
  args: {
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
      throw new Error("User must be part of an organization");
    }

    // Get organization to verify it's a pharmacy
    const organization = await ctx.db.get(userProfile.organizationId);
    if (!organization || organization.type !== "pharmacy") {
      throw new Error("Webster pack checking is only available to pharmacy organizations");
    }

    // Get recent checks from the same organization
    const checks = await ctx.db
      .query("websterPackChecks")
      .withIndex("by_checked_at")
      .filter((q) => q.eq(q.field("checkedByOrg"), userProfile.organizationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .take(args.limit || 20);

    // Get checker and patient details for each check
    const checksWithDetails = await Promise.all(
      checks.map(async (check) => {
        const checker = await ctx.db.get(check.checkedBy);
        const patient = await ctx.db.get(check.patientId);
        
        return {
          ...check,
          checkerName: checker ? `${checker.firstName} ${checker.lastName}` : "Unknown User",
          patientShareToken: patient?.shareToken || "",
        };
      })
    );

    return checksWithDetails;
  },
});

// Search patients for Webster pack checking (pharmacy organizations only)
export const searchPatientsForWebsterCheck = query({
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
      throw new Error("User must be part of an organization");
    }

    // Get organization to verify it's a pharmacy
    const organization = await ctx.db.get(userProfile.organizationId);
    if (!organization || organization.type !== "pharmacy") {
      throw new Error("Webster pack checking is only available to pharmacy organizations");
    }

    const searchTerm = args.searchTerm.toLowerCase();
    const limit = args.limit || 20;

    // Get patients from user's organization and shared patients
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

    // Get shared patients
    const sharedPatients = await Promise.all(
      accessGrants.map(async (grant) => {
        const patient = await ctx.db.get(grant.patientId);
        if (!patient || !patient.isActive) {
          return null;
        }
        return patient;
      })
    );

    // Combine and filter
    const allPatients = [...ownOrgPatients, ...sharedPatients.filter(p => p !== null)];
    
    // Filter by search term
    const filteredPatients = allPatients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const shareToken = patient.shareToken.toLowerCase();
      
      return fullName.includes(searchTerm) || shareToken.includes(searchTerm);
    });

    // Remove duplicates and format for selection
    const uniquePatients = filteredPatients.filter((patient, index, self) => 
      index === self.findIndex(p => p._id === patient._id)
    );

    return uniquePatients.slice(0, limit).map(patient => ({
      _id: patient._id,
      name: `${patient.firstName} ${patient.lastName}`,
      shareToken: patient.shareToken,
      preferredPack: patient.preferredPack,
    }));
  },
});

// Get Webster pack check statistics
export const getWebsterCheckStats = query({
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
      throw new Error("User must be part of an organization");
    }

    // Get organization to verify it's a pharmacy
    const organization = await ctx.db.get(userProfile.organizationId);
    if (!organization || organization.type !== "pharmacy") {
      throw new Error("Webster pack checking is only available to pharmacy organizations");
    }

    // Get all checks from the organization
    const allChecks = await ctx.db
      .query("websterPackChecks")
      .withIndex("by_checked_by")
      .filter((q) => q.eq(q.field("checkedByOrg"), userProfile.organizationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Calculate statistics
    const totalChecks = allChecks.length;
    const passedChecks = allChecks.filter(c => c.checkStatus === "passed").length;
    const failedChecks = allChecks.filter(c => c.checkStatus === "failed").length;
    const reviewChecks = allChecks.filter(c => c.checkStatus === "requires_review").length;
    
    // Today's checks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const todayChecks = allChecks.filter(c => c.checkedAt >= todayTimestamp).length;

    // This week's checks
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weekChecks = allChecks.filter(c => c.checkedAt >= weekAgo).length;

    return {
      totalChecks,
      passedChecks,
      failedChecks,
      reviewChecks,
      todayChecks,
      weekChecks,
      passRate: totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0,
    };
  },
});

// Helper function to check if user has access to a patient
async function checkPatientAccess(
  ctx: { db: any }, 
  patientId: Id<"patients">, 
  userProfileId: Id<"userProfiles">
): Promise<boolean> {
  const patient = await ctx.db.get(patientId);
  if (!patient) {
    return false;
  }

  const userProfile = await ctx.db.get(userProfileId);
  if (!userProfile) {
    return false;
  }

  // Check if patient belongs to user's organization
  if (patient.organizationId === userProfile.organizationId) {
    return true;
  }

  // Check if user has been granted access via token access
  const accessGrant = await ctx.db
    .query("tokenAccessGrants")
    .withIndex("by_grantee")
    .filter((q: any) => q.eq(q.field("grantedTo"), userProfileId))
    .filter((q: any) => q.eq(q.field("patientId"), patientId))
    .filter((q: any) => q.eq(q.field("status"), "approved"))
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .first();

  if (accessGrant) {
    // Check if access has expired
    if (accessGrant.expiresAt && accessGrant.expiresAt < Date.now()) {
      return false;
    }
    return true;
  }

  return false;
} 