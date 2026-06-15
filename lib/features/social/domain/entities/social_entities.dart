import 'package:equatable/equatable.dart';

/// Gamification badge entity.
class Badge extends Equatable {
  final String id;
  final String name;
  final String description;
  final String icon;
  final bool unlocked;
  final String? unlockedDate;

  const Badge({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    this.unlocked = false,
    this.unlockedDate,
  });

  factory Badge.fromMap(Map<String, dynamic> map) {
    return Badge(
      id: map['id'] as String? ?? '',
      name: map['name'] as String? ?? '',
      description: map['description'] as String? ?? '',
      icon: map['icon'] as String? ?? '🏅',
      unlocked: map['unlocked'] as bool? ?? false,
      unlockedDate: map['unlockedDate'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, name, description, icon, unlocked];
}

/// Community challenge entity.
class Challenge extends Equatable {
  final String id;
  final String title;
  final String description;
  final String icon;
  final int participantCount;
  final int durationDays;
  final double targetReductionPercent;
  final bool isActive;

  const Challenge({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    this.participantCount = 0,
    this.durationDays = 7,
    this.targetReductionPercent = 10.0,
    this.isActive = true,
  });

  factory Challenge.fromMap(Map<String, dynamic> map) {
    return Challenge(
      id: map['id'] as String? ?? '',
      title: map['title'] as String? ?? '',
      description: map['description'] as String? ?? '',
      icon: map['icon'] as String? ?? '🏆',
      participantCount: map['participantCount'] as int? ?? 0,
      durationDays: map['durationDays'] as int? ?? 7,
      targetReductionPercent: (map['targetReductionPercent'] as num?)?.toDouble() ?? 10.0,
      isActive: map['isActive'] as bool? ?? true,
    );
  }

  @override
  List<Object?> get props => [id, title, description, isActive];
}

/// Leaderboard entry entity.
class LeaderboardEntry extends Equatable {
  final int rank;
  final String name;
  final String city;
  final int points;
  final bool isCurrentUser;

  const LeaderboardEntry({
    required this.rank,
    required this.name,
    required this.city,
    required this.points,
    this.isCurrentUser = false,
  });

  factory LeaderboardEntry.fromMap(Map<String, dynamic> map) {
    return LeaderboardEntry(
      rank: map['rank'] as int? ?? 0,
      name: map['name'] as String? ?? '',
      city: map['city'] as String? ?? '',
      points: map['points'] as int? ?? 0,
      isCurrentUser: map['isCurrentUser'] as bool? ?? false,
    );
  }

  @override
  List<Object?> get props => [rank, name, city, points, isCurrentUser];
}
