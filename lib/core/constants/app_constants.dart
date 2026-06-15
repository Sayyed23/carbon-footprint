/// Application-wide constants for EcoTrace.
library;

class AppConstants {
  AppConstants._();

  // ── App Metadata ────────────────────────────────────────────
  static const String appName = 'EcoTrace';
  static const String appVersion = '1.0.0';
  static const String appTagline = 'Track. Reduce. Thrive.';

  // ── Daily Carbon Budget (kg CO₂e) ──────────────────────────
  static const double defaultDailyBudget = 5.2;
  static const double aggressiveDailyBudget = 3.5;
  static const double relaxedDailyBudget = 7.0;

  // ── India Average (for benchmarking) ────────────────────────
  static const double indiaPerCapitaDailyAvg = 5.3; // kg CO₂e/day

  // ── Cache Configuration ─────────────────────────────────────
  static const int cacheRetentionDays = 7;
  static const String emissionsBoxName = 'emissionsBox';
  static const String settingsBoxName = 'settingsBox';
  static const String userProfileBoxName = 'userProfileBox';
  static const String emissionFactorsBoxName = 'emissionFactorsBox';

  // ── Firestore Collection Paths ──────────────────────────────
  static const String usersCollection = 'users';
  static const String emissionsSubCollection = 'emissions';
  static const String emissionFactorsCollection = 'emissionFactors';
  static const String challengesCollection = 'challenges';
  static const String leaderboardCollection = 'leaderboard';
  static const String badgesCollection = 'badges';

  // ── Gamification ────────────────────────────────────────────
  static const int ecoPointsManualLog = 20;
  static const int ecoPointsReceiptScan = 25;
  static const int ecoPointsVoiceLog = 25;
  static const int ecoPointsStreakBonus = 50;
  static const int ecoPointsChallengeWin = 100;

  // ── Gemini AI ───────────────────────────────────────────────
  static const int geminiMaxTokens = 2048;
  static const double geminiTemperature = 0.7;
  static const String geminiSystemPrompt = '''
You are EcoTrace Gemini Coach, an AI sustainability advisor specializing in India's
carbon footprint landscape. You help users understand and reduce their personal
carbon emissions using India-specific data (BEE, IPCC, CEA 2025 emission factors).

Key guidelines:
- Always use India-localized emission factors and examples
- Suggest practical, actionable advice relevant to Indian cities
- Reference Indian public transport (Metro, BEST bus, auto-rickshaw)
- Mention Indian food items (dal, millets, paneer vs chicken)
- Be encouraging and gamify achievements with EcoPoints
- Format responses with emojis for visual engagement
- Keep responses under 200 words unless asked for detail
''';

  // ── Accessibility ───────────────────────────────────────────
  static const double minTouchTarget = 48.0; // dp
  static const double maxFontScaleFactor = 2.0;

  // ── Quiz Configuration ──────────────────────────────────────
  static const int quizQuestionCount = 5;
}
