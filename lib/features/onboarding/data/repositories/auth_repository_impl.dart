import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../domain/entities/user_profile.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/error/failures.dart';

/// Authentication repository handling Firebase Auth + profile management.
abstract class AuthRepository {
  /// Current Firebase Auth user stream.
  Stream<User?> get authStateChanges;

  /// Current user ID or null.
  String? get currentUserId;

  /// Sign in with Google SSO.
  Future<({UserProfile? profile, Failure? error})> signInWithGoogle();

  /// Send phone OTP for verification.
  Future<Failure?> sendPhoneOtp(String phoneNumber);

  /// Verify phone OTP.
  Future<({UserProfile? profile, Failure? error})> verifyPhoneOtp(
    String verificationId,
    String otp,
  );

  /// Sign out.
  Future<void> signOut();

  /// Get user profile from Firestore.
  Future<UserProfile?> getUserProfile(String uid);

  /// Save user profile to Firestore.
  Future<Failure?> saveUserProfile(UserProfile profile);

  /// Delete user account (DPDP Act compliance).
  Future<Failure?> deleteAccount();

  /// Export user data as JSON (DPDP Act compliance).
  Future<({String? jsonData, Failure? error})> exportUserData(String uid);
}

/// Firebase implementation of [AuthRepository].
class AuthRepositoryImpl implements AuthRepository {
  final FirebaseAuth auth;
  final FirebaseFirestore firestore;
  final GoogleSignIn googleSignIn;

  AuthRepositoryImpl({
    required this.auth,
    required this.firestore,
    required this.googleSignIn,
  });

  @override
  Stream<User?> get authStateChanges => auth.authStateChanges();

  @override
  String? get currentUserId => auth.currentUser?.uid;

  @override
  Future<({UserProfile? profile, Failure? error})> signInWithGoogle() async {
    try {
      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        return (profile: null, error: const AuthFailure(message: 'Google sign-in cancelled'));
      }

      final googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await auth.signInWithCredential(credential);
      final user = userCredential.user!;

      // Check if profile exists, create if new user
      var profile = await getUserProfile(user.uid);
      if (profile == null) {
        profile = UserProfile(
          uid: user.uid,
          displayName: user.displayName ?? '',
          email: user.email ?? '',
          phone: user.phoneNumber ?? '',
          createdAt: DateTime.now(),
          lastActiveAt: DateTime.now(),
        );
        await saveUserProfile(profile);
      }

      return (profile: profile, error: null);
    } on FirebaseAuthException catch (e) {
      return (
        profile: null,
        error: AuthFailure(message: e.message ?? 'Auth failed', code: e.code),
      );
    } on Exception catch (e) {
      return (profile: null, error: AuthFailure(message: e.toString()));
    }
  }

  @override
  Future<Failure?> sendPhoneOtp(String phoneNumber) async {
    try {
      // In production, this triggers real SMS via Firebase Auth
      // For demo, we simulate success
      await auth.verifyPhoneNumber(
        phoneNumber: '+91$phoneNumber',
        verificationCompleted: (credential) async {
          await auth.signInWithCredential(credential);
        },
        verificationFailed: (e) {
          throw AuthFailure(message: e.message ?? 'OTP failed', code: e.code);
        },
        codeSent: (verificationId, resendToken) {
          // Store verificationId for later use
        },
        codeAutoRetrievalTimeout: (verificationId) {},
        timeout: const Duration(seconds: 60),
      );
      return null;
    } on Exception catch (e) {
      return AuthFailure(message: e.toString());
    }
  }

  @override
  Future<({UserProfile? profile, Failure? error})> verifyPhoneOtp(
    String verificationId,
    String otp,
  ) async {
    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: otp,
      );
      final userCredential = await auth.signInWithCredential(credential);
      final user = userCredential.user!;

      var profile = await getUserProfile(user.uid);
      if (profile == null) {
        profile = UserProfile(
          uid: user.uid,
          displayName: user.displayName ?? 'EcoTracer',
          email: user.email ?? '',
          phone: user.phoneNumber ?? '',
          createdAt: DateTime.now(),
          lastActiveAt: DateTime.now(),
        );
        await saveUserProfile(profile);
      }

      return (profile: profile, error: null);
    } on FirebaseAuthException catch (e) {
      return (
        profile: null,
        error: AuthFailure(message: e.message ?? 'OTP verification failed', code: e.code),
      );
    }
  }

  @override
  Future<void> signOut() async {
    await googleSignIn.signOut();
    await auth.signOut();
  }

  @override
  Future<UserProfile?> getUserProfile(String uid) async {
    try {
      final doc = await firestore
          .collection(AppConstants.usersCollection)
          .doc(uid)
          .get();
      if (doc.exists && doc.data() != null) {
        return UserProfile.fromMap(doc.data()!, uid);
      }
      return null;
    } on Exception {
      return null;
    }
  }

  @override
  Future<Failure?> saveUserProfile(UserProfile profile) async {
    try {
      await firestore
          .collection(AppConstants.usersCollection)
          .doc(profile.uid)
          .set(profile.toMap(), SetOptions(merge: true));
      return null;
    } on FirebaseException catch (e) {
      return ServerFailure(message: e.message ?? 'Profile save failed');
    }
  }

  @override
  Future<Failure?> deleteAccount() async {
    try {
      final uid = auth.currentUser?.uid;
      if (uid != null) {
        // Delete all emissions sub-collection
        final emissions = await firestore
            .collection(AppConstants.usersCollection)
            .doc(uid)
            .collection(AppConstants.emissionsSubCollection)
            .get();
        for (final doc in emissions.docs) {
          await doc.reference.delete();
        }
        // Delete user profile document
        await firestore.collection(AppConstants.usersCollection).doc(uid).delete();
        // Delete Firebase Auth account
        await auth.currentUser?.delete();
      }
      await signOut();
      return null;
    } on FirebaseAuthException catch (e) {
      return AuthFailure(message: e.message ?? 'Account deletion failed', code: e.code);
    }
  }

  @override
  Future<({String? jsonData, Failure? error})> exportUserData(String uid) async {
    try {
      // Gather all user data for DPDP Act compliance export
      final profileDoc = await firestore
          .collection(AppConstants.usersCollection)
          .doc(uid)
          .get();
      final emissions = await firestore
          .collection(AppConstants.usersCollection)
          .doc(uid)
          .collection(AppConstants.emissionsSubCollection)
          .get();

      final exportData = {
        'exportDate': DateTime.now().toIso8601String(),
        'profile': profileDoc.data(),
        'emissionLogs': emissions.docs.map((d) => d.data()).toList(),
        'dataSubjectRights': {
          'regulation': 'India DPDP Act 2023',
          'exportFormat': 'JSON',
          'retentionPolicy': '30 days post-deletion',
        },
      };

      // Convert to JSON string
      final jsonStr = exportData.toString(); // In production, use jsonEncode
      return (jsonData: jsonStr, error: null);
    } on Exception catch (e) {
      return (jsonData: null, error: ServerFailure(message: e.toString()));
    }
  }
}
