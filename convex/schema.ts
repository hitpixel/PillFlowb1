import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  
  // User profiles with professional details
  userProfiles: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    aphraRegistrationNumber: v.optional(v.string()),
    healthcareProfessionalType: v.optional(v.union(
      v.literal("pharmacist"),
      v.literal("general_practitioner"), 
      v.literal("nurse"),
      v.literal("administration"),
      v.literal("aged_care_worker"),
      v.literal("specialist"),
      v.literal("other")
    )),
    organizationId: v.optional(v.id("organizations")),
    role: v.optional(v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    )),
    profileCompleted: v.boolean(),
    setupCompleted: v.boolean(),
    welcomeEmailSent: v.optional(v.boolean()),
    createdAt: v.float64(),
    isActive: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"]),

  // Organizations with detailed business information
  organizations: defineTable({
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
    country: v.string(),
    abn: v.string(),
    // accessToken removed - only use invitation tokens for security
    ownerId: v.id("userProfiles"),
    createdAt: v.float64(),
    isActive: v.boolean(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_email", ["email"]),

  // Member invitations with individual tokens
  memberInvitations: defineTable({
    organizationId: v.id("organizations"),
    invitedBy: v.id("userProfiles"),
    inviteToken: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
    expiresAt: v.float64(),
    isUsed: v.boolean(),
    usedBy: v.optional(v.id("userProfiles")),
    usedAt: v.optional(v.float64()),
    createdAt: v.float64(),
    isActive: v.boolean(),
  })
    .index("by_invite_token", ["inviteToken"])
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"]),

  // Organization partnerships for data sharing and collaboration
  organizationPartnerships: defineTable({
    initiatorOrgId: v.id("organizations"),
    partnerOrgId: v.optional(v.id("organizations")), // null until accepted
    partnershipToken: v.string(),
    partnershipType: v.union(
      v.literal("data_sharing"),
      v.literal("referral_network"),
      v.literal("merger")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("expired")
    ),
    initiatedBy: v.id("userProfiles"),
    acceptedBy: v.optional(v.id("userProfiles")),
    expiresAt: v.float64(),
    createdAt: v.float64(),
    acceptedAt: v.optional(v.float64()),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
  })
    .index("by_partnership_token", ["partnershipToken"])
    .index("by_initiator", ["initiatorOrgId"])
    .index("by_partner", ["partnerOrgId"])
    .index("by_status", ["status"]),

  // Patients with detailed information and unique tokens for data sharing
  patients: defineTable({
    // Unique token for data sharing between organizations
    shareToken: v.string(),
    // Organization this patient belongs to
    organizationId: v.id("organizations"),
    // Patient personal information
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(), // YYYY-MM-DD format
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    // Address information
    streetAddress: v.string(),
    suburb: v.string(),
    state: v.string(),
    postcode: v.string(),
    // Medication packaging preference
    preferredPack: v.union(
      v.literal("blister"),
      v.literal("sachets")
    ),
    // Metadata
    createdBy: v.id("userProfiles"),
    createdAt: v.float64(),
    updatedAt: v.float64(),
    isActive: v.boolean(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_share_token", ["shareToken"])
    .index("by_email", ["email"])
    .index("by_name", ["lastName", "firstName"])
    .index("by_created_by", ["createdBy"]),

  // Audit log for share token access
  shareTokenAccess: defineTable({
    patientId: v.id("patients"),
    accessedBy: v.id("userProfiles"),
    accessedByOrg: v.id("organizations"),
    patientOrg: v.id("organizations"),
    shareToken: v.string(),
    accessType: v.union(
      v.literal("same_organization"),
      v.literal("cross_organization")
    ),
    accessedAt: v.float64(),
  })
    .index("by_patient", ["patientId"])
    .index("by_accessor", ["accessedBy"])
    .index("by_share_token", ["shareToken"])
    .index("by_access_time", ["accessedAt"]),

  // Token access grants - who has ongoing access to patient data
  tokenAccessGrants: defineTable({
    patientId: v.id("patients"),
    shareToken: v.string(),
    grantedTo: v.id("userProfiles"),
    grantedToOrg: v.id("organizations"),
    grantedBy: v.optional(v.id("userProfiles")), // null for share token requests
    grantedByOrg: v.id("organizations"),
    accessType: v.union(
      v.literal("same_organization"),
      v.literal("cross_organization")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("denied"),
      v.literal("revoked")
    ),
    permissions: v.array(v.union(
      v.literal("view"),
      v.literal("comment"),
      v.literal("view_medications")
    )),
    expiresAt: v.optional(v.float64()), // null means never expires
    isActive: v.boolean(),
    requestedAt: v.float64(), // When the access was requested
    grantedAt: v.optional(v.float64()), // When it was approved
    revokedAt: v.optional(v.float64()),
    revokedBy: v.optional(v.id("userProfiles")),
    deniedAt: v.optional(v.float64()),
    deniedBy: v.optional(v.id("userProfiles")),
  })
    .index("by_patient", ["patientId"])
    .index("by_grantee", ["grantedTo"])
    .index("by_share_token", ["shareToken"])
    .index("by_expiry", ["expiresAt"])
    .index("by_active", ["isActive"]),

  // Patient medications with FDA NDC support
  patientMedications: defineTable({
    patientId: v.id("patients"),
    organizationId: v.id("organizations"), // Which org added this medication
    medicationName: v.string(),
    dosage: v.string(),
    // Timing fields instead of frequency
    morningDose: v.optional(v.string()), // e.g., "1 tablet", "2mg"
    afternoonDose: v.optional(v.string()),
    eveningDose: v.optional(v.string()),
    nightDose: v.optional(v.string()),
    instructions: v.optional(v.string()),
    prescribedBy: v.optional(v.string()), // Doctor name
    prescribedDate: v.optional(v.string()), // YYYY-MM-DD format
    startDate: v.optional(v.string()), // YYYY-MM-DD format
    endDate: v.optional(v.string()), // YYYY-MM-DD format
    // FDA NDC fields
    fdaNdc: v.optional(v.string()), // FDA National Drug Code
    genericName: v.optional(v.string()), // Generic medication name
    brandName: v.optional(v.string()), // Brand name
    dosageForm: v.optional(v.string()), // Tablet, capsule, etc.
    route: v.optional(v.string()), // Oral, topical, etc.
    manufacturer: v.optional(v.string()), // Manufacturer name
    activeIngredient: v.optional(v.string()), // Active ingredient
    strength: v.optional(v.string()), // Strength/concentration
    isActive: v.boolean(),
    addedBy: v.id("userProfiles"),
    addedAt: v.float64(),
    updatedBy: v.optional(v.id("userProfiles")),
    updatedAt: v.optional(v.float64()),
  })
    .index("by_patient", ["patientId"])
    .index("by_organization", ["organizationId"])
    .index("by_active", ["isActive"])
    .index("by_added_by", ["addedBy"]),

  // Medication change log for audit trail
  medicationLogs: defineTable({
    patientId: v.id("patients"),
    medicationId: v.optional(v.id("patientMedications")), // null for deletions
    actionType: v.union(
      v.literal("added"),
      v.literal("updated"),
      v.literal("stopped"),
      v.literal("deleted")
    ),
    medicationName: v.string(),
    changes: v.optional(v.string()), // JSON string of changes made
    performedBy: v.id("userProfiles"),
    performedByOrg: v.id("organizations"),
    performedAt: v.float64(),
    // Current medication state at time of change
    currentDosage: v.optional(v.string()),
    currentMorningDose: v.optional(v.string()),
    currentAfternoonDose: v.optional(v.string()),
    currentEveningDose: v.optional(v.string()),
    currentNightDose: v.optional(v.string()),
    currentInstructions: v.optional(v.string()),
    previousState: v.optional(v.string()), // JSON string of previous state
  })
    .index("by_patient", ["patientId"])
    .index("by_medication", ["medicationId"])
    .index("by_performed_by", ["performedBy"])
    .index("by_performed_at", ["performedAt"])
    .index("by_action_type", ["actionType"]),

  // Patient comments/chat system
  patientComments: defineTable({
    patientId: v.id("patients"),
    authorId: v.id("userProfiles"),
    authorOrg: v.id("organizations"),
    content: v.string(),
    commentType: v.union(
      v.literal("note"),
      v.literal("chat"),
      v.literal("system")
    ),
    isPrivate: v.boolean(), // Private to organization or shared with token holders
    replyToId: v.optional(v.id("patientComments")), // For threaded conversations
    attachments: v.optional(v.array(v.object({
      fileName: v.string(),
      fileUrl: v.string(),
      fileType: v.string(),
      fileSize: v.number(),
    }))),
    isActive: v.boolean(),
    createdAt: v.float64(),
    updatedAt: v.optional(v.float64()),
    editedBy: v.optional(v.id("userProfiles")),
  })
    .index("by_patient", ["patientId"])
    .index("by_author", ["authorId"])
    .index("by_author_org", ["authorOrg"])
    .index("by_reply_to", ["replyToId"])
    .index("by_created_at", ["createdAt"])
    .index("by_active", ["isActive"]),

});
