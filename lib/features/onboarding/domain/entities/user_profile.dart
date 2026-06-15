import 'package:equatable/equatable.dart';

/// User profile entity containing quiz results, settings, and gamification state.
class UserProfile extends Equatable {
  final String uid;
  final String displayName;
  final String email;
  final String phone;
  final String city;
  final double dailyBudgetKg;
  final int streak;
  final int totalEcoPoints;
  final List<String> unlockedBadges;
  final Map<String, dynamic> quizAnswers;
  final DateTime createdAt;
  final DateTime lastActiveAt;

  // DPDP Act consent toggles
  final bool bgLocationConsent;
  final bool anonymousAnalyticsConsent;
  final bool pushNotificationConsent;

  const UserProfile({
    required this.uid,
    required this.displayName,
    required this.email,
    this.phone = '',
    this.city = 'Mumbai',
    this.dailyBudgetKg = 5.2,
    this.streak = 0,
    this.totalEcoPoints = 0,
    this.unlockedBadges = const [],
    this.quizAnswers = const {},
    required this.createdAt,
    required this.lastActiveAt,
    this.bgLocationConsent = true,
    this.anonymousAnalyticsConsent = true,
    this.pushNotificationConsent = true,
  });

  factory UserProfile.fromMap(Map<String, dynamic> map, String uid) {
    return UserProfile(
      uid: uid,
      displayName: map['displayName'] as String? ?? '',
      email: map['email'] as String? ?? '',
      phone: map['phone'] as String? ?? '',
      city: map['city'] as String? ?? 'Mumbai',
      dailyBudgetKg: (map['dailyBudgetKg'] as num?)?.toDouble() ?? 5.2,
      streak: map['streak'] as int? ?? 0,
      totalEcoPoints: map['totalEcoPoints'] as int? ?? 0,
      unlockedBadges: List<String>.from(map['unlockedBadges'] as List? ?? []),
      quizAnswers: Map<String, dynamic>.from(map['quizAnswers'] as Map? ?? {}),
      createdAt: map['createdAt'] != null
          ? DateTime.parse(map['createdAt'] as String)
          : DateTime.now(),
      lastActiveAt: map['lastActiveAt'] != null
          ? DateTime.parse(map['lastActiveAt'] as String)
          : DateTime.now(),
      bgLocationConsent: map['bgLocationConsent'] as bool? ?? true,
      anonymousAnalyticsConsent: map['anonymousAnalyticsConsent'] as bool? ?? true,
      pushNotificationConsent: map['pushNotificationConsent'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'displayName': displayName,
      'email': email,
      'phone': phone,
      'city': city,
      'dailyBudgetKg': dailyBudgetKg,
      'streak': streak,
      'totalEcoPoints': totalEcoPoints,
      'unlockedBadges': unlockedBadges,
      'quizAnswers': quizAnswers,
      'createdAt': createdAt.toIso8601String(),
      'lastActiveAt': lastActiveAt.toIso8601String(),
      'bgLocationConsent': bgLocationConsent,
      'anonymousAnalyticsConsent': anonymousAnalyticsConsent,
      'pushNotificationConsent': pushNotificationConsent,
    };
  }

  UserProfile copyWith({
    String? displayName,
    String? email,
    String? phone,
    String? city,
    double? dailyBudgetKg,
    int? streak,
    int? totalEcoPoints,
    List<String>? unlockedBadges,
    Map<String, dynamic>? quizAnswers,
    DateTime? lastActiveAt,
    bool? bgLocationConsent,
    bool? anonymousAnalyticsConsent,
    bool? pushNotificationConsent,
  }) {
    return UserProfile(
      uid: uid,
      displayName: displayName ?? this.displayName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      city: city ?? this.city,
      dailyBudgetKg: dailyBudgetKg ?? this.dailyBudgetKg,
      streak: streak ?? this.streak,
      totalEcoPoints: totalEcoPoints ?? this.totalEcoPoints,
      unlockedBadges: unlockedBadges ?? this.unlockedBadges,
      quizAnswers: quizAnswers ?? this.quizAnswers,
      createdAt: createdAt,
      lastActiveAt: lastActiveAt ?? this.lastActiveAt,
      bgLocationConsent: bgLocationConsent ?? this.bgLocationConsent,
      anonymousAnalyticsConsent: anonymousAnalyticsConsent ?? this.anonymousAnalyticsConsent,
      pushNotificationConsent: pushNotificationConsent ?? this.pushNotificationConsent,
    );
  }

  @override
  List<Object?> get props => [
        uid, displayName, email, phone, city, dailyBudgetKg,
        streak, totalEcoPoints, unlockedBadges, quizAnswers,
        createdAt, lastActiveAt, bgLocationConsent,
        anonymousAnalyticsConsent, pushNotificationConsent,
      ];
}
