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
      return []; // Return empty array instead of throwing
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      return []; // Return empty array instead of throwing
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
      return []; // Return empty array instead of throwing
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      return []; // Return empty array instead of throwing
    }

    // Get organization to verify it's a pharmacy
    const organization = await ctx.db.get(userProfile.organizationId);
    if (!organization || organization.type !== "pharmacy") {
      return []; // Return empty array instead of throwing
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
      return []; // Return empty array instead of throwing
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      return []; // Return empty array instead of throwing
    }

    // Get organization to verify it's a pharmacy
    const organization = await ctx.db.get(userProfile.organizationId);
    if (!organization || organization.type !== "pharmacy") {
      return []; // Return empty array instead of throwing
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

// Get patient medications organized by time of day for Webster pack verification
export const getPatientMedicationsByTime = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null; // Return null instead of throwing
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      return null; // Return null instead of throwing
    }

    // Get organization to verify it's a pharmacy
    const organization = await ctx.db.get(userProfile.organizationId);
    if (!organization || organization.type !== "pharmacy") {
      return null; // Return null instead of throwing
    }

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, args.patientId, userProfile._id);
    if (!hasAccess) {
      throw new Error("Access denied: You don't have permission to view medications for this patient");
    }

    // Get active medications for the patient
    const medications = await ctx.db
      .query("patientMedications")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Organize medications by time of day
    const medicationsByTime = {
      morning: [] as any[],
      afternoon: [] as any[],
      evening: [] as any[],
      night: [] as any[],
    };

    medications.forEach(med => {
      const medInfo = {
        _id: med._id,
        medicationName: med.medicationName,
        dosage: med.dosage,
        instructions: med.instructions,
        prescribedBy: med.prescribedBy,
        brandName: med.brandName,
        genericName: med.genericName,
        activeIngredient: med.activeIngredient,
        strength: med.strength,
      };

      // Add to appropriate time slots based on dosing schedule
      if (med.morningDose && med.morningDose.trim() !== "") {
        medicationsByTime.morning.push({
          ...medInfo,
          dose: med.morningDose,
          time: "Morning",
        });
      }
      
      if (med.afternoonDose && med.afternoonDose.trim() !== "") {
        medicationsByTime.afternoon.push({
          ...medInfo,
          dose: med.afternoonDose,
          time: "Afternoon",
        });
      }
      
      if (med.eveningDose && med.eveningDose.trim() !== "") {
        medicationsByTime.evening.push({
          ...medInfo,
          dose: med.eveningDose,
          time: "Evening",
        });
      }
      
      if (med.nightDose && med.nightDose.trim() !== "") {
        medicationsByTime.night.push({
          ...medInfo,
          dose: med.nightDose,
          time: "Night",
        });
      }
    });

    // Calculate totals
    const totalMedications = medications.length;
    const totalDoses = medicationsByTime.morning.length + 
                      medicationsByTime.afternoon.length + 
                      medicationsByTime.evening.length + 
                      medicationsByTime.night.length;

    return {
      medicationsByTime,
      totalMedications,
      totalDoses,
      summary: {
        morning: medicationsByTime.morning.length,
        afternoon: medicationsByTime.afternoon.length,
        evening: medicationsByTime.evening.length,
        night: medicationsByTime.night.length,
      },
    };
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
      // Return null for non-pharmacy organizations instead of throwing
      return null;
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

// Create a new Webster pack scan out
export const createWebsterPackScanOut = mutation({
  args: {
    patientId: v.id("patients"),
    websterPackId: v.string(),
    packType: v.union(v.literal("blister"), v.literal("sachets")),
    numberOfPacks: v.optional(v.number()),
    memberInitials: v.optional(v.string()),
    deliveryMethod: v.union(
      v.literal("pickup"),
      v.literal("delivery"),
      v.literal("courier")
    ),
    deliveryAddress: v.optional(v.string()),
    deliveryNotes: v.optional(v.string()),
    scanOutStatus: v.union(
      v.literal("dispatched"),
      v.literal("collected"),
      v.literal("failed")
    ),
    notes: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    recipientSignature: v.optional(v.string()),
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
      throw new Error("Webster pack scan out is only available to pharmacy organizations");
    }

    // Get patient details
    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, args.patientId, userProfile._id);
    if (!hasAccess) {
      throw new Error("Access denied: You don't have permission to scan out packs for this patient");
    }

    const now = Date.now();

    // Create the Webster pack scan out record
    const scanOutId = await ctx.db.insert("websterPackScanOuts", {
      patientId: args.patientId,
      websterPackId: args.websterPackId,
      packType: args.packType,
      numberOfPacks: args.numberOfPacks || 1,
      memberInitials: args.memberInitials || "",
      deliveryMethod: args.deliveryMethod,
      deliveryAddress: args.deliveryAddress,
      deliveryNotes: args.deliveryNotes,
      scanOutStatus: args.scanOutStatus,
      notes: args.notes,
      recipientName: args.recipientName,
      recipientSignature: args.recipientSignature,
      scannedOutBy: userProfile._id,
      scannedOutByOrg: userProfile.organizationId,
      scannedOutAt: now,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientShareToken: patient.shareToken,
      isActive: true,
    });

    // Log the scan out in patient comments
    const statusText = args.scanOutStatus === "dispatched" ? "dispatched" : 
                      args.scanOutStatus === "collected" ? "collected" : "failed to dispatch";
    
    let commentContent = `Webster pack ${args.websterPackId} ${statusText} via ${args.deliveryMethod}`;
    if (args.recipientName) {
      commentContent += ` to ${args.recipientName}`;
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
      isPrivate: false,
      isActive: true,
      createdAt: now,
    });

    return scanOutId;
  },
});

// Get Webster pack scan out statistics
export const getWebsterScanOutStats = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null; // Return null instead of throwing
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      return null; // Return null instead of throwing
    }

    // Get organization to verify it's a pharmacy
    const organization = await ctx.db.get(userProfile.organizationId);
    if (!organization || organization.type !== "pharmacy") {
      return null; // Return null instead of throwing
    }

    // Get all scan outs from the organization
    const allScanOuts = await ctx.db
      .query("websterPackScanOuts")
      .withIndex("by_scanned_out_by")
      .filter((q) => q.eq(q.field("scannedOutByOrg"), userProfile.organizationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Calculate statistics
    const totalScanOuts = allScanOuts.length;
    const dispatchedCount = allScanOuts.filter(s => s.scanOutStatus === "dispatched").length;
    const collectedCount = allScanOuts.filter(s => s.scanOutStatus === "collected").length;
    const failedCount = allScanOuts.filter(s => s.scanOutStatus === "failed").length;
    
    // Today's scan outs
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const todayScanOuts = allScanOuts.filter(s => s.scannedOutAt >= todayTimestamp).length;

    // This week's scan outs
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weekScanOuts = allScanOuts.filter(s => s.scannedOutAt >= weekAgo).length;

    return {
      totalScanOuts,
      dispatchedCount,
      collectedCount,
      failedCount,
      todayScanOuts,
      weekScanOuts,
      successRate: totalScanOuts > 0 ? Math.round(((dispatchedCount + collectedCount) / totalScanOuts) * 100) : 0,
    };
  },
});

// Get Webster pack scan outs for a patient
export const getPatientWebsterScanOuts = query({
  args: {
    patientId: v.id("patients"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return []; // Return empty array instead of throwing
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      return []; // Return empty array instead of throwing
    }

    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(ctx, args.patientId, userProfile._id);
    if (!hasAccess) {
      return []; // Return empty array instead of throwing
    }

    // Get scan outs for the patient
    const scanOuts = await ctx.db
      .query("websterPackScanOuts")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .take(args.limit || 50);

    // Get scanner details for each scan out
    const scanOutsWithDetails = await Promise.all(
      scanOuts.map(async (scanOut) => {
        const scanner = await ctx.db.get(scanOut.scannedOutBy);
        const scannerOrg = await ctx.db.get(scanOut.scannedOutByOrg);
        
        return {
          ...scanOut,
          scannerName: scanner ? `${scanner.firstName} ${scanner.lastName}` : "Unknown User",
          scannerOrganization: scannerOrg?.name || "Unknown Organization",
        };
      })
    );

    return scanOutsWithDetails;
  },
});

// Get recent Webster pack scan outs
export const getRecentWebsterScanOuts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return []; // Return empty array instead of throwing
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      return []; // Return empty array instead of throwing
    }

    // Get organization to verify it's a pharmacy
    const organization = await ctx.db.get(userProfile.organizationId);
    if (!organization || organization.type !== "pharmacy") {
      return []; // Return empty array instead of throwing
    }

    // Get recent scan outs from the same organization
    const scanOuts = await ctx.db
      .query("websterPackScanOuts")
      .withIndex("by_scanned_out_at")
      .filter((q) => q.eq(q.field("scannedOutByOrg"), userProfile.organizationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .take(args.limit || 20);

    // Get scanner details for each scan out
    const scanOutsWithDetails = await Promise.all(
      scanOuts.map(async (scanOut) => {
        const scanner = await ctx.db.get(scanOut.scannedOutBy);
        
        return {
          ...scanOut,
          scannerName: scanner ? `${scanner.firstName} ${scanner.lastName}` : "Unknown User",
        };
      })
    );

    return scanOutsWithDetails;
  },
});

// Check if Webster pack has been checked before scan out
export const getWebsterPackCheckStatus = query({
  args: {
    websterPackId: v.string(),
    patientId: v.optional(v.id("patients")), // Added optional patientId for validation
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        isChecked: false,
        canScanOut: false,
        message: "User not authenticated",
      };
    }

    // Get user profile to find organization
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      return {
        isChecked: false,
        canScanOut: false,
        message: "User must be part of an organization",
      };
    }

    // Get organization to verify it's a pharmacy
    const organization = await ctx.db.get(userProfile.organizationId);
    if (!organization || organization.type !== "pharmacy") {
      return {
        isChecked: false,
        canScanOut: false,
        message: "Webster pack checking is only available to pharmacy organizations",
      };
    }

    // Find the most recent check for this Webster pack
    const websterCheck = await ctx.db
      .query("websterPackChecks")
      .withIndex("by_webster_pack_id")
      .filter((q) => q.eq(q.field("websterPackId"), args.websterPackId))
      .filter((q) => q.eq(q.field("checkedByOrg"), userProfile.organizationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .first();

    if (!websterCheck) {
      return {
        isChecked: false,
        canScanOut: false,
        message: "Webster pack has not been checked yet",
      };
    }

    // If patientId is provided, check if it matches the pack's assigned patient
    if (args.patientId && websterCheck.patientId !== args.patientId) {
      return {
        isChecked: true,
        canScanOut: false,
        message: `Webster pack is assigned to a different customer: ${websterCheck.patientName}`,
        checkDetails: {
          checkStatus: websterCheck.checkStatus,
          checkedAt: websterCheck.checkedAt,
          checkedBy: websterCheck.checkedBy,
          patientName: websterCheck.patientName,
          notes: websterCheck.notes,
          patientId: websterCheck.patientId, // Include the correct patient ID
        },
      };
    }

    // Check if the pack passed the quality check
    if (websterCheck.checkStatus === "passed") {
      return {
        isChecked: true,
        canScanOut: true,
        message: "Webster pack has passed quality check",
        checkDetails: {
          checkStatus: websterCheck.checkStatus,
          checkedAt: websterCheck.checkedAt,
          checkedBy: websterCheck.checkedBy,
          patientName: websterCheck.patientName,
          notes: websterCheck.notes,
          patientId: websterCheck.patientId,
        },
      };
    } else if (websterCheck.checkStatus === "failed") {
      return {
        isChecked: true,
        canScanOut: false,
        message: "Webster pack failed quality check and cannot be scanned out",
        checkDetails: {
          checkStatus: websterCheck.checkStatus,
          checkedAt: websterCheck.checkedAt,
          checkedBy: websterCheck.checkedBy,
          patientName: websterCheck.patientName,
          notes: websterCheck.notes,
          issues: websterCheck.issues,
          patientId: websterCheck.patientId,
        },
      };
    } else {
      return {
        isChecked: true,
        canScanOut: false,
        message: "Webster pack requires review before scan out",
        checkDetails: {
          checkStatus: websterCheck.checkStatus,
          checkedAt: websterCheck.checkedAt,
          checkedBy: websterCheck.checkedBy,
          patientName: websterCheck.patientName,
          notes: websterCheck.notes,
          issues: websterCheck.issues,
          patientId: websterCheck.patientId,
        },
      };
    }
  },
}); 