import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/chat_message.dart';
import '../../data/repositories/coach_repository_impl.dart';

// ── Events ────────────────────────────────────────────────────
abstract class CoachEvent extends Equatable {
  const CoachEvent();
  @override
  List<Object?> get props => [];
}

class SendMessage extends CoachEvent {
  final String text;
  const SendMessage(this.text);
  @override
  List<Object?> get props => [text];
}

class ClearChat extends CoachEvent {}

// ── States ────────────────────────────────────────────────────
abstract class CoachState extends Equatable {
  const CoachState();
  @override
  List<Object?> get props => [];
}

class CoachInitial extends CoachState {
  final List<ChatMessage> messages;
  const CoachInitial({this.messages = const []});
  @override
  List<Object?> get props => [messages];
}

class CoachStreaming extends CoachState {
  final List<ChatMessage> messages;
  const CoachStreaming({required this.messages});
  @override
  List<Object?> get props => [messages];
}

class CoachReady extends CoachState {
  final List<ChatMessage> messages;
  const CoachReady({required this.messages});
  @override
  List<Object?> get props => [messages];
}

class CoachError extends CoachState {
  final String message;
  final List<ChatMessage> messages;
  const CoachError({required this.message, this.messages = const []});
  @override
  List<Object?> get props => [message, messages];
}

// ── BLoC ──────────────────────────────────────────────────────
class CoachBloc extends Bloc<CoachEvent, CoachState> {
  final CoachRepository coachRepository;
  final List<ChatMessage> _messages = [];

  CoachBloc({required this.coachRepository}) : super(const CoachInitial()) {
    // Add welcome message
    _messages.add(ChatMessage(
      id: 'welcome',
      isUser: false,
      text: 'Hello! I am your EcoTrace Gemini Coach 🤖. I have analyzed your last 7-day footprint summary:\n\n'
          '• Transport emissions: 12.8 kg CO₂e (40% above target)\n'
          '• Food: 6.4 kg CO₂e\n'
          '• Energy: 8.2 kg CO₂e\n\n'
          'Ask me anything, or try tapping one of the common prompts below!',
      timestamp: DateTime.now(),
    ));

    on<SendMessage>(_onSendMessage);
    on<ClearChat>(_onClearChat);
  }

  Future<void> _onSendMessage(
    SendMessage event,
    Emitter<CoachState> emit,
  ) async {
    if (event.text.trim().isEmpty) return;

    // Add user message
    _messages.add(ChatMessage(
      id: 'user_${DateTime.now().millisecondsSinceEpoch}',
      isUser: true,
      text: event.text,
      timestamp: DateTime.now(),
    ));

    // Add placeholder for AI response
    final aiMsgId = 'ai_${DateTime.now().millisecondsSinceEpoch}';
    _messages.add(ChatMessage(
      id: aiMsgId,
      isUser: false,
      text: '',
      timestamp: DateTime.now(),
      isStreaming: true,
    ));

    emit(CoachStreaming(messages: List.from(_messages)));

    // Stream response from Gemini
    String fullResponse = '';
    try {
      await for (final chunk in coachRepository.sendMessageStream(event.text, _messages)) {
        fullResponse += chunk;
        _messages.last = _messages.last.copyWith(text: fullResponse);
        emit(CoachStreaming(messages: List.from(_messages)));
      }

      _messages.last = _messages.last.copyWith(isStreaming: false);
      emit(CoachReady(messages: List.from(_messages)));
    } on Exception catch (e) {
      _messages.last = _messages.last.copyWith(
        text: '❌ Error: $e',
        isStreaming: false,
      );
      emit(CoachError(message: e.toString(), messages: List.from(_messages)));
    }
  }

  void _onClearChat(ClearChat event, Emitter<CoachState> emit) {
    _messages.clear();
    _messages.add(ChatMessage(
      id: 'welcome_reset',
      isUser: false,
      text: "Let's restart our session! How can I help you reach your carbon goals today?",
      timestamp: DateTime.now(),
    ));
    emit(CoachReady(messages: List.from(_messages)));
  }
}
