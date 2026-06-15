import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/social_entities.dart';

// ── Events ────────────────────────────────────────────────────
abstract class SocialEvent extends Equatable {
  const SocialEvent();
  @override
  List<Object?> get props => [];
}

class LoadSocialData extends SocialEvent {}

class JoinChallenge extends SocialEvent {
  final String challengeId;
  const JoinChallenge(this.challengeId);
  @override
  List<Object?> get props => [challengeId];
}

// ── States ────────────────────────────────────────────────────
abstract class SocialState extends Equatable {
  const SocialState();
  @override
  List<Object?> get props => [];
}

class SocialInitial extends SocialState {}

class SocialLoading extends SocialState {}

class SocialLoaded extends SocialState {
  final List<Challenge> challenges;
  final List<LeaderboardEntry> leaderboard;
  final List<Badge> badges;

  const SocialLoaded({
    required this.challenges,
    required this.leaderboard,
    required this.badges,
  });

  @override
  List<Object?> get props => [challenges, leaderboard, badges];
}

class SocialError extends SocialState {
  final String message;
  const SocialError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── BLoC ──────────────────────────────────────────────────────
class SocialBloc extends Bloc<SocialEvent, SocialState> {
  SocialBloc() : super(SocialInitial()) {
    on<LoadSocialData>(_onLoadSocialData);
    on<JoinChallenge>(_onJoinChallenge);
  }

  Future<void> _onLoadSocialData(
    LoadSocialData event,
    Emitter<SocialState> emit,
  ) async {
    emit(SocialLoading());

    // In production, fetch from Firestore. Using typed entities with mock data:
    final challenges = [
      const Challenge(
        id: 'c1',
        title: 'No-Car Week Challenge',
        description: 'Avoid private vehicle use for 7 days and save 10+ kg CO₂e.',
        icon: '🚫🚗',
        participantCount: 1247,
        durationDays: 7,
        targetReductionPercent: 15.0,
      ),
      const Challenge(
        id: 'c2',
        title: 'Millet Monday Movement',
        description: 'Switch to millet-based meals every Monday for a month.',
        icon: '🌾',
        participantCount: 832,
        durationDays: 30,
        targetReductionPercent: 8.0,
      ),
      const Challenge(
        id: 'c3',
        title: 'Pune Metro Challenge',
        description: 'Log 5+ metro commutes this week to earn bonus EcoPoints.',
        icon: '🚇',
        participantCount: 4500,
        durationDays: 7,
        targetReductionPercent: 20.0,
      ),
    ];

    final leaderboard = [
      const LeaderboardEntry(rank: 1, name: 'Priya Sharma', city: 'Mumbai', points: 2450),
      const LeaderboardEntry(rank: 2, name: 'Arjun Reddy', city: 'Hyderabad', points: 2180),
      const LeaderboardEntry(rank: 3, name: 'Sneha Patel', city: 'Ahmedabad', points: 1920),
      const LeaderboardEntry(rank: 4, name: 'Karan Johar', city: 'Pune', points: 1750, isCurrentUser: true),
      const LeaderboardEntry(rank: 5, name: 'Neha Gupta', city: 'Delhi', points: 1580),
    ];

    final badges = [
      const Badge(id: 'b1', name: 'Train Tamer', description: 'Logged 10 public transport trips', icon: '🚆', unlocked: true),
      const Badge(id: 'b2', name: 'Plant Pioneer', description: 'Chose plant-based meals for 7 days', icon: '🌱', unlocked: true),
      const Badge(id: 'b3', name: 'Solar Saver', description: 'Zero grid energy for 3 consecutive days', icon: '☀️', unlocked: false),
      const Badge(id: 'b4', name: 'Streak Master', description: '30-day under-budget streak', icon: '🔥', unlocked: false),
      const Badge(id: 'b5', name: 'Eco Warrior', description: 'Reduced footprint by 30% in one month', icon: '🛡️', unlocked: false),
      const Badge(id: 'b6', name: 'Zero Waste Hero', description: 'All waste composted for 14 days', icon: '♻️', unlocked: false),
    ];

    emit(SocialLoaded(
      challenges: challenges,
      leaderboard: leaderboard,
      badges: badges,
    ));
  }

  Future<void> _onJoinChallenge(
    JoinChallenge event,
    Emitter<SocialState> emit,
  ) async {
    // In production, write to Firestore challenge participants
    final currentState = state;
    if (currentState is SocialLoaded) {
      emit(SocialLoaded(
        challenges: currentState.challenges,
        leaderboard: currentState.leaderboard,
        badges: currentState.badges,
      ));
    }
  }
}
