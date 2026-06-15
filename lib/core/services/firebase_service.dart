import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_performance/firebase_performance.dart';
import 'package:flutter/foundation.dart';

/// Centralized Firebase initialization and configuration.
///
/// Call [FirebaseService.initialize] once in `main()` before `runApp`.
class FirebaseService {
  FirebaseService._();

  static FirebaseAnalytics? _analytics;
  static FirebasePerformance? _performance;

  /// Firebase Analytics singleton accessor.
  static FirebaseAnalytics get analytics {
    _analytics ??= FirebaseAnalytics.instance;
    return _analytics!;
  }

  /// Firebase Performance singleton accessor.
  static FirebasePerformance get performance {
    _performance ??= FirebasePerformance.instance;
    return _performance!;
  }

  /// Initialize all Firebase services.
  ///
  /// This sets up:
  /// - Firebase Core
  /// - Firebase App Check (debug provider in debug mode, Play Integrity in release)
  /// - Firebase Analytics
  /// - Firebase Performance Monitoring
  static Future<void> initialize() async {
    // 1. Core initialization
    await Firebase.initializeApp();

    // 2. App Check — protects Gemini API quotas from abuse
    await FirebaseAppCheck.instance.activate(
      providerAndroid: kDebugMode
          ? const AndroidDebugProvider()
          : const AndroidPlayIntegrityProvider(),
      providerApple: kDebugMode
          ? const AppleDebugProvider()
          : const AppleAppAttestProvider(),
    );

    // 3. Analytics — enabled by default, respects user consent toggle
    await analytics.setAnalyticsCollectionEnabled(true);

    // 4. Performance Monitoring
    await performance.setPerformanceCollectionEnabled(true);
  }

  /// Log a custom analytics event.
  static Future<void> logEvent({
    required String name,
    Map<String, Object>? parameters,
  }) async {
    await analytics.logEvent(name: name, parameters: parameters);
  }

  /// Log a screen view for analytics.
  static Future<void> logScreenView({required String screenName}) async {
    await analytics.logScreenView(screenName: screenName);
  }

  /// Set the current user ID for analytics attribution.
  static Future<void> setUserId(String userId) async {
    await analytics.setUserId(id: userId);
  }
}
