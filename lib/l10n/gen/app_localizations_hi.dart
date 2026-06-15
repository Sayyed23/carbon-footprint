// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Hindi (`hi`).
class AppLocalizationsHi extends AppLocalizations {
  AppLocalizationsHi([String locale = 'hi']) : super(locale);

  @override
  String get appTitle => 'ईकोट्रेस';

  @override
  String get appTagline => 'ट्रैक करें। कम करें। विकास करें।';

  @override
  String get greeting => 'नमस्ते, इको रेसर 👋';

  @override
  String get yourCarbonFootprint => 'आपका कार्बन फुटप्रिंट';

  @override
  String get co2eToday => 'आज CO₂e';

  @override
  String budgetLabel(String budget) {
    return 'बजट: $budget किग्रा';
  }

  @override
  String overBudgetAlert(String percent) {
    return 'चेतावनी: आप बजट से $percent% ऊपर हैं';
  }

  @override
  String underBudgetMessage(String percent) {
    return 'शाबाश! आपके पास $percent% बजट बाकी है';
  }

  @override
  String streakDays(int count) {
    return '$count दिन';
  }

  @override
  String get todaysTopAction => 'आज की शीर्ष कार्रवाई';

  @override
  String get categoryBreakdown => 'श्रेणी विभाजन';

  @override
  String get emissionTrend => '30-दिवसीय उत्सर्जन प्रवृत्ति';

  @override
  String get transport => 'परिवहन';

  @override
  String get food => 'भोजन';

  @override
  String get energy => 'ऊर्जा';

  @override
  String get shopping => 'खरीदारी';

  @override
  String get waste => 'कचरा';

  @override
  String get logCarbonFootprint => 'कार्बन फुटप्रिंट लॉग करें';

  @override
  String get scanReceipt => 'रसीद स्कैन करें';

  @override
  String get holdMicButton => 'माइक बटन दबाएं';

  @override
  String get voiceLog => 'वॉइस लॉग (जेमिनी लाइव)';

  @override
  String get orManualLog => 'या मैनुअल लॉग';

  @override
  String get addLogEntry => 'लॉग प्रविष्टि जोड़ें';

  @override
  String get selectVehicleType => 'वाहन प्रकार चुनें';

  @override
  String get distanceTravelled => 'तय की गई दूरी (किमी)';

  @override
  String get dietType => 'आहार / सामग्री प्रकार';

  @override
  String get quantity => 'मात्रा (किग्रा)';

  @override
  String get utilityType => 'उपयोगिता प्रकार';

  @override
  String get consumptionValue => 'खपत मूल्य';

  @override
  String get geminiCoach => 'जेमिनी ग्रीन कोच';

  @override
  String get askGeminiCoach => 'जेमिनी कोच से पूछें...';

  @override
  String get geminiWriting => 'जेमिनी लिख रहा है...';

  @override
  String get socialChallenges => 'सामाजिक और चुनौतियाँ';

  @override
  String get activeChallenges => 'सक्रिय चुनौतियाँ';

  @override
  String get cityLeaderboard => 'शहर लीडरबोर्ड';

  @override
  String get achievementBadges => 'उपलब्धि बैज';

  @override
  String get profileSettings => 'प्रोफ़ाइल और सेटिंग्स';

  @override
  String get personalTarget => 'व्यक्तिगत लक्ष्य';

  @override
  String get dataConsentSettings => 'डेटा सहमति सेटिंग्स (DPDP अधिनियम)';

  @override
  String get bgLocationTracking => 'बैकग्राउंड लोकेशन ट्रैकिंग';

  @override
  String get anonymousSharing => 'अनाम जनसांख्यिकीय साझाकरण';

  @override
  String get pushNotifications => 'पुश नोटिफ़िकेशन अलर्ट';

  @override
  String get personalDataActions => 'व्यक्तिगत डेटा कार्रवाइयाँ';

  @override
  String get exportDataPacket => 'डेटा पैकेट निर्यात करें';

  @override
  String get requestAccountDeletion => 'खाता हटाने का अनुरोध';

  @override
  String get logOut => 'लॉग आउट';

  @override
  String get actionFeed => 'कार्य फ़ीड';

  @override
  String get offsetMarketplace => 'ऑफसेट परियोजनाएँ';

  @override
  String get loginTitle => 'ग्रीन फुटप्रिंट आंदोलन में शामिल हों';

  @override
  String get sendVerificationCode => 'सत्यापन कोड भेजें';

  @override
  String get verifyAndContinue => 'सत्यापित करें और जारी रखें';

  @override
  String get resendCode => 'कोड पुनः भेजें';

  @override
  String get continueWithGoogle => 'गूगल से जारी रखें';

  @override
  String get mobileNumber => 'मोबाइल नंबर';

  @override
  String enterOtp(String phone) {
    return '+91 $phone पर भेजे गए 6-अंकीय OTP कोड दर्ज करें';
  }
}
