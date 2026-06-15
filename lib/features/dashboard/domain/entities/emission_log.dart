import 'package:equatable/equatable.dart';

/// Represents a single emission log entry.
///
/// Each log captures one activity (commute, meal, energy usage) with its
/// computed CO₂e impact and metadata about the logging source.
class EmissionLog extends Equatable {
  final String id;
  final String userId;
  final String category;    // Transport, Food, Energy, Shopping, Waste
  final String subCategory;  // Petrol Car, Chicken, kWh, etc.
  final double quantity;     // distance in km, weight in kg, units
  final double emissionFactor;
  final double co2eKg;       // Computed: quantity * emissionFactor
  final DateTime loggedAt;
  final String source;       // manual, receipt_scan, voice, auto_detect
  final int ecoPointsEarned;

  const EmissionLog({
    required this.id,
    required this.userId,
    required this.category,
    required this.subCategory,
    required this.quantity,
    required this.emissionFactor,
    required this.co2eKg,
    required this.loggedAt,
    required this.source,
    this.ecoPointsEarned = 20,
  });

  /// Create from Firestore document map.
  factory EmissionLog.fromMap(Map<String, dynamic> map, String docId) {
    return EmissionLog(
      id: docId,
      userId: map['userId'] as String? ?? '',
      category: map['category'] as String? ?? '',
      subCategory: map['subCategory'] as String? ?? '',
      quantity: (map['quantity'] as num?)?.toDouble() ?? 0.0,
      emissionFactor: (map['emissionFactor'] as num?)?.toDouble() ?? 0.0,
      co2eKg: (map['co2eKg'] as num?)?.toDouble() ?? 0.0,
      loggedAt: map['loggedAt'] != null
          ? DateTime.parse(map['loggedAt'] as String)
          : DateTime.now(),
      source: map['source'] as String? ?? 'manual',
      ecoPointsEarned: map['ecoPointsEarned'] as int? ?? 20,
    );
  }

  /// Convert to Firestore document map.
  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'category': category,
      'subCategory': subCategory,
      'quantity': quantity,
      'emissionFactor': emissionFactor,
      'co2eKg': co2eKg,
      'loggedAt': loggedAt.toIso8601String(),
      'source': source,
      'ecoPointsEarned': ecoPointsEarned,
    };
  }

  @override
  List<Object?> get props => [
        id, userId, category, subCategory, quantity,
        emissionFactor, co2eKg, loggedAt, source, ecoPointsEarned,
      ];
}
