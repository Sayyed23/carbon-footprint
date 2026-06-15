import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../onboarding/domain/entities/user_profile.dart';
import '../../../onboarding/data/repositories/auth_repository_impl.dart';

// ── Events ────────────────────────────────────────────────────
abstract class ProfileEvent extends Equatable {
  const ProfileEvent();
  @override
  List<Object?> get props => [];
}

class LoadProfile extends ProfileEvent {
  final String userId;
  const LoadProfile(this.userId);
  @override
  List<Object?> get props => [userId];
}

class UpdateConsent extends ProfileEvent {
  final String consentType; // bgLocation, analytics, push
  final bool value;

  const UpdateConsent({required this.consentType, required this.value});
  @override
  List<Object?> get props => [consentType, value];
}

class ExportData extends ProfileEvent {
  final String userId;
  const ExportData(this.userId);
  @override
  List<Object?> get props => [userId];
}

class DeleteAccount extends ProfileEvent {}

class SignOut extends ProfileEvent {}

// ── States ────────────────────────────────────────────────────
abstract class ProfileState extends Equatable {
  const ProfileState();
  @override
  List<Object?> get props => [];
}

class ProfileInitial extends ProfileState {}

class ProfileLoading extends ProfileState {}

class ProfileLoaded extends ProfileState {
  final UserProfile profile;
  const ProfileLoaded(this.profile);
  @override
  List<Object?> get props => [profile];
}

class ProfileExporting extends ProfileState {}

class ProfileExported extends ProfileState {
  final String jsonData;
  const ProfileExported(this.jsonData);
  @override
  List<Object?> get props => [jsonData];
}

class ProfileDeleted extends ProfileState {}

class ProfileSignedOut extends ProfileState {}

class ProfileError extends ProfileState {
  final String message;
  const ProfileError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── BLoC ──────────────────────────────────────────────────────
class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final AuthRepository authRepository;
  UserProfile? _currentProfile;

  ProfileBloc({required this.authRepository}) : super(ProfileInitial()) {
    on<LoadProfile>(_onLoadProfile);
    on<UpdateConsent>(_onUpdateConsent);
    on<ExportData>(_onExportData);
    on<DeleteAccount>(_onDeleteAccount);
    on<SignOut>(_onSignOut);
  }

  Future<void> _onLoadProfile(
    LoadProfile event,
    Emitter<ProfileState> emit,
  ) async {
    emit(ProfileLoading());

    final profile = await authRepository.getUserProfile(event.userId);
    if (profile != null) {
      _currentProfile = profile;
      emit(ProfileLoaded(profile));
    } else {
      // Create default profile for demo
      _currentProfile = UserProfile(
        uid: event.userId,
        displayName: 'Karan Johar',
        email: 'karan.johar@ecotrace.in',
        city: 'Pune',
        streak: 7,
        totalEcoPoints: 1750,
        unlockedBadges: ['Train Tamer', 'Plant Pioneer'],
        createdAt: DateTime.now().subtract(const Duration(days: 30)),
        lastActiveAt: DateTime.now(),
      );
      emit(ProfileLoaded(_currentProfile!));
    }
  }

  Future<void> _onUpdateConsent(
    UpdateConsent event,
    Emitter<ProfileState> emit,
  ) async {
    if (_currentProfile == null) return;

    UserProfile updated;
    switch (event.consentType) {
      case 'bgLocation':
        updated = _currentProfile!.copyWith(bgLocationConsent: event.value);
      case 'analytics':
        updated = _currentProfile!.copyWith(anonymousAnalyticsConsent: event.value);
      case 'push':
        updated = _currentProfile!.copyWith(pushNotificationConsent: event.value);
      default:
        return;
    }

    _currentProfile = updated;
    await authRepository.saveUserProfile(updated);
    emit(ProfileLoaded(updated));
  }

  Future<void> _onExportData(
    ExportData event,
    Emitter<ProfileState> emit,
  ) async {
    emit(ProfileExporting());
    final result = await authRepository.exportUserData(event.userId);
    if (result.error != null) {
      emit(ProfileError(result.error!.message));
    } else {
      emit(ProfileExported(result.jsonData ?? '{}'));
    }
    // Restore profile state
    if (_currentProfile != null) {
      emit(ProfileLoaded(_currentProfile!));
    }
  }

  Future<void> _onDeleteAccount(
    DeleteAccount event,
    Emitter<ProfileState> emit,
  ) async {
    final error = await authRepository.deleteAccount();
    if (error != null) {
      emit(ProfileError(error.message));
    } else {
      emit(ProfileDeleted());
    }
  }

  Future<void> _onSignOut(
    SignOut event,
    Emitter<ProfileState> emit,
  ) async {
    await authRepository.signOut();
    emit(ProfileSignedOut());
  }
}
