const FDA_API_BASE_URL = 'https://api.fda.gov/drug/ndc.json';
const FDA_API_KEY = 'uMXW9UC73BuSchp8i0zRgFUBxwLpx4hB4Bqq36CQ';

export interface FDAMedication {
  product_ndc: string;
  generic_name?: string;
  brand_name?: string;
  active_ingredients?: Array<{
    name: string;
    strength: string;
  }>;
  dosage_form?: string;
  route?: string[];
  labeler_name?: string;
  marketing_category?: string;
  application_number?: string;
}

export interface FDASearchResponse {
  meta: {
    results: {
      total: number;
      limit: number;
      skip: number;
    };
  };
  results: FDAMedication[];
}

export interface MedicationSuggestion {
  ndc: string;
  name: string;
  genericName?: string;
  brandName?: string;
  strength?: string;
  dosageForm?: string;
  route?: string;
  manufacturer?: string;
  activeIngredient?: string;
}

/**
 * Search for medications using the FDA NDC API
 */
export async function searchMedications(query: string, limit: number = 10): Promise<MedicationSuggestion[]> {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    // Construct search query - search by generic name or brand name
    const searchQuery = `(generic_name:"${query}"+brand_name:"${query}")`;
    const url = `${FDA_API_BASE_URL}?search=${encodeURIComponent(searchQuery)}&limit=${limit}&api_key=${FDA_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        return []; // No results found
      }
      throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
    }

    const data: FDASearchResponse = await response.json();
    
    return data.results.map(medication => ({
      ndc: medication.product_ndc,
      name: medication.brand_name || medication.generic_name || 'Unknown',
      genericName: medication.generic_name,
      brandName: medication.brand_name,
      strength: medication.active_ingredients?.[0]?.strength,
      dosageForm: medication.dosage_form,
      route: medication.route?.[0],
      manufacturer: medication.labeler_name,
      activeIngredient: medication.active_ingredients?.[0]?.name,
    }));

  } catch (error) {
    console.error('Error searching FDA medications:', error);
    return [];
  }
}

/**
 * Get detailed medication information by NDC
 */
export async function getMedicationByNDC(ndc: string): Promise<FDAMedication | null> {
  try {
    const searchQuery = `product_ndc:"${ndc}"`;
    const url = `${FDA_API_BASE_URL}?search=${encodeURIComponent(searchQuery)}&limit=1&api_key=${FDA_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Not found
      }
      throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
    }

    const data: FDASearchResponse = await response.json();
    return data.results[0] || null;

  } catch (error) {
    console.error('Error fetching medication by NDC:', error);
    return null;
  }
}

/**
 * Search medications with more flexible query patterns
 */
export async function searchMedicationsFlexible(query: string, limit: number = 10): Promise<MedicationSuggestion[]> {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    // Try multiple search strategies
    const searchStrategies = [
      // Exact phrase in generic_name or brand_name
      `(generic_name:"${query}"+brand_name:"${query}")`,
      // Wildcard search in generic_name
      `generic_name:${query}*`,
      // Wildcard search in brand_name
      `brand_name:${query}*`,
      // Search in active ingredients
      `active_ingredients.name:${query}*`,
    ];

    const allResults: MedicationSuggestion[] = [];
    const seenNDCs = new Set<string>();

    for (const searchQuery of searchStrategies) {
      if (allResults.length >= limit) break;

      try {
        const url = `${FDA_API_BASE_URL}?search=${encodeURIComponent(searchQuery)}&limit=${limit}&api_key=${FDA_API_KEY}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data: FDASearchResponse = await response.json();
          
          data.results.forEach(medication => {
            if (!seenNDCs.has(medication.product_ndc) && allResults.length < limit) {
              seenNDCs.add(medication.product_ndc);
              allResults.push({
                ndc: medication.product_ndc,
                name: medication.brand_name || medication.generic_name || 'Unknown',
                genericName: medication.generic_name,
                brandName: medication.brand_name,
                strength: medication.active_ingredients?.[0]?.strength,
                dosageForm: medication.dosage_form,
                route: medication.route?.[0],
                manufacturer: medication.labeler_name,
                activeIngredient: medication.active_ingredients?.[0]?.name,
              });
            }
          });
        }
      } catch {
        // Continue with next strategy if this one fails
        continue;
      }
    }

    return allResults;

  } catch (error) {
    console.error('Error in flexible medication search:', error);
    return [];
  }
} 