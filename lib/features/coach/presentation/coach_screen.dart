import 'package:flutter/material.dart';

class CoachScreen extends StatefulWidget {
  const CoachScreen({super.key});

  @override
  State<CoachScreen> createState() => _CoachScreenState();
}

class _CoachScreenState extends State<CoachScreen> {
  final List<Map<String, dynamic>> _messages = [
    {
      'isUser': false,
      'text': "Hello! I am your EcoTrace Gemini Coach 🤖. I have analyzed your last 7-day footprint summary:\n\n"
          "• Transport emissions: 12.8 kg CO₂e (40% above target)\n"
          "• Food: 6.4 kg CO₂e\n"
          "• Energy: 8.2 kg CO₂e\n\n"
          "Ask me anything, or try tapping one of the common prompts below!",
    }
  ];

  final _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isTyping = false;

  final List<String> _presets = [
    'How much CO₂ did my Mumbai–Delhi flight emit? ✈️',
    'Explain the offset value of riding a metro over driving 🚇',
    'Suggest 3 localized recipes for reducing food footprint 🥗',
  ];

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    setState(() {
      _messages.add({'isUser': true, 'text': text});
      _isTyping = true;
    });
    _textController.clear();
    _scrollToBottom();

    // Mock Gemini API processing and stream simulation
    await Future.delayed(const Duration(milliseconds: 1500));

    if (!mounted) return;

    String response = '';
    if (text.contains('Mumbai–Delhi')) {
      response = '✈️ A domestic economy flight from Mumbai (BOM) to Delhi (DEL) covers approximately 1,140 km.\n\n'
          'Using the India 2025 aviation emission factor (0.255 kgCO₂e/km per passenger), your flight emitted approximately **290.7 kg CO₂e**.\n\n'
          'To offset this, you would need to:\n'
          '🌳 Plant 15 trees, or\n'
          '🚲 Commute by bicycle / walking for the next 4 months!';
    } else if (text.contains('metro')) {
      response = '🚇 In India, the average grid intensity makes private petrol cars emit ~0.192 kgCO₂e/km.\n\n'
          'In contrast, the urban metro system operates at a highly optimized grid efficiency, resulting in only **0.031 kgCO₂e/km** per passenger.\n\n'
          'By taking the metro instead of driving:\n'
          '• You save **0.161 kg CO₂e per km**.\n'
          '• A 15km daily commute saves **2.4 kg CO₂e** per day.\n'
          '• You earn **+20 EcoPoints** per commute in EcoTrace!';
    } else if (text.contains('recipes')) {
      response = '🥗 Choosing local, plant-based diets greatly reduces land use and transport emissions. Here are 3 eco-friendly options:\n\n'
          '1. **Millet Khichdi**: Millets are climate-resilient, requiring 70% less water than rice and having a footprint of just ~0.8 kgCO₂e/kg.\n'
          '2. **Seasonal Veggie Stir-fry**: Made with local vegetables sourced within 50km. Minimizes cold storage and shopping emissions.\n'
          '3. **Dal Tadka**: Lentils are excellent protein sources with a footprint ~10x lower than poultry / red meat.';
    } else {
      response = 'I have processed your query: "$text". To reduce your carbon footprint in this area, try to adopt green transport choices, conserve household power (turn off appliances when idle), and favor locally sourced foods. Let me know if you want detailed stats!';
    }

    setState(() {
      _isTyping = false;
      _messages.add({'isUser': false, 'text': ''}); // Placeholder for animation
    });

    // Simulate streaming word-by-word
    final words = response.split(' ');
    String currentText = '';
    for (int i = 0; i < words.length; i++) {
      await Future.delayed(const Duration(milliseconds: 40));
      if (!mounted) return;
      currentText += (i == 0 ? '' : ' ') + words[i];
      setState(() {
        _messages[_messages.length - 1]['text'] = currentText;
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gemini Green Coach', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Outfit')),
        centerTitle: true,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() {
                _messages.clear();
                _messages.add({
                  'isUser': false,
                  'text': "Let's restart our session! How can I help you reach your carbon goals today?",
                });
              });
            },
          )
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Chat area
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  final msg = _messages[index];
                  final isUser = msg['isUser'] as bool;
                  return Align(
                    alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                      decoration: BoxDecoration(
                        color: isUser
                            ? theme.primaryColor
                            : (theme.brightness == Brightness.light
                                ? const Color(0xFFE2E8F0)
                                : const Color(0xFF1E2924)),
                        borderRadius: BorderRadius.only(
                          topLeft: const Radius.circular(16),
                          topRight: const Radius.circular(16),
                          bottomLeft: isUser ? const Radius.circular(16) : Radius.zero,
                          bottomRight: isUser ? Radius.zero : const Radius.circular(16),
                        ),
                      ),
                      child: Text(
                        msg['text'] as String,
                        style: TextStyle(
                          fontSize: 15,
                          color: isUser
                              ? Colors.white
                              : (theme.brightness == Brightness.light ? Colors.black87 : Colors.white),
                          height: 1.4,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            if (_isTyping)
              Padding(
                padding: const EdgeInsets.only(left: 16.0, bottom: 8.0),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Gemini is writing...',
                    style: TextStyle(fontStyle: FontStyle.italic, color: theme.hintColor),
                  ),
                ),
              ),

            // Suggestions Carousel / chips
            if (_messages.length == 1 && !_isTyping)
              Container(
                height: 52,
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _presets.length,
                  itemBuilder: (context, index) {
                    final chipText = _presets[index];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: ActionChip(
                        label: Text(chipText, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        onPressed: () => _sendMessage(chipText),
                      ),
                    );
                  },
                ),
              ),

            // Input Bar
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                border: Border(top: BorderSide(color: theme.dividerColor)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      style: const TextStyle(fontSize: 15),
                      decoration: InputDecoration(
                        hintText: 'Ask Gemini Coach...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: theme.brightness == Brightness.light ? Colors.grey[200] : Colors.grey[900],
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      ),
                      onSubmitted: _sendMessage,
                    ),
                  ),
                  const SizedBox(width: 8),
                  FloatingActionButton.small(
                    onPressed: () => _sendMessage(_textController.text),
                    backgroundColor: theme.primaryColor,
                    foregroundColor: Colors.white,
                    child: const Icon(Icons.send),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
