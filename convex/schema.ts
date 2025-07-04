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


});
