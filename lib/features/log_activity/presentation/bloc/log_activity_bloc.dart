import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../dashboard/domain/entities/emission_log.dart';
import '../../../dashboard/domain/repositories/emission_repository.dart';
import '../../../../core/constants/emission_factors.dart';

// ── Events ────────────────────────────────────────────────────
abstract class LogActivityEvent extends Equatable {
  const LogActivityEvent();
  @override
  List<Object?> get props => [];
}

class SubmitManualLog extends LogActivityEvent {
  final String userId;
  final String category;
  final String subCategory;
  final double quantity;

  const SubmitManualLog({
    required this.userId,
    required this.category,
    required this.subCategory,
    required this.quantity,
  });

  @override
  List<Object?> get props => [userId, category, subCategory, quantity];
}

class ScanReceipt extends LogActivityEvent {
  final String userId;
  final List<int> imageBytes;
  final String mimeType;

  const ScanReceipt({
    required this.userId,
    required this.imageBytes,
    this.mimeType = 'image/jpeg',
  });

  @override
  List<Object?> get props => [userId];
}

class StartVoiceLog extends LogActivityEvent {
  final String userId;
  const StartVoiceLog({required this.userId});
  @override
  List<Object?> get props => [userId];
}

// ── States ────────────────────────────────────────────────────
abstract class LogActivityState extends Equatable {
  const LogActivityState();
  @override
  List<Object?> get props => [];
}

class LogInitial extends LogActivityState {}

class LogSubmitting extends LogActivityState {
  final String source; // manual, scanning, recording
  const LogSubmitting(this.source);
  @override
  List<Object?> get props => [source];
}

class LogSuccess extends LogActivityState {
  final String title;
  final String details;
  final int ecoPointsEarned;

  const LogSuccess({
    required this.title,
    required this.details,
    required this.ecoPointsEarned,
  });

  @override
  List<Object?> get props => [title, details, ecoPointsEarned];
}

class LogError extends LogActivityState {
  final String message;
  const LogError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── BLoC ──────────────────────────────────────────────────────
class LogActivityBloc extends Bloc<LogActivityEvent, LogActivityState> {
  final EmissionRepository emissionRepository;

  LogActivityBloc({required this.emissionRepository}) : super(LogInitial()) {
    on<SubmitManualLog>(_onSubmitManualLog);
    on<ScanReceipt>(_onScanReceipt);
    on<StartVoiceLog>(_onStartVoiceLog);
  }

  Future<void> _onSubmitManualLog(
    SubmitManualLog event,
    Emitter<LogActivityState> emit,
  ) async {
    emit(const LogSubmitting('manual'));

    final co2e = EmissionFactors.compute(
      category: event.category,
      subType: event.subCategory,
      quantity: event.quantity,
    );

    final factor = co2e / (event.quantity == 0 ? 1 : event.quantity);

    final log = EmissionLog(
      id: 'log_${DateTime.now().millisecondsSinceEpoch}',
      userId: event.userId,
      category: event.category,
      subCategory: event.subCategory,
      quantity: event.quantity,
      emissionFactor: factor,
      co2eKg: co2e,
      loggedAt: DateTime.now(),
      source: 'manual',
      ecoPointsEarned: 20,
    );

    final result = await emissionRepository.addEmission(log);

    if (result.error != null && result.log == null) {
      emit(LogError(result.error!.message));
    } else {
      emit(LogSuccess(
        title: '${event.category} Logged!',
        details: '${_categoryIcon(event.category)} Mode: ${event.subCategory}\n'
            '📏 Quantity: ${event.quantity}\n'
            '⚠️ Carbon Impact: ${co2e.toStringAsFixed(2)} kg CO₂e\n'
            '🏆 EcoPoints earned: +20',
        ecoPointsEarned: 20,
      ));
    }
  }

  Future<void> _onScanReceipt(
    ScanReceipt event,
    Emitter<LogActivityState> emit,
  ) async {
    emit(const LogSubmitting('scanning'));

    // Simulate receipt scanning result (in production, calls CoachRepository.analyzeReceipt)
    await Future<void>.delayed(const Duration(seconds: 2));

    emit(const LogSuccess(
      title: 'Receipt Scanned Successfully!',
      details: '🧾 HP Fuel Pump Invoice\n'
          '🚗 Fuel Type: Petrol\n'
          '📏 Quantity: 15 Litres (~120 km equivalent)\n'
          '⚠️ Carbon Impact: 23.0 kg CO₂e\n'
          '🏆 EcoPoints earned: +25',
      ecoPointsEarned: 25,
    ));
  }

  Future<void> _onStartVoiceLog(
    StartVoiceLog event,
    Emitter<LogActivityState> emit,
  ) async {
    emit(const LogSubmitting('recording'));

    // Simulate voice processing
    await Future<void>.delayed(const Duration(seconds: 2));

    emit(const LogSuccess(
      title: 'Voice Activity Logged!',
      details: '🗣️ "I just travelled 12km in Mumbai Metro"\n'
          '🚇 Mode: Urban Metro / Rail\n'
          '📏 Distance: 12 km\n'
          '✅ Carbon Impact: 0.37 kg CO₂e\n'
          '🏆 EcoPoints earned: +25',
      ecoPointsEarned: 25,
    ));
  }

  String _categoryIcon(String category) {
    switch (category) {
      case 'Transport':
        return '🚗';
      case 'Food':
        return '🥩';
      case 'Energy':
        return '⚡';
      case 'Shopping':
        return '🛒';
      case 'Waste':
        return '🗑️';
      default:
        return '📝';
    }
  }
}
