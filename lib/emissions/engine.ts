export interface EmissionFactors {
  version: string;
  effectiveFrom: string;
  sourceDocument: string;
  electricity: {
    default: number; // kg CO2e/kWh
    byRegion: {
      [region: string]: number;
    };
    byState: {
      [state: string]: string; // Maps state name to region key
    };
  };
  transport: {
    // kg CO2e per km
    "2w_petrol": number;
    "2w_ev": number;
    "3w_cng": number;
    "3w_diesel": number;
    "4w_petrol": number;
    "4w_diesel": number;
    "4w_cng": number;
    "4w_ev": number;
    bus_diesel: number;
    bus_cng_ev: number;
    metro_train: number;
    flight_domestic: number;
  };
  cooking: {
    // kg CO2e per specified unit
    lpg_cylinder: number; // per 14.2 kg cylinder
    png_m3: number; // per cubic meter
    biomass_kg: number; // per kg
    electric_kwh: number; // computed dynamically based on grid factor
  };
  diet: {
    // kg CO2e per day
    vegan: number;
    vegetarian: number;
    eggetarian: number;
    non_veg_low: number;
    non_veg_high: number;
  };
  consumption: {
    // kg CO2e per item/order
    delivery_order: number;
    fashion_item: number;
    electronics_device: number;
  };
}

// Latest CEA Baseline Database Version 20.0 Combined Margin factors and typical Indian lifestyle averages
export const DEFAULT_EMISSION_FACTORS: EmissionFactors = {
  version: "v20.0-2024",
  effectiveFrom: "2024-06-01",
  sourceDocument: "CEA CO2 Baseline Database for the Indian Power Sector, Version 20.0 & MoEFCC/ICAT Guidelines",
  electricity: {
    default: 0.71, // Unified National Grid CM average (kg CO2e/kWh)
    byRegion: {
      eastern: 0.78,   // Coal-heavy region (WB, Bihar, Jharkhand, Odisha)
      western: 0.74,   // Mixed coal & renewables (Maharashtra, Gujarat, MP, Chhattisgarh)
      southern: 0.63,  // High solar/wind/hydro share (Karnataka, TN, AP, Kerala, Telangana)
      northern: 0.71,  // National average mix (Delhi, Punjab, Haryana, UP, Rajasthan)
      northeastern: 0.52, // Hydro-heavy (HP, Uttarakhand, Sikkim, Assam, NE states)
    },
    byState: {
      // Map states to regions to select regional grid factor
      "West Bengal": "eastern",
      "Bihar": "eastern",
      "Jharkhand": "eastern",
      "Odisha": "eastern",
      "Maharashtra": "western",
      "Gujarat": "western",
      "Madhya Pradesh": "western",
      "Chhattisgarh": "western",
      "Goa": "western",
      "Karnataka": "southern",
      "Tamil Nadu": "southern",
      "Andhra Pradesh": "southern",
      "Kerala": "southern",
      "Telangana": "southern",
      "Puducherry": "southern",
      "Delhi": "northern",
      "Punjab": "northern",
      "Haryana": "northern",
      "Uttar Pradesh": "northern",
      "Rajasthan": "northern",
      "Jammu & Kashmir": "northern",
      "Chandigarh": "northern",
      "Himachal Pradesh": "northeastern",
      "Uttarakhand": "northeastern",
      "Sikkim": "northeastern",
      "Assam": "northeastern",
      "Arunachal Pradesh": "northeastern",
      "Manipur": "northeastern",
      "Meghalaya": "northeastern",
      "Mizoram": "northeastern",
      "Nagaland": "northeastern",
      "Tripura": "northeastern"
    }
  },
  transport: {
    "2w_petrol": 0.056,
    "2w_ev": 0.015,
    "3w_cng": 0.048,
    "3w_diesel": 0.085,
    "4w_petrol": 0.143,
    "4w_diesel": 0.132,
    "4w_cng": 0.098,
    "4w_ev": 0.042,
    "bus_diesel": 0.035,
    "bus_cng_ev": 0.015,
    "metro_train": 0.018,
    "flight_domestic": 0.120
  },
  cooking: {
    lpg_cylinder: 42.5, // 14.2 kg domestic cylinder
    png_m3: 2.02,
    biomass_kg: 1.85,
    electric_kwh: 0.71 // fallback to default grid factor
  },
  diet: {
    vegan: 1.1,
    vegetarian: 1.6,
    eggetarian: 1.9,
    non_veg_low: 2.8,
    non_veg_high: 4.5
  },
  consumption: {
    delivery_order: 0.95,
    fashion_item: 9.5,
    electronics_device: 65.0
  }
};

/**
 * Returns the electricity Combined Margin grid factor for a given state or the default.
 */
export function getGridFactor(state: string, factors: EmissionFactors = DEFAULT_EMISSION_FACTORS): number {
  if (!state) return factors.electricity.default;
  const normalizedState = state.trim();
  const regionKey = factors.electricity.byState[normalizedState];
  if (regionKey && factors.electricity.byRegion[regionKey] !== undefined) {
    return factors.electricity.byRegion[regionKey];
  }
  return factors.electricity.default;
}

/**
 * Calculates emissions for transport category.
 * @param type vehicle type
 * @param distance distance in km
 */
export function calculateTransportEmissions(
  type: keyof EmissionFactors["transport"],
  distance: number,
  factors: EmissionFactors = DEFAULT_EMISSION_FACTORS
): number {
  const factor = factors.transport[type] || 0;
  return Number((factor * distance).toFixed(3));
}

/**
 * Calculates emissions for electricity usage.
 * @param kwh energy usage in kWh
 * @param state Indian state name for regional grid mix
 */
export function calculateElectricityEmissions(
  kwh: number,
  state: string,
  factors: EmissionFactors = DEFAULT_EMISSION_FACTORS
): number {
  const gridFactor = getGridFactor(state, factors);
  return Number((gridFactor * kwh).toFixed(3));
}

/**
 * Calculates emissions for cooking fuel.
 * @param type cooking fuel type
 * @param quantity quantity of usage
 * @param state state name (only needed if using induction/electric cooking)
 */
export function calculateCookingEmissions(
  type: keyof EmissionFactors["cooking"],
  quantity: number,
  state?: string,
  factors: EmissionFactors = DEFAULT_EMISSION_FACTORS
): number {
  if (type === "electric_kwh") {
    const gridFactor = state ? getGridFactor(state, factors) : factors.electricity.default;
    return Number((gridFactor * quantity).toFixed(3));
  }
  const factor = factors.cooking[type] || 0;
  return Number((factor * quantity).toFixed(3));
}

/**
 * Calculates emissions for diet per day or meals.
 * @param type diet type
 * @param days number of days
 */
export function calculateDietEmissions(
  type: keyof EmissionFactors["diet"],
  days: number = 1,
  factors: EmissionFactors = DEFAULT_EMISSION_FACTORS
): number {
  const factor = factors.diet[type] || 0;
  return Number((factor * days).toFixed(3));
}

/**
 * Calculates emissions for consumer purchases.
 * @param type consumption category
 * @param quantity count of items
 */
export function calculateConsumptionEmissions(
  type: keyof EmissionFactors["consumption"],
  quantity: number,
  factors: EmissionFactors = DEFAULT_EMISSION_FACTORS
): number {
  const factor = factors.consumption[type] || 0;
  return Number((factor * quantity).toFixed(3));
}
