import 'package:flutter_test/flutter_test.dart';

// Test targets mirroring our UI emission calculations
double calculateTransportEmission(String vehicleType, double distance) {
  double factor = 0.192; // Petrol Car (default)
  if (vehicleType == 'Diesel Car') factor = 0.171;
  if (vehicleType == 'CNG Auto') factor = 0.089;
  if (vehicleType == 'Metro / Rail') factor = 0.031;
  if (vehicleType == 'Electric Vehicle') factor = 0.050; // Grid offset equivalent
  return double.parse((distance * factor).toStringAsFixed(2));
}

double calculateFoodEmission(String foodType, double quantity) {
  double factor = 6.9; // Chicken (default)
  if (foodType == 'Beef') factor = 27.0;
  if (foodType == 'Rice') factor = 2.7;
  if (foodType == 'Dairy Milk') factor = 1.9;
  if (foodType == 'Vegan Meal') factor = 0.4;
  return double.parse((quantity * factor).toStringAsFixed(2));
}

double calculateEnergyEmission(String energyType, double value) {
  double factor = 0.82; // kWh Electricity Grid Avg
  if (energyType == 'LPG Cooking (Cylinder)') factor = 38.6;
  return double.parse((value * factor).toStringAsFixed(2));
}

void main() {
  group('Carbon Footprint Calculator Tests (India 2025 Factors)', () {
    test('Transport Calculator validation', () {
      // Petrol car emissions verification (factor: 0.192)
      expect(calculateTransportEmission('Petrol Car', 10), 1.92);
      expect(calculateTransportEmission('Petrol Car', 15.5), 2.98);

      // Diesel car emissions verification (factor: 0.171)
      expect(calculateTransportEmission('Diesel Car', 10), 1.71);

      // CNG Auto emissions verification (factor: 0.089)
      expect(calculateTransportEmission('CNG Auto', 50), 4.45);

      // Metro offset benefit verification (factor: 0.031)
      expect(calculateTransportEmission('Metro / Rail', 12), 0.37);
    });

    test('Food Intake Calculator validation', () {
      // Beef high carbon impact (factor: 27.0)
      expect(calculateFoodEmission('Beef', 2), 54.0);

      // Chicken medium carbon impact (factor: 6.9)
      expect(calculateFoodEmission('Chicken', 0.5), 3.45);

      // Rice low carbon impact (factor: 2.7)
      expect(calculateFoodEmission('Rice', 1.5), 4.05);

      // Vegan carbon footprint (factor: 0.4)
      expect(calculateFoodEmission('Vegan Meal', 1.0), 0.4);
    });

    test('Home Energy Calculator validation', () {
      // Electricity Grid usage (factor: 0.82)
      expect(calculateEnergyEmission('kWh (Electricity)', 100), 82.0);

      // LPG Cylinders usage (factor: 38.6)
      expect(calculateEnergyEmission('LPG Cooking (Cylinder)', 1), 38.60);
    });
  });
}
