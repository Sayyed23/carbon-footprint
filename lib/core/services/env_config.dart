import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Typed wrapper around `flutter_dotenv` for compile-time safe access
/// to environment variables.
///
/// Call [EnvConfig.initialize] before accessing any properties.
class EnvConfig {
  EnvConfig._();

  /// Load the `.env` file. Must be called in `main()` before `runApp`.
  static Future<void> initialize() async {
    await dotenv.load(fileName: '.env');
  }

  // ── Firebase ────────────────────────────────────────────────
  static String get firebaseProjectId =>
      dotenv.env['FIREBASE_PROJECT_ID'] ?? '';

  static String get firebaseWebApiKey =>
      dotenv.env['FIREBASE_WEB_API_KEY'] ?? '';

  static String get firebaseAppId =>
      dotenv.env['FIREBASE_APP_ID'] ?? '';

  // ── Gemini AI ───────────────────────────────────────────────
  static String get geminiModelPro =>
      dotenv.env['GEMINI_MODEL_PRO'] ?? 'gemini-2.5-flash';

  static String get geminiModelFlash =>
      dotenv.env['GEMINI_MODEL_FLASH'] ?? 'gemini-2.0-flash';

  // ── App Check ───────────────────────────────────────────────
  static String get appCheckDebugToken =>
      dotenv.env['FIREBASE_APP_CHECK_DEBUG_TOKEN'] ?? '';

  // ── Google Maps ─────────────────────────────────────────────
  static String get googleMapsApiKey =>
      dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '';

  // ── Feature Flags ───────────────────────────────────────────
  static bool get enableVoiceLogging =>
      dotenv.env['ENABLE_VOICE_LOGGING']?.toLowerCase() == 'true';

  static bool get enableReceiptScan =>
      dotenv.env['ENABLE_RECEIPT_SCAN']?.toLowerCase() == 'true';

  static bool get enableOfflineMode =>
      dotenv.env['ENABLE_OFFLINE_MODE']?.toLowerCase() == 'true';

  // ── Emission Factors ────────────────────────────────────────
  static String get emissionFactorsVersion =>
      dotenv.env['EMISSION_FACTORS_VERSION'] ?? '2025.1';

  static String get emissionFactorsCollection =>
      dotenv.env['EMISSION_FACTORS_COLLECTION'] ?? 'emissionFactors';
}
