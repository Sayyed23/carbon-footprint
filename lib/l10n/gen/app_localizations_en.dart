// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'EcoTrace';

  @override
  String get appTagline => 'Track. Reduce. Thrive.';

  @override
  String get greeting => 'Namaste, Eco Racer 👋';

  @override
  String get yourCarbonFootprint => 'Your Carbon Footprint';

  @override
  String get co2eToday => 'CO₂e Today';

  @override
  String budgetLabel(String budget) {
    return 'Budget: $budget kg';
  }

  @override
  String overBudgetAlert(String percent) {
    return 'Alert: You are $percent% above budget';
  }

  @override
  String underBudgetMessage(String percent) {
    return 'Great job! You have $percent% budget left';
  }

  @override
  String streakDays(int count) {
    return '$count Days';
  }

  @override
  String get todaysTopAction => 'Today\'s Top Action';

  @override
  String get categoryBreakdown => 'Category Breakdown';

  @override
  String get emissionTrend => '30-Day Emission Trend';

  @override
  String get transport => 'Transport';

  @override
  String get food => 'Food';

  @override
  String get energy => 'Energy';

  @override
  String get shopping => 'Shopping';

  @override
  String get waste => 'Waste';

  @override
  String get logCarbonFootprint => 'Log Carbon Footprint';

  @override
  String get scanReceipt => 'Scan Receipt';

  @override
  String get holdMicButton => 'Hold Mic Button';

  @override
  String get voiceLog => 'Voice Log (Gemini Live)';

  @override
  String get orManualLog => 'OR MANUAL LOG';

  @override
  String get addLogEntry => 'Add Log Entry';

  @override
  String get selectVehicleType => 'Select Vehicle Type';

  @override
  String get distanceTravelled => 'Distance Travelled (km)';

  @override
  String get dietType => 'Diet / Ingredient Type';

  @override
  String get quantity => 'Quantity (kg)';

  @override
  String get utilityType => 'Utility Type';

  @override
  String get consumptionValue => 'Consumption Value';

  @override
  String get geminiCoach => 'Gemini Green Coach';

  @override
  String get askGeminiCoach => 'Ask Gemini Coach...';

  @override
  String get geminiWriting => 'Gemini is writing...';

  @override
  String get socialChallenges => 'Social & Challenges';

  @override
  String get activeChallenges => 'Active Challenges';

  @override
  String get cityLeaderboard => 'City Leaderboard';

  @override
  String get achievementBadges => 'Achievement Badges';

  @override
  String get profileSettings => 'Profile & Settings';

  @override
  String get personalTarget => 'Personal Target';

  @override
  String get dataConsentSettings => 'Data Consent Settings (DPDP Act)';

  @override
  String get bgLocationTracking => 'Background Location Tracking';

  @override
  String get anonymousSharing => 'Anonymous Demographic Sharing';

  @override
  String get pushNotifications => 'Push Notification Alerts';

  @override
  String get personalDataActions => 'Personal Data Actions';

  @override
  String get exportDataPacket => 'Export Data Packet';

  @override
  String get requestAccountDeletion => 'Request Account Deletion';

  @override
  String get logOut => 'Log Out';

  @override
  String get actionFeed => 'Action Feed';

  @override
  String get offsetMarketplace => 'Offset Projects';

  @override
  String get loginTitle => 'Join the Green Footprint Movement';

  @override
  String get sendVerificationCode => 'Send Verification Code';

  @override
  String get verifyAndContinue => 'Verify & Continue';

  @override
  String get resendCode => 'Resend Code';

  @override
  String get continueWithGoogle => 'Continue with Google';

  @override
  String get mobileNumber => 'Mobile Number';

  @override
  String enterOtp(String phone) {
    return 'Enter the 6-digit OTP code sent to +91 $phone';
  }
}
