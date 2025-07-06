import { Polar } from "@convex-dev/polar";
import { api, components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query, mutation, action } from "./_generated/server";
import { auth } from "./auth";

export const polar = new Polar(components.polar, {
  // Required: provide a function the component can use to get the current user's ID and
  // email - this will be used for retrieving the correct subscription data for the
  // current user. Only organization owners can manage subscriptions.
  getUserInfo: async (ctx): Promise<{ userId: string; email: string }> => {
    const userProfile = await ctx.runQuery(api.users.getCurrentUserProfile);
    if (!userProfile) {
      throw new Error("User not authenticated");
    }
    
    // Only organization owners can manage subscriptions
    if (userProfile.role !== "owner") {
      throw new Error("Only organization owners can manage subscriptions");
    }
    
    return {
      userId: userProfile._id,
      email: userProfile.email,
    };
  },
  // Optional: Configure static keys for referencing your products.
  // Map your product keys to Polar product IDs
  products: {
    // Standard Plan product from Polar
    standard: "5e14210e-3208-4167-8cd6-d83825c60484",
  },
});

// Export API functions from the Polar client
export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getConfiguredProducts,
  listAllProducts,
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();

// Sync products from Polar (for existing products created before using this component)
export const syncProducts = action({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const userProfile = await ctx.runQuery(api.users.getCurrentUserProfile);
    if (!userProfile || userProfile.role !== "owner") {
      throw new Error("Only organization owners can sync products");
    }

    try {
      // This will sync products from Polar to the database
      await polar.syncProducts(ctx);
      return { success: true };
    } catch (error) {
      console.error("Error syncing products:", error);
      throw new Error("Failed to sync products");
    }
  },
});

// Get organization subscription status (only for organization owners)
export const getOrganizationSubscription = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!userProfile || userProfile.role !== "owner") {
      return null;
    }

    try {
      // Use the polar client to get subscription information
      const subscription = await polar.getCurrentSubscription(ctx, {
        userId: userProfile._id,
      });
      
      return subscription;
    } catch (error) {
      console.error("Error getting organization subscription:", error);
      return null;
    }
  },
});

// Get organization with subscription status
export const getOrganizationWithSubscription = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", q => q.eq("userId", userId))
      .first();

    if (!userProfile || !userProfile.organizationId) {
      return null;
    }

    const organization = await ctx.db.get(userProfile.organizationId);
    if (!organization) {
      return null;
    }

    // Get subscription status if user is the owner
    let subscription = null;
    if (userProfile.role === "owner") {
      try {
        subscription = await polar.getCurrentSubscription(ctx, {
          userId: userProfile._id,
        });
      } catch (error) {
        console.error("Error getting subscription:", error);
      }
    }

    return {
      ...organization,
      subscription,
      isOwner: userProfile.role === "owner",
      userRole: userProfile.role,
    };
  },
}); 