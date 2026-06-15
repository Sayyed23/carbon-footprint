import 'dart:typed_data';
import 'package:firebase_ai/firebase_ai.dart';
import 'package:firebase_core/firebase_core.dart';
import '../../domain/entities/chat_message.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/services/env_config.dart';

/// Repository for Gemini AI Coach interactions.
///
/// Uses `firebase_ai` SDK to interface with Gemini models
/// through Firebase Vertex AI integration.
abstract class CoachRepository {
  /// Send a message and receive a streaming response.
  Stream<String> sendMessageStream(String userMessage, List<ChatMessage> history);

  /// Analyze a receipt image and extract emission data.
  Future<({String? analysis, Failure? error})> analyzeReceipt(
    List<int> imageBytes,
    String mimeType,
  );

  /// Get a one-shot recommendation based on user context.
  Future<({String? recommendation, Failure? error})> getRecommendation(
    Map<String, dynamic> userContext,
  );
}

/// Firebase AI (Gemini) implementation of [CoachRepository].
class CoachRepositoryImpl implements CoachRepository {
  GenerativeModel? _proModel;
  GenerativeModel? _flashModel;

  GenerativeModel get _getProModel {
    _proModel ??= FirebaseAI.googleAI().generativeModel(
      model: EnvConfig.geminiModelPro,
    );
    return _proModel!;
  }

  GenerativeModel get _getFlashModel {
    _flashModel ??= FirebaseAI.googleAI().generativeModel(
      model: EnvConfig.geminiModelFlash,
    );
    return _flashModel!;
  }

  @override
  Stream<String> sendMessageStream(
    String userMessage,
    List<ChatMessage> history,
  ) async* {
    try {
      // Build conversation history for context
      final contents = <Content>[];

      // Add system prompt as first user message context
      contents.add(Content.text(AppConstants.geminiSystemPrompt));

      // Add conversation history
      for (final msg in history) {
        if (msg.isUser) {
          contents.add(Content.text(msg.text));
        } else {
          contents.add(Content.model([TextPart(msg.text)]));
        }
      }

      // Add current user message
      contents.add(Content.text(userMessage));

      // Use streaming for real-time word-by-word display
      final response = _getProModel.generateContentStream(contents);
      await for (final chunk in response) {
        final text = chunk.text;
        if (text != null && text.isNotEmpty) {
          yield text;
        }
      }
    } on FirebaseException catch (e) {
      yield '❌ Error: ${e.message}. Please try again.';
    } on Exception catch (e) {
      yield '❌ Error: $e. Please try again.';
    }
  }

  @override
  Future<({String? analysis, Failure? error})> analyzeReceipt(
    List<int> imageBytes,
    String mimeType,
  ) async {
    try {
      final prompt = '''
Analyze this receipt/invoice image and extract:
1. Type of purchase (fuel, food, electricity, shopping)
2. Quantity and unit (litres, kg, kWh, items)
3. Estimated carbon footprint in kg CO₂e using India 2025 emission factors
4. Category for EcoTrace logging (Transport/Food/Energy/Shopping/Waste)

Format your response as:
🧾 Item: [description]
📏 Quantity: [amount] [unit]
⚠️ Carbon Impact: [X.XX] kg CO₂e
🏷️ Category: [category]
🏆 EcoPoints earned: +[points]
''';

      final content = Content.multi([
        TextPart(prompt),
        InlineDataPart(mimeType, Uint8List.fromList(imageBytes)),
      ]);

      final response = await _getFlashModel.generateContent([content]);
      final text = response.text;

      return (analysis: text, error: null);
    } on FirebaseException catch (e) {
      return (
        analysis: null,
        error: AiFailure(message: e.message ?? 'Receipt analysis failed'),
      );
    } on Exception catch (e) {
      return (analysis: null, error: AiFailure(message: e.toString()));
    }
  }

  @override
  Future<({String? recommendation, Failure? error})> getRecommendation(
    Map<String, dynamic> userContext,
  ) async {
    try {
      final prompt = '''
${AppConstants.geminiSystemPrompt}

Based on this user's recent activity:
- Today's emissions: ${userContext['todayEmissions']} kg CO₂e
- Daily budget: ${userContext['dailyBudget']} kg CO₂e
- Top category: ${userContext['topCategory']}
- City: ${userContext['city']}
- Streak: ${userContext['streak']} days

Generate ONE actionable recommendation (max 50 words) with an emoji
that would have the highest impact on reducing their footprint today.
''';

      final response = await _getFlashModel.generateContent([Content.text(prompt)]);
      return (recommendation: response.text, error: null);
    } on Exception catch (e) {
      return (recommendation: null, error: AiFailure(message: e.toString()));
    }
  }
}
