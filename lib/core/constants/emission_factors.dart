/// India 2025 Emission Factors — sourced from BEE / IPCC / CEA.
///
/// All values are in **kg CO₂e per unit** (per-km for transport,
/// per-kg for food, per-unit for energy).
///
/// Version: 2025.1
library;

class EmissionFactors {
  EmissionFactors._();

  static const String version = '2025.1';

  // ── Transport (kg CO₂e / passenger-km) ──────────────────────
  static const double petrolCar = 0.192;
  static const double dieselCar = 0.171;
  static const double cngAuto = 0.089;
  static const double metroRail = 0.031;
  static const double electricVehicle = 0.050;
  static const double domesticFlight = 0.255;
  static const double bus = 0.060;
  static const double bicycle = 0.0;
  static const double walking = 0.0;
  static const double twoWheelerPetrol = 0.072;

  // ── Food (kg CO₂e / kg of food) ─────────────────────────────
  static const double beef = 27.0;
  static const double lamb = 24.0;
  static const double chicken = 6.9;
  static const double pork = 7.2;
  static const double fish = 5.4;
  static const double rice = 2.7;
  static const double dairyMilk = 1.9;
  static const double cheese = 13.5;
  static const double eggs = 4.8;
  static const double vegetables = 0.4;
  static const double veganMeal = 0.4;
  static const double lentilsDal = 0.9;
  static const double wheat = 1.4;
  static const double millets = 0.8;

  // ── Energy (kg CO₂e / unit) ─────────────────────────────────
  static const double electricityGrid = 0.82; // per kWh — India CEA 2025
  static const double lpgCylinder = 38.6; // per 14.2 kg cylinder
  static const double solarPv = 0.0; // net zero
  static const double dieselGenerator = 2.68; // per litre

  // ── Shopping (kg CO₂e / item estimate) ──────────────────────
  static const double clothingPerKg = 10.0;
  static const double electronicsPerUnit = 25.0;
  static const double furniturePerUnit = 50.0;

  // ── Waste (kg CO₂e / kg) ────────────────────────────────────
  static const double landfillWaste = 0.5;
  static const double recycledWaste = 0.1;
  static const double compostedWaste = 0.05;

  /// Lookup map for transport emission factors.
  static const Map<String, double> transport = {
    'Petrol Car': petrolCar,
    'Diesel Car': dieselCar,
    'CNG Auto': cngAuto,
    'Metro / Rail': metroRail,
    'Electric Vehicle': electricVehicle,
    'Domestic Flight': domesticFlight,
    'Bus': bus,
    'Bicycle': bicycle,
    'Walking': walking,
    '2-Wheeler (Petrol)': twoWheelerPetrol,
  };

  /// Lookup map for food emission factors.
  static const Map<String, double> food = {
    'Beef': beef,
    'Lamb': lamb,
    'Chicken': chicken,
    'Pork': pork,
    'Fish': fish,
    'Rice': rice,
    'Dairy Milk': dairyMilk,
    'Cheese': cheese,
    'Eggs': eggs,
    'Vegetables': vegetables,
    'Vegan Meal': veganMeal,
    'Lentils / Dal': lentilsDal,
    'Wheat': wheat,
    'Millets': millets,
  };

  /// Lookup map for energy emission factors.
  static const Map<String, double> energy = {
    'kWh (Electricity)': electricityGrid,
    'LPG Cooking (Cylinder)': lpgCylinder,
    'Solar PV': solarPv,
    'Diesel Generator (L)': dieselGenerator,
  };

  /// Lookup map for waste emission factors.
  static const Map<String, double> waste = {
    'Landfill': landfillWaste,
    'Recycled': recycledWaste,
    'Composted': compostedWaste,
  };

  /// Compute CO₂e for a given category and sub-type.
  static double compute({
    required String category,
    required String subType,
    required double quantity,
  }) {
    double factor;
    switch (category) {
      case 'Transport':
        factor = transport[subType] ?? petrolCar;
      case 'Food':
        factor = food[subType] ?? chicken;
      case 'Energy':
        factor = energy[subType] ?? electricityGrid;
      case 'Waste':
        factor = waste[subType] ?? landfillWaste;
      default:
        factor = 0.0;
    }
    return double.parse((quantity * factor).toStringAsFixed(2));
  }
}
