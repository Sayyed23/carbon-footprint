import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int _currentStep = 0;

  // Selected Quiz Answers
  String? _transportMode;
  String? _dietType;
  String? _energySource;
  String? _cityTier;
  int _householdSize = 1;

  final List<String> _transportOptions = [
    'Petrol Car 🚗',
    'Diesel Car 🚙',
    'CNG Auto 🛺',
    'Metro / Rail 🚇',
    'Bus 🚌',
    'Electric Vehicle ⚡',
    'Walk/Cycle 🚲'
  ];

  final List<String> _dietOptions = [
    'High Meat Diet (Daily) 🥩',
    'Low Meat/Fish (Occasional) 🐟',
    'Vegetarian (Dairy Incl.) 🥛',
    'Vegan (Plant-Based) 🥦'
  ];

  final List<String> _energyOptions = [
    'Mainly Grid Power (India Avg) 🔌',
    'Grid Power + LPG Cylinder 🪵',
    'Partial Solar + Grid ☀️',
    'Full Solar/Net-Zero 🔋'
  ];

  final List<String> _cityOptions = [
    'Metro (Mumbai, Delhi, Bengaluru) 🏙️',
    'Tier 2 City (Pune, Jaipur, Kochi) 🏘️',
    'Tier 3 City / Rural 🏡'
  ];

  double _calculateBaselineFootprint() {
    double transportScore = 0;
    switch (_transportMode) {
      case 'Petrol Car 🚗':
        transportScore = 2000;
        break;
      case 'Diesel Car 🚙':
        transportScore = 1800;
        break;
      case 'CNG Auto 🛺':
        transportScore = 900;
        break;
      case 'Metro / Rail 🚇':
        transportScore = 300;
        break;
      case 'Bus 🚌':
        transportScore = 800;
        break;
      case 'Electric Vehicle ⚡':
        transportScore = 500;
        break;
      default:
        transportScore = 50;
    }

    double dietScore = 0;
    switch (_dietType) {
      case 'High Meat Diet (Daily) 🥩':
        dietScore = 2500;
        break;
      case 'Low Meat/Fish (Occasional) 🐟':
        dietScore = 1500;
        break;
      case 'Vegetarian (Dairy Incl.) 🥛':
        dietScore = 900;
        break;
      default:
        dietScore = 400;
    }

    double energyScore = 0;
    switch (_energySource) {
      case 'Mainly Grid Power (India Avg) 🔌':
        energyScore = 1800;
        break;
      case 'Grid Power + LPG Cylinder 🪵':
        energyScore = 1600;
        break;
      case 'Partial Solar + Grid ☀️':
        energyScore = 800;
        break;
      default:
        energyScore = 150;
    }

    // Adjust by household size
    double base = (dietScore + energyScore) / _householdSize + transportScore;

    // Adjust by city size
    if (_cityTier == 'Metro (Mumbai, Delhi, Bengaluru) 🏙️') {
      base *= 1.2;
    } else if (_cityTier == 'Tier 3 City / Rural 🏡') {
      base *= 0.9;
    }

    return double.parse(base.toStringAsFixed(1));
  }

  Widget _buildStepContent() {
    final theme = Theme.of(context);
    switch (_currentStep) {
      case 0:
        return _buildSelectionStep(
          title: 'How do you usually commute?',
          options: _transportOptions,
          selectedValue: _transportMode,
          onSelected: (value) => setState(() => _transportMode = value),
        );
      case 1:
        return _buildSelectionStep(
          title: 'What does your daily diet look like?',
          options: _dietOptions,
          selectedValue: _dietType,
          onSelected: (value) => setState(() => _dietType = value),
        );
      case 2:
        return _buildSelectionStep(
          title: 'What is the primary energy source in your house?',
          options: _energyOptions,
          selectedValue: _energySource,
          onSelected: (value) => setState(() => _energySource = value),
        );
      case 3:
        return _buildSelectionStep(
          title: 'Which city tier do you live in?',
          options: _cityOptions,
          selectedValue: _cityTier,
          onSelected: (value) => setState(() => _cityTier = value),
        );
      case 4:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'How many members live in your household?',
              style: theme.textTheme.headlineMedium?.copyWith(fontFamily: 'Outfit'),
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(5, (index) {
                final count = index + 1;
                final isSelected = _householdSize == count;
                return ChoiceChip(
                  label: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      count == 5 ? '5+' : '$count',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                      ),
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: theme.primaryColor,
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _householdSize = count;
                      });
                    }
                  },
                );
              }),
            ),
          ],
        );
      case 5:
        final baseline = _calculateBaselineFootprint();
        final indiaAvg = 1900.0; // India national average benchmark 1.9 tonnes/year
        final diffPercent = ((baseline - indiaAvg) / indiaAvg * 100).toStringAsFixed(0);
        final isAbove = baseline > indiaAvg;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your Baseline Carbon Footprint',
              style: theme.textTheme.headlineMedium?.copyWith(fontFamily: 'Outfit'),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(24),
              width: double.infinity,
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: theme.primaryColor.withOpacity(0.2), width: 1.5),
              ),
              child: Column(
                children: [
                  const Text(
                    'ESTIMATED FOOTPRINT',
                    style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2, fontSize: 12),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '${(baseline / 1000).toStringAsFixed(2)} tonnes',
                    style: theme.textTheme.headlineLarge?.copyWith(
                      color: theme.primaryColor,
                      fontSize: 40,
                      fontWeight: FontWeight.black,
                    ),
                  ),
                  const Text(
                    'CO₂ e / year',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  Divider(color: theme.dividerColor),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('India Avg Benchmark:', style: TextStyle(fontWeight: FontWeight.w600)),
                      Text('${(indiaAvg / 1000).toStringAsFixed(2)} tonnes/yr', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(
                        isAbove ? Icons.warning_amber_rounded : Icons.check_circle_outline,
                        color: isAbove ? const Color(0xFFC15C3D) : const Color(0xFF4A7C59),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          isAbove
                              ? 'Your footprint is $diffPercent% higher than the India national average. The Gemini coach recommends setting a 15% reduction goal!'
                              : 'Your footprint is lower than the India national average! Maintain this by keeping check of your daily carbon targets.',
                          style: TextStyle(
                            fontSize: 13,
                            color: isAbove ? const Color(0xFFC15C3D) : const Color(0xFF4A7C59),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Set a 3-Month Reduction Target',
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: theme.brightness == Brightness.light ? Colors.grey[200] : Colors.grey[900],
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Text('🎯  Target:', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(width: 8),
                  Text(
                    '15% Reduction (~${((baseline * 0.85) / 1000).toStringAsFixed(2)} tonnes/year target)',
                    style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            )
          ],
        );
      default:
        return const SizedBox();
    }
  }

  Widget _buildSelectionStep({
    required String title,
    required List<String> options,
    required String? selectedValue,
    required ValueChanged<String> onSelected,
  }) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textTheme.headlineMedium?.copyWith(fontFamily: 'Outfit'),
        ),
        const SizedBox(height: 24),
        ...options.map((option) {
          final isSelected = option == selectedValue;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: InkWell(
              onTap: () => onSelected(option),
              borderRadius: BorderRadius.circular(16),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  color: isSelected ? theme.primaryColor.withOpacity(0.08) : Colors.transparent,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? theme.primaryColor : theme.dividerColor,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        option,
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          color: isSelected ? theme.primaryColor : null,
                        ),
                      ),
                    ),
                    if (isSelected)
                      Icon(Icons.check_circle, color: theme.primaryColor)
                    else
                      Icon(Icons.circle_outlined, color: theme.hintColor),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ],
    );
  }

  bool _isNextEnabled() {
    switch (_currentStep) {
      case 0:
        return _transportMode != null;
      case 1:
        return _dietType != null;
      case 2:
        return _energySource != null;
      case 3:
        return _cityTier != null;
      default:
        return true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLastStep = _currentStep == 5;

    return Scaffold(
      appBar: AppBar(
        leading: _currentStep > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => setState(() => _currentStep--),
              )
            : null,
        title: LinearProgressIndicator(
          value: (_currentStep + 1) / 6,
          backgroundColor: theme.brightness == Brightness.light ? Colors.grey[300] : Colors.grey[800],
          valueColor: AlwaysStoppedAnimation<Color>(theme.primaryColor),
          borderRadius: BorderRadius.circular(4),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: _buildStepContent(),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.primaryColor,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  onPressed: _isNextEnabled()
                      ? () {
                          if (isLastStep) {
                            context.go('/dashboard');
                          } else {
                            setState(() {
                              _currentStep++;
                            });
                          }
                        }
                      : null,
                  child: Text(
                    isLastStep ? 'Accept Target & Go to Dashboard' : 'Continue',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
