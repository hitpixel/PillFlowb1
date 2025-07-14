"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function MigrateUsersPage() {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const migrateExistingUsersOTPStatus = useMutation(api.users.migrateExistingUsersOTPStatus);

  const handleMigration = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await migrateExistingUsersOTPStatus();
      setResult(`✅ ${response.message}`);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        setResult(`❌ Error: ${error.message}`);
      } else {
        setResult("❌ Migration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Migration - OTP Status</h1>
        
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-yellow-800">⚠️ Important</h2>
          <p className="text-yellow-700 mb-3">
            This migration will mark all existing users (those without OTP verification status) 
            as not requiring OTP verification, ensuring they can continue using the platform 
            without being forced through the new email verification process.
          </p>
          <p className="text-yellow-700">
            Only run this migration <strong>once</strong> when implementing the OTP system.
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-800">📋 What this does:</h2>
          <ul className="text-blue-700 space-y-2">
            <li>• Finds all users who don&apos;t have OTP verification status set</li>
            <li>• Marks them as not requiring OTP verification</li>
            <li>• Allows them to continue using the platform normally</li>
            <li>• New users will still require OTP verification</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleMigration}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Migrating Users..." : "Run Migration"}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.startsWith('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="font-medium">{result}</p>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2">Note:</h3>
          <p className="text-gray-600 text-sm">
            After running this migration, existing users will be able to access the platform 
            without email verification, while new users will be required to verify their 
            email with OTP before proceeding to setup.
          </p>
        </div>
      </div>
    </div>
  );
} 