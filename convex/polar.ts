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
  // Optional: Configure static keys for referencing your v4s.
  // Map your product keys to Polar product IDs
  products: {
    // Pharmacy Plan product from Polar Production
    pharmacy: "5e14210e-3208-4167-8cd6-d83825c60484",
    // GP Clinic Plan product from Polar Production
    gp_clinic: "9daf79bd-9e08-45f0-ab4d-da1f69288ce4",
  },
  // Explicitly set to production server
  server: "production",
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

// Test Polar connection and list products (for debugging)
export const testPolarConnection = action({
  handler: async (ctx): Promise<{
    success: boolean;
    productCount?: number;
    products?: Array<{ id: string; name: string; priceAmount?: number }>;
    server: string;
    message: string;
    error?: string;
  }> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const userProfile = await ctx.runQuery(api.users.getCurrentUserProfile);
    if (!userProfile || userProfile.role !== "owner") {
      throw new Error("Only organization owners can test Polar connection");
    }

    try {
      // Try to list all products to test the connection
      const allProducts = await ctx.runQuery(api.polar.listAllProducts);
      return {
        success: true,
        productCount: allProducts?.length || 0,
        products: allProducts?.map((p: any) => ({ id: p.id, name: p.name, priceAmount: p.prices[0]?.priceAmount })) || [],
        server: "production",
        message: "Polar connection successful"
      };
    } catch (error) {
      console.error("Polar connection test failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        server: "production",
        message: "Polar connection failed"
      };
    }
  },
});

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

// Get organization-specific pricing details
export const getOrganizationPricingDetails = query({
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

    // Get organization-specific product and discount details
    const getProductDetails = (orgType: string) => {
      switch (orgType) {
                 case "pharmacy":
           return {
             productKey: "pharmacy",
             productId: "5e14210e-3208-4167-8cd6-d83825c60484",
             discountCode: "O5L1G6YF",
             planName: "Pharmacy Plan",
             price: 99.99,
             freeTrialMonths: 1,
             features: [
               "Webster pack checking & scan out",
               "Patient medication management",
               "Unlimited team members",
               "Priority support",
               "Quality control reports"
             ]
           };
                 case "gp_clinic":
           return {
             productKey: "gp_clinic",
             productId: "9daf79bd-9e08-45f0-ab4d-da1f69288ce4",
             discountCode: "6NFLM0T2",
             planName: "GP Clinic Plan",
             price: 99.99,
             freeTrialMonths: 3,
             features: [
               "Patient management & access",
               "Medication monitoring",
               "Unlimited team members",
               "Priority support",
               "Clinical reports"
             ]
           };
        default:
          return null;
      }
    };

    const productDetails = getProductDetails(organization.type);
    if (!productDetails) {
      return null;
    }

    return {
      organizationType: organization.type,
      ...productDetails,
      isOwner: userProfile.role === "owner",
    };
  },
});

 