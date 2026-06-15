import 'package:equatable/equatable.dart';

/// Base failure class for typed error handling across the app.
///
/// Each failure contains a human-readable [message] for UI display
/// and an optional [code] for programmatic branching.
abstract class Failure extends Equatable {
  final String message;
  final String? code;

  const Failure({required this.message, this.code});

  @override
  List<Object?> get props => [message, code];
}

/// Failure originating from Firebase / network calls.
class ServerFailure extends Failure {
  const ServerFailure({required super.message, super.code});
}

/// Failure originating from local Hive cache operations.
class CacheFailure extends Failure {
  const CacheFailure({required super.message, super.code});
}

/// Failure originating from Firebase Auth operations.
class AuthFailure extends Failure {
  const AuthFailure({required super.message, super.code});
}

/// Failure originating from network connectivity issues.
class NetworkFailure extends Failure {
  const NetworkFailure({
    super.message = 'No internet connection. Please check your network.',
    super.code,
  });
}

/// Failure originating from Gemini AI API calls.
class AiFailure extends Failure {
  const AiFailure({required super.message, super.code});
}

/// Failure originating from input validation.
class ValidationFailure extends Failure {
  const ValidationFailure({required super.message, super.code});
}

/// Failure originating from permission denials (location, camera, etc.).
class PermissionFailure extends Failure {
  const PermissionFailure({required super.message, super.code});
}
