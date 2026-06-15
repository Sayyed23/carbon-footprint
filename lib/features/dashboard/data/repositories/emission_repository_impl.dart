import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../domain/entities/emission_log.dart';
import '../../domain/repositories/emission_repository.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/network/network_info.dart';

/// Offline-first emission repository implementation.
///
/// Strategy:
/// 1. **Write**: Always write to Hive first → then sync to Firestore when online.
/// 2. **Read**: Read from Hive (cache-first) → fallback to Firestore if cache miss.
/// 3. **Sync**: Periodically push unsynced entries to Firestore.
class EmissionRepositoryImpl implements EmissionRepository {
  final FirebaseFirestore firestore;
  final Box<dynamic> emissionsBox;
  final NetworkInfo networkInfo;

  EmissionRepositoryImpl({
    required this.firestore,
    required this.emissionsBox,
    required this.networkInfo,
  });

  // ── Firestore Path Helpers ──────────────────────────────────
  CollectionReference<Map<String, dynamic>> _emissionsRef(String userId) =>
      firestore
          .collection(AppConstants.usersCollection)
          .doc(userId)
          .collection(AppConstants.emissionsSubCollection);

  // ── Date Key Helper ─────────────────────────────────────────
  String _dateKey(String userId, String date) => '${userId}_$date';

  @override
  Future<({List<EmissionLog> logs, Failure? error})> getEmissionsForDate(
    String userId,
    String date,
  ) async {
    try {
      // 1. Try local cache first
      final cacheKey = _dateKey(userId, date);
      final cachedData = emissionsBox.get(cacheKey);
      if (cachedData != null) {
        final List<dynamic> items = cachedData as List<dynamic>;
        final logs = items
            .map((item) => EmissionLog.fromMap(
                  Map<String, dynamic>.from(item as Map),
                  item['id'] as String? ?? '',
                ))
            .toList();
        return (logs: logs, error: null);
      }

      // 2. Fallback to Firestore
      if (await networkInfo.isConnected) {
        final snapshot = await _emissionsRef(userId)
            .where('loggedAt', isGreaterThanOrEqualTo: '${date}T00:00:00')
            .where('loggedAt', isLessThan: '${date}T23:59:59')
            .orderBy('loggedAt', descending: true)
            .get();

        final logs = snapshot.docs
            .map((doc) => EmissionLog.fromMap(doc.data(), doc.id))
            .toList();

        // Cache the result
        await emissionsBox.put(
          cacheKey,
          logs.map((l) => {...l.toMap(), 'id': l.id}).toList(),
        );

        return (logs: logs, error: null);
      }

      return (logs: <EmissionLog>[], error: null);
    } on FirebaseException catch (e) {
      return (
        logs: <EmissionLog>[],
        error: ServerFailure(message: e.message ?? 'Firestore error', code: e.code),
      );
    } on CacheException catch (e) {
      return (
        logs: <EmissionLog>[],
        error: CacheFailure(message: e.message),
      );
    }
  }

  @override
  Future<({List<EmissionLog> logs, Failure? error})> getEmissionsForRange(
    String userId,
    int days,
  ) async {
    try {
      final allLogs = <EmissionLog>[];
      final now = DateTime.now();

      for (int i = 0; i < days; i++) {
        final date = now.subtract(Duration(days: i));
        final dateStr =
            '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
        final result = await getEmissionsForDate(userId, dateStr);
        allLogs.addAll(result.logs);
      }

      return (logs: allLogs, error: null);
    } on Exception catch (e) {
      return (
        logs: <EmissionLog>[],
        error: CacheFailure(message: e.toString()),
      );
    }
  }

  @override
  Future<({EmissionLog? log, Failure? error})> addEmission(EmissionLog log) async {
    try {
      // 1. Write to Hive immediately (offline-first)
      final dateStr = '${log.loggedAt.year}-'
          '${log.loggedAt.month.toString().padLeft(2, '0')}-'
          '${log.loggedAt.day.toString().padLeft(2, '0')}';
      final cacheKey = _dateKey(log.userId, dateStr);

      final existingData = emissionsBox.get(cacheKey);
      final List<dynamic> items =
          existingData != null ? List<dynamic>.from(existingData as List) : [];
      items.add({...log.toMap(), 'id': log.id, '_synced': false});
      await emissionsBox.put(cacheKey, items);

      // 2. Sync to Firestore if online
      if (await networkInfo.isConnected) {
        await _emissionsRef(log.userId).doc(log.id).set(log.toMap());

        // Mark as synced in cache
        if (items.isNotEmpty) {
          final lastMap = Map<String, dynamic>.from(items.last as Map);
          lastMap['_synced'] = true;
          items[items.length - 1] = lastMap;
        }
        await emissionsBox.put(cacheKey, items);
      }

      return (log: log, error: null);
    } on FirebaseException catch (e) {
      // Still saved locally, just not synced
      return (
        log: log,
        error: ServerFailure(message: 'Saved locally. Sync pending: ${e.message}'),
      );
    } on Exception catch (e) {
      return (log: null, error: CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Failure?> deleteEmission(String userId, String logId) async {
    try {
      if (await networkInfo.isConnected) {
        await _emissionsRef(userId).doc(logId).delete();
      }
      return null;
    } on FirebaseException catch (e) {
      return ServerFailure(message: e.message ?? 'Delete failed', code: e.code);
    }
  }

  @override
  Future<double> getTotalForDate(String userId, String date) async {
    final result = await getEmissionsForDate(userId, date);
    return result.logs.fold<double>(0.0, (total, log) => total + log.co2eKg);
  }

  @override
  Future<Map<String, double>> getCategoryBreakdown(String userId, String date) async {
    final result = await getEmissionsForDate(userId, date);
    final breakdown = <String, double>{};
    for (final log in result.logs) {
      breakdown[log.category] = (breakdown[log.category] ?? 0) + log.co2eKg;
    }
    return breakdown;
  }

  @override
  Future<Failure?> syncToRemote(String userId) async {
    try {
      if (!await networkInfo.isConnected) {
        return const NetworkFailure();
      }

      // Find all unsynced entries across all date keys
      for (final key in emissionsBox.keys) {
        final keyStr = key.toString();
        if (!keyStr.startsWith(userId)) continue;

        final items = emissionsBox.get(key) as List<dynamic>?;
        if (items == null) continue;

        for (int i = 0; i < items.length; i++) {
          final item = items[i] as Map;
          if (item['_synced'] == false) {
            final logId = item['id'] as String? ?? '';
            if (logId.isNotEmpty) {
              final data = Map<String, dynamic>.from(item);
              data.remove('_synced');
              data.remove('id');
              await _emissionsRef(userId).doc(logId).set(data);
              items[i] = {...Map<String, dynamic>.from(item), '_synced': true};
            }
          }
        }
        await emissionsBox.put(key, items);
      }

      return null;
    } on FirebaseException catch (e) {
      return ServerFailure(message: e.message ?? 'Sync failed');
    }
  }
}
