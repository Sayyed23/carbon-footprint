import '../entities/emission_log.dart';
import '../../../../core/error/failures.dart';

/// Abstract repository interface for emission data operations.
///
/// Follows the Repository pattern — implementations handle the
/// cache-first vs remote-first strategy internally.
abstract class EmissionRepository {
  /// Get all emissions for a specific date (YYYY-MM-DD format).
  Future<({List<EmissionLog> logs, Failure? error})> getEmissionsForDate(
    String userId,
    String date,
  );

  /// Get emissions for the last [days] days.
  Future<({List<EmissionLog> logs, Failure? error})> getEmissionsForRange(
    String userId,
    int days,
  );

  /// Log a new emission entry. Returns the created log or a failure.
  Future<({EmissionLog? log, Failure? error})> addEmission(EmissionLog log);

  /// Delete a specific emission log.
  Future<Failure?> deleteEmission(String userId, String logId);

  /// Get total CO₂e for a specific date.
  Future<double> getTotalForDate(String userId, String date);

  /// Get category breakdown for a specific date.
  Future<Map<String, double>> getCategoryBreakdown(String userId, String date);

  /// Sync local cache with Firestore.
  Future<Failure?> syncToRemote(String userId);
}
