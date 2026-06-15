/// Exception thrown when a server/API call fails.
class ServerException implements Exception {
  final String message;
  final String? code;
  const ServerException({required this.message, this.code});

  @override
  String toString() => 'ServerException: $message (code: $code)';
}

/// Exception thrown when local cache operations fail.
class CacheException implements Exception {
  final String message;
  const CacheException({required this.message});

  @override
  String toString() => 'CacheException: $message';
}

/// Exception thrown when Firebase Auth operations fail.
class AuthException implements Exception {
  final String message;
  final String? code;
  const AuthException({required this.message, this.code});

  @override
  String toString() => 'AuthException: $message (code: $code)';
}

/// Exception thrown when network is unavailable.
class NetworkException implements Exception {
  final String message;
  const NetworkException({this.message = 'No internet connection'});

  @override
  String toString() => 'NetworkException: $message';
}

/// Exception thrown when Gemini AI calls fail.
class AiException implements Exception {
  final String message;
  final String? code;
  const AiException({required this.message, this.code});

  @override
  String toString() => 'AiException: $message (code: $code)';
}
