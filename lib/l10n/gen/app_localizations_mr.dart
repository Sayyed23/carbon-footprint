// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Marathi (`mr`).
class AppLocalizationsMr extends AppLocalizations {
  AppLocalizationsMr([String locale = 'mr']) : super(locale);

  @override
  String get appTitle => 'इकोट्रेस';

  @override
  String get appTagline => 'मागोवा घ्या. कमी करा. भरभराट करा.';

  @override
  String get greeting => 'नमस्कार, इको रेसर 👋';

  @override
  String get yourCarbonFootprint => 'तुमचा कार्बन फूटप्रिंट';

  @override
  String get co2eToday => 'आजचे CO₂e';

  @override
  String budgetLabel(String budget) {
    return 'बजेट: $budget किग्रॅ';
  }

  @override
  String overBudgetAlert(String percent) {
    return 'सावधान: तुम्ही बजेटपेक्षा $percent% जास्त आहात';
  }

  @override
  String underBudgetMessage(String percent) {
    return 'छान! तुमच्याकडे $percent% बजेट शिल्लक आहे';
  }

  @override
  String streakDays(int count) {
    return '$count दिवस';
  }

  @override
  String get todaysTopAction => 'आजची प्रमुख कृती';

  @override
  String get categoryBreakdown => 'श्रेणी विभाजन';

  @override
  String get emissionTrend => '30-दिवसीय उत्सर्जन प्रवृत्ती';

  @override
  String get transport => 'वाहतूक';

  @override
  String get food => 'अन्न';

  @override
  String get energy => 'ऊर्जा';

  @override
  String get shopping => 'खरेदी';

  @override
  String get waste => 'कचरा';

  @override
  String get logCarbonFootprint => 'कार्बन फूटप्रिंट नोंदवा';

  @override
  String get scanReceipt => 'पावती स्कॅन करा';

  @override
  String get holdMicButton => 'माइक बटण धरा';

  @override
  String get voiceLog => 'व्हॉइस लॉग (जेमिनी लाइव्ह)';

  @override
  String get orManualLog => 'किंवा मॅन्युअल लॉग';

  @override
  String get addLogEntry => 'लॉग नोंद जोडा';

  @override
  String get selectVehicleType => 'वाहन प्रकार निवडा';

  @override
  String get distanceTravelled => 'प्रवास केलेले अंतर (किमी)';

  @override
  String get dietType => 'आहार / घटक प्रकार';

  @override
  String get quantity => 'प्रमाण (किग्रॅ)';

  @override
  String get utilityType => 'उपयोगिता प्रकार';

  @override
  String get consumptionValue => 'वापर मूल्य';

  @override
  String get geminiCoach => 'जेमिनी ग्रीन कोच';

  @override
  String get askGeminiCoach => 'जेमिनी कोचला विचारा...';

  @override
  String get geminiWriting => 'जेमिनी लिहित आहे...';

  @override
  String get socialChallenges => 'सामाजिक आणि आव्हाने';

  @override
  String get activeChallenges => 'सक्रिय आव्हाने';

  @override
  String get cityLeaderboard => 'शहर लीडरबोर्ड';

  @override
  String get achievementBadges => 'उपलब्धी बॅजेस';

  @override
  String get profileSettings => 'प्रोफाइल आणि सेटिंग्ज';

  @override
  String get personalTarget => 'वैयक्तिक लक्ष्य';

  @override
  String get dataConsentSettings => 'डेटा संमती सेटिंग्ज (DPDP कायदा)';

  @override
  String get bgLocationTracking => 'पार्श्वभूमी स्थान ट्रॅकिंग';

  @override
  String get anonymousSharing => 'अनामिक लोकसंख्या माहिती शेअरिंग';

  @override
  String get pushNotifications => 'पुश सूचना अलर्ट';

  @override
  String get personalDataActions => 'वैयक्तिक डेटा क्रिया';

  @override
  String get exportDataPacket => 'डेटा पॅकेट निर्यात करा';

  @override
  String get requestAccountDeletion => 'खाते हटवण्याची विनंती';

  @override
  String get logOut => 'बाहेर पडा';

  @override
  String get actionFeed => 'कृती फीड';

  @override
  String get offsetMarketplace => 'ऑफसेट प्रकल्प';

  @override
  String get loginTitle => 'ग्रीन फूटप्रिंट चळवळीत सामील व्हा';

  @override
  String get sendVerificationCode => 'सत्यापन कोड पाठवा';

  @override
  String get verifyAndContinue => 'सत्यापित करा आणि पुढे जा';

  @override
  String get resendCode => 'कोड पुन्हा पाठवा';

  @override
  String get continueWithGoogle => 'गूगलने सुरू ठेवा';

  @override
  String get mobileNumber => 'मोबाइल नंबर';

  @override
  String enterOtp(String phone) {
    return '+91 $phone वर पाठवलेला 6-अंकी OTP कोड प्रविष्ट करा';
  }
}
