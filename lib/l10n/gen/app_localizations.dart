import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_hi.dart';
import 'app_localizations_mr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'gen/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('hi'),
    Locale('mr'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'EcoTrace'**
  String get appTitle;

  /// No description provided for @appTagline.
  ///
  /// In en, this message translates to:
  /// **'Track. Reduce. Thrive.'**
  String get appTagline;

  /// No description provided for @greeting.
  ///
  /// In en, this message translates to:
  /// **'Namaste, Eco Racer 👋'**
  String get greeting;

  /// No description provided for @yourCarbonFootprint.
  ///
  /// In en, this message translates to:
  /// **'Your Carbon Footprint'**
  String get yourCarbonFootprint;

  /// No description provided for @co2eToday.
  ///
  /// In en, this message translates to:
  /// **'CO₂e Today'**
  String get co2eToday;

  /// No description provided for @budgetLabel.
  ///
  /// In en, this message translates to:
  /// **'Budget: {budget} kg'**
  String budgetLabel(String budget);

  /// No description provided for @overBudgetAlert.
  ///
  /// In en, this message translates to:
  /// **'Alert: You are {percent}% above budget'**
  String overBudgetAlert(String percent);

  /// No description provided for @underBudgetMessage.
  ///
  /// In en, this message translates to:
  /// **'Great job! You have {percent}% budget left'**
  String underBudgetMessage(String percent);

  /// No description provided for @streakDays.
  ///
  /// In en, this message translates to:
  /// **'{count} Days'**
  String streakDays(int count);

  /// No description provided for @todaysTopAction.
  ///
  /// In en, this message translates to:
  /// **'Today\'s Top Action'**
  String get todaysTopAction;

  /// No description provided for @categoryBreakdown.
  ///
  /// In en, this message translates to:
  /// **'Category Breakdown'**
  String get categoryBreakdown;

  /// No description provided for @emissionTrend.
  ///
  /// In en, this message translates to:
  /// **'30-Day Emission Trend'**
  String get emissionTrend;

  /// No description provided for @transport.
  ///
  /// In en, this message translates to:
  /// **'Transport'**
  String get transport;

  /// No description provided for @food.
  ///
  /// In en, this message translates to:
  /// **'Food'**
  String get food;

  /// No description provided for @energy.
  ///
  /// In en, this message translates to:
  /// **'Energy'**
  String get energy;

  /// No description provided for @shopping.
  ///
  /// In en, this message translates to:
  /// **'Shopping'**
  String get shopping;

  /// No description provided for @waste.
  ///
  /// In en, this message translates to:
  /// **'Waste'**
  String get waste;

  /// No description provided for @logCarbonFootprint.
  ///
  /// In en, this message translates to:
  /// **'Log Carbon Footprint'**
  String get logCarbonFootprint;

  /// No description provided for @scanReceipt.
  ///
  /// In en, this message translates to:
  /// **'Scan Receipt'**
  String get scanReceipt;

  /// No description provided for @holdMicButton.
  ///
  /// In en, this message translates to:
  /// **'Hold Mic Button'**
  String get holdMicButton;

  /// No description provided for @voiceLog.
  ///
  /// In en, this message translates to:
  /// **'Voice Log (Gemini Live)'**
  String get voiceLog;

  /// No description provided for @orManualLog.
  ///
  /// In en, this message translates to:
  /// **'OR MANUAL LOG'**
  String get orManualLog;

  /// No description provided for @addLogEntry.
  ///
  /// In en, this message translates to:
  /// **'Add Log Entry'**
  String get addLogEntry;

  /// No description provided for @selectVehicleType.
  ///
  /// In en, this message translates to:
  /// **'Select Vehicle Type'**
  String get selectVehicleType;

  /// No description provided for @distanceTravelled.
  ///
  /// In en, this message translates to:
  /// **'Distance Travelled (km)'**
  String get distanceTravelled;

  /// No description provided for @dietType.
  ///
  /// In en, this message translates to:
  /// **'Diet / Ingredient Type'**
  String get dietType;

  /// No description provided for @quantity.
  ///
  /// In en, this message translates to:
  /// **'Quantity (kg)'**
  String get quantity;

  /// No description provided for @utilityType.
  ///
  /// In en, this message translates to:
  /// **'Utility Type'**
  String get utilityType;

  /// No description provided for @consumptionValue.
  ///
  /// In en, this message translates to:
  /// **'Consumption Value'**
  String get consumptionValue;

  /// No description provided for @geminiCoach.
  ///
  /// In en, this message translates to:
  /// **'Gemini Green Coach'**
  String get geminiCoach;

  /// No description provided for @askGeminiCoach.
  ///
  /// In en, this message translates to:
  /// **'Ask Gemini Coach...'**
  String get askGeminiCoach;

  /// No description provided for @geminiWriting.
  ///
  /// In en, this message translates to:
  /// **'Gemini is writing...'**
  String get geminiWriting;

  /// No description provided for @socialChallenges.
  ///
  /// In en, this message translates to:
  /// **'Social & Challenges'**
  String get socialChallenges;

  /// No description provided for @activeChallenges.
  ///
  /// In en, this message translates to:
  /// **'Active Challenges'**
  String get activeChallenges;

  /// No description provided for @cityLeaderboard.
  ///
  /// In en, this message translates to:
  /// **'City Leaderboard'**
  String get cityLeaderboard;

  /// No description provided for @achievementBadges.
  ///
  /// In en, this message translates to:
  /// **'Achievement Badges'**
  String get achievementBadges;

  /// No description provided for @profileSettings.
  ///
  /// In en, this message translates to:
  /// **'Profile & Settings'**
  String get profileSettings;

  /// No description provided for @personalTarget.
  ///
  /// In en, this message translates to:
  /// **'Personal Target'**
  String get personalTarget;

  /// No description provided for @dataConsentSettings.
  ///
  /// In en, this message translates to:
  /// **'Data Consent Settings (DPDP Act)'**
  String get dataConsentSettings;

  /// No description provided for @bgLocationTracking.
  ///
  /// In en, this message translates to:
  /// **'Background Location Tracking'**
  String get bgLocationTracking;

  /// No description provided for @anonymousSharing.
  ///
  /// In en, this message translates to:
  /// **'Anonymous Demographic Sharing'**
  String get anonymousSharing;

  /// No description provided for @pushNotifications.
  ///
  /// In en, this message translates to:
  /// **'Push Notification Alerts'**
  String get pushNotifications;

  /// No description provided for @personalDataActions.
  ///
  /// In en, this message translates to:
  /// **'Personal Data Actions'**
  String get personalDataActions;

  /// No description provided for @exportDataPacket.
  ///
  /// In en, this message translates to:
  /// **'Export Data Packet'**
  String get exportDataPacket;

  /// No description provided for @requestAccountDeletion.
  ///
  /// In en, this message translates to:
  /// **'Request Account Deletion'**
  String get requestAccountDeletion;

  /// No description provided for @logOut.
  ///
  /// In en, this message translates to:
  /// **'Log Out'**
  String get logOut;

  /// No description provided for @actionFeed.
  ///
  /// In en, this message translates to:
  /// **'Action Feed'**
  String get actionFeed;

  /// No description provided for @offsetMarketplace.
  ///
  /// In en, this message translates to:
  /// **'Offset Projects'**
  String get offsetMarketplace;

  /// No description provided for @loginTitle.
  ///
  /// In en, this message translates to:
  /// **'Join the Green Footprint Movement'**
  String get loginTitle;

  /// No description provided for @sendVerificationCode.
  ///
  /// In en, this message translates to:
  /// **'Send Verification Code'**
  String get sendVerificationCode;

  /// No description provided for @verifyAndContinue.
  ///
  /// In en, this message translates to:
  /// **'Verify & Continue'**
  String get verifyAndContinue;

  /// No description provided for @resendCode.
  ///
  /// In en, this message translates to:
  /// **'Resend Code'**
  String get resendCode;

  /// No description provided for @continueWithGoogle.
  ///
  /// In en, this message translates to:
  /// **'Continue with Google'**
  String get continueWithGoogle;

  /// No description provided for @mobileNumber.
  ///
  /// In en, this message translates to:
  /// **'Mobile Number'**
  String get mobileNumber;

  /// No description provided for @enterOtp.
  ///
  /// In en, this message translates to:
  /// **'Enter the 6-digit OTP code sent to +91 {phone}'**
  String enterOtp(String phone);
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'hi', 'mr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'hi':
      return AppLocalizationsHi();
    case 'mr':
      return AppLocalizationsMr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
