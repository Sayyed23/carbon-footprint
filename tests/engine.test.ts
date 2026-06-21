import test from "node:test";
import assert from "node:assert";
import {
  getGridFactor,
  calculateTransportEmissions,
  calculateElectricityEmissions,
  calculateCookingEmissions,
  calculateDietEmissions,
  calculateConsumptionEmissions,
} from "../lib/emissions/engine";

test("Emission Factor Engine - Grid Factors", () => {
  // National default Combined Margin factor
  assert.strictEqual(getGridFactor(""), 0.71);
  assert.strictEqual(getGridFactor("Unknown State"), 0.71);

  // Region-specific Combined Margin factors (v20.0 CEA)
  assert.strictEqual(getGridFactor("Maharashtra"), 0.74); // western region
  assert.strictEqual(getGridFactor("Karnataka"), 0.63); // southern region (high renewables)
  assert.strictEqual(getGridFactor("West Bengal"), 0.78); // eastern region (coal heavy)
  assert.strictEqual(getGridFactor("Delhi"), 0.71); // northern region
  assert.strictEqual(getGridFactor("Himachal Pradesh"), 0.52); // hydro heavy
});

test("Emission Factor Engine - Transport Calculations", () => {
  // Petrol Car: 100 km * 0.143 kg/km = 14.3 kg
  const petrolCarEmissions = calculateTransportEmissions("4w_petrol", 100);
  assert.strictEqual(petrolCarEmissions, 14.3);

  // EV Scooter: 50 km * 0.015 kg/km = 0.75 kg
  const evScooterEmissions = calculateTransportEmissions("2w_ev", 50);
  assert.strictEqual(evScooterEmissions, 0.75);

  // CNG Auto-rickshaw: 20 km * 0.048 kg/km = 0.96 kg
  const cngAutoEmissions = calculateTransportEmissions("3w_cng", 20);
  assert.strictEqual(cngAutoEmissions, 0.96);

  // Metro Rail: 30 km * 0.018 kg/km = 0.54 kg
  const metroEmissions = calculateTransportEmissions("metro_train", 30);
  assert.strictEqual(metroEmissions, 0.54);
});

test("Emission Factor Engine - Electricity Calculations", () => {
  // Maharashtra grid electricity: 200 kWh * 0.74 kg/kWh = 148 kg
  const mhPower = calculateElectricityEmissions(200, "Maharashtra");
  assert.strictEqual(mhPower, 148);

  // Karnataka grid electricity: 200 kWh * 0.63 kg/kWh = 126 kg
  const kaPower = calculateElectricityEmissions(200, "Karnataka");
  assert.strictEqual(kaPower, 126);
});

test("Emission Factor Engine - Cooking Fuel Calculations", () => {
  // 1 LPG Cylinder = 42.5 kg CO2e
  const lpgCylinder = calculateCookingEmissions("lpg_cylinder", 1);
  assert.strictEqual(lpgCylinder, 42.5);

  // PNG: 15 m3 * 2.02 kg/m3 = 30.3 kg
  const pngEmissions = calculateCookingEmissions("png_m3", 15);
  assert.strictEqual(pngEmissions, 30.3);

  // Electric (induction): 50 kWh on Maharashtra grid = 50 * 0.74 = 37 kg
  const electricCooking = calculateCookingEmissions("electric_kwh", 50, "Maharashtra");
  assert.strictEqual(electricCooking, 37.0);
});

test("Emission Factor Engine - Diet Calculations", () => {
  // Vegetarian: 7 days * 1.6 kg/day = 11.2 kg
  const vegDiet = calculateDietEmissions("vegetarian", 7);
  assert.strictEqual(vegDiet, 11.2);

  // Vegan: 7 days * 1.1 kg/day = 7.7 kg
  const veganDiet = calculateDietEmissions("vegan", 7);
  assert.strictEqual(veganDiet, 7.7);

  // High Non-Veg: 3 days * 4.5 kg/day = 13.5 kg
  const nonVegDiet = calculateDietEmissions("non_veg_high", 3);
  assert.strictEqual(nonVegDiet, 13.5);
});

test("Emission Factor Engine - Consumption/Shopping", () => {
  // 3 E-commerce deliveries: 3 * 0.95 = 2.85 kg
  const deliveries = calculateConsumptionEmissions("delivery_order", 3);
  assert.strictEqual(deliveries, 2.85);

  // 2 Fast fashion items: 2 * 9.5 = 19 kg
  const fashion = calculateConsumptionEmissions("fashion_item", 2);
  assert.strictEqual(fashion, 19.0);

  // 1 Electronic device: 65 kg
  const device = calculateConsumptionEmissions("electronics_device", 1);
  assert.strictEqual(device, 65.0);
});
