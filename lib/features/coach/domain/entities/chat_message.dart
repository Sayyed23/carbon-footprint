import 'package:equatable/equatable.dart';

/// Represents a chat message in the Gemini Coach conversation.
class ChatMessage extends Equatable {
  final String id;
  final bool isUser;
  final String text;
  final DateTime timestamp;
  final String? attachmentUrl; // For receipt images
  final bool isStreaming;

  const ChatMessage({
    required this.id,
    required this.isUser,
    required this.text,
    required this.timestamp,
    this.attachmentUrl,
    this.isStreaming = false,
  });

  ChatMessage copyWith({
    String? text,
    bool? isStreaming,
  }) {
    return ChatMessage(
      id: id,
      isUser: isUser,
      text: text ?? this.text,
      timestamp: timestamp,
      attachmentUrl: attachmentUrl,
      isStreaming: isStreaming ?? this.isStreaming,
    );
  }

  @override
  List<Object?> get props => [id, isUser, text, timestamp, attachmentUrl, isStreaming];
}
