import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/emission_log.dart';
import '../../domain/repositories/emission_repository.dart';

// ── Events ────────────────────────────────────────────────────
abstract class DashboardEvent extends Equatable {
  const DashboardEvent();
  @override
  List<Object?> get props => [];
}

class LoadDashboard extends DashboardEvent {
  final String userId;
  const LoadDashboard(this.userId);
  @override
  List<Object?> get props => [userId];
}

class RefreshDashboard extends DashboardEvent {
  final String userId;
  const RefreshDashboard(this.userId);
  @override
  List<Object?> get props => [userId];
}

// ── States ────────────────────────────────────────────────────
abstract class DashboardState extends Equatable {
  const DashboardState();
  @override
  List<Object?> get props => [];
}

class DashboardInitial extends DashboardState {}

class DashboardLoading extends DashboardState {}

class DashboardLoaded extends DashboardState {
  final double todayTotal;
  final double dailyBudget;
  final int streak;
  final Map<String, double> categoryBreakdown;
  final List<EmissionLog> todayLogs;
  final List<double> weeklyTrend; // last 7 days totals
  final String? recommendation;

  const DashboardLoaded({
    required this.todayTotal,
    required this.dailyBudget,
    required this.streak,
    required this.categoryBreakdown,
    required this.todayLogs,
    required this.weeklyTrend,
    this.recommendation,
  });

  @override
  List<Object?> get props => [
        todayTotal, dailyBudget, streak, categoryBreakdown,
        todayLogs, weeklyTrend, recommendation,
      ];
}

class DashboardError extends DashboardState {
  final String message;
  const DashboardError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── BLoC ──────────────────────────────────────────────────────
class DashboardBloc extends Bloc<DashboardEvent, DashboardState> {
  final EmissionRepository emissionRepository;

  DashboardBloc({required this.emissionRepository}) : super(DashboardInitial()) {
    on<LoadDashboard>(_onLoadDashboard);
    on<RefreshDashboard>(_onRefreshDashboard);
  }

  Future<void> _onLoadDashboard(
    LoadDashboard event,
    Emitter<DashboardState> emit,
  ) async {
    emit(DashboardLoading());
    await _loadData(event.userId, emit);
  }

  Future<void> _onRefreshDashboard(
    RefreshDashboard event,
    Emitter<DashboardState> emit,
  ) async {
    await _loadData(event.userId, emit);
  }

  Future<void> _loadData(String userId, Emitter<DashboardState> emit) async {
    try {
      final now = DateTime.now();
      final todayStr =
          '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

      // Fetch today's data
      final todayResult = await emissionRepository.getEmissionsForDate(userId, todayStr);
      if (todayResult.error != null) {
        emit(DashboardError(todayResult.error!.message));
        return;
      }

      final todayTotal = todayResult.logs.fold(0.0, (sum, log) => sum + log.co2eKg);

      // Build category breakdown
      final breakdown = <String, double>{};
      for (final log in todayResult.logs) {
        breakdown[log.category] = (breakdown[log.category] ?? 0) + log.co2eKg;
      }

      // Weekly trend (last 7 days)
      final weeklyTrend = <double>[];
      for (int i = 6; i >= 0; i--) {
        final date = now.subtract(Duration(days: i));
        final dateStr =
            '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
        final dayTotal = await emissionRepository.getTotalForDate(userId, dateStr);
        weeklyTrend.add(dayTotal);
      }

      // Calculate streak (consecutive days under budget)
      int streak = 0;
      const defaultBudget = 5.2;
      for (int i = 1; i <= 30; i++) {
        final date = now.subtract(Duration(days: i));
        final dateStr =
            '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
        final dayTotal = await emissionRepository.getTotalForDate(userId, dateStr);
        if (dayTotal > 0 && dayTotal <= defaultBudget) {
          streak++;
        } else if (dayTotal > defaultBudget) {
          break;
        }
      }

      emit(DashboardLoaded(
        todayTotal: todayTotal,
        dailyBudget: defaultBudget,
        streak: streak,
        categoryBreakdown: breakdown,
        todayLogs: todayResult.logs,
        weeklyTrend: weeklyTrend,
      ));
    } on Exception catch (e) {
      emit(DashboardError(e.toString()));
    }
  }
}
