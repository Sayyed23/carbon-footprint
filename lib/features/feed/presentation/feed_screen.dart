import 'package:flutter/material.dart';

class ActionFeedScreen extends StatefulWidget {
  const ActionFeedScreen({super.key});

  @override
  State<ActionFeedScreen> createState() => _ActionFeedScreenState();
}

class _ActionFeedScreenState extends State<ActionFeedScreen> {
  bool _isLoading = false;
  int _userEcoPoints = 580; // Starting mock balance from social screen

  // Initial list of recommendations (representing Vertex AI recommendations)
  final List<Map<String, dynamic>> _actions = [
    {
      'id': '1',
      'emoji': '🚲',
      'title': 'Cycle to Nearby Store',
      'desc': 'Swap your car trip for cycling for grocery shopping (approx. 4 km round-trip).',
      'impact': '-0.8 kg CO₂e',
      'points': 20,
      'completed': false,
      'category': 'Transport',
    },
    {
      'id': '2',
      'emoji': '🥗',
      'title': 'Opt for a Plant-Based Lunch',
      'desc': 'Skip meat for lunch today. Going vegetarian or vegan saves major agricultural carbon.',
      'impact': '-3.3 kg CO₂e',
      'points': 15,
      'completed': false,
      'category': 'Diet',
    },
    {
      'id': '3',
      'emoji': '🔌',
      'title': 'Unplug Standby Electronics',
      'desc': 'Unplug your TV, microwave, and chargers when not in use. Standby power accounts for 5% of household electricity.',
      'impact': '-0.5 kg CO₂e',
      'points': 10,
      'completed': false,
      'category': 'Energy',
    },
  ];

  Future<void> _refreshRecommendations() async {
    setState(() {
      _isLoading = true;
    });

    // Simulate calling Vertex AI recommendations endpoint
    await Future<void>.delayed(const Duration(milliseconds: 1500));

    if (!mounted) return;
    setState(() {
      _isLoading = false;
      // Reset status for demo purposes
      for (var action in _actions) {
        action['completed'] = false;
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            Icon(Icons.auto_awesome, color: Colors.purple, size: 16),
            SizedBox(width: 8),
            Text('Refreshed daily recommendations via Vertex AI'),
          ],
        ),
      ),
    );
  }

  void _completeAction(int index) {
    if (_actions[index]['completed'] as bool) return;

    setState(() {
      _actions[index]['completed'] = true;
      _userEcoPoints += _actions[index]['points'] as int;
    });

    showDialog<void>(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Row(
            children: [
              Text('🎉 ', style: TextStyle(fontSize: 24)),
              Expanded(
                child: Text(
                  'Action Logged!',
                  style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Outfit'),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Great job completing: "${_actions[index]['title']}"',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              Text('Offset Impact: ${_actions[index]['impact']}'),
              const SizedBox(height: 4),
              Text(
                'Points earned: +${_actions[index]['points']} EcoPoints',
                style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              const Text(
                'Your new balance has been synchronized with Firebase Firestore.',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.primaryColor,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text('Keep it up!', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Personalized Action Feed',
          style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Outfit'),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refreshRecommendations,
          color: theme.primaryColor,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top header panel with EcoPoints balance
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  decoration: BoxDecoration(
                    color: theme.primaryColor.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: theme.primaryColor.withValues(alpha: 0.15)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'CURRENT ECOPOINTS',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey,
                              letterSpacing: 1.1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '$_userEcoPoints Points',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              color: theme.primaryColor,
                              fontFamily: 'Outfit',
                            ),
                          ),
                        ],
                      ),
                      const Text('🌱', style: TextStyle(fontSize: 32)),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Today's Recommendations",
                      style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const Row(
                      children: [
                        Icon(Icons.auto_awesome, size: 14, color: Colors.purple),
                        SizedBox(width: 4),
                        Text(
                          'Vertex AI Feed',
                          style: TextStyle(fontSize: 11, color: Colors.purple, fontWeight: FontWeight.bold),
                        ),
                      ],
                    )
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'Based on your commute patterns, diet, and local weather context in Pune.',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const SizedBox(height: 20),

                if (_isLoading)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 40.0),
                    child: Center(
                      child: CircularProgressIndicator(),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _actions.length,
                    itemBuilder: (context, index) {
                      final action = _actions[index];
                      final isCompleted = action['completed'] as bool;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: isCompleted
                                ? theme.primaryColor.withValues(alpha: 0.3)
                                : theme.dividerColor,
                            width: isCompleted ? 2 : 1,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.01),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            )
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Top highlight bar based on completion
                              Container(
                                height: 6,
                                color: isCompleted ? theme.primaryColor : const Color(0xFFD4A373),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(20.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Large Emoji icon
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: (isCompleted ? theme.primaryColor : const Color(0xFFD4A373))
                                            .withValues(alpha: 0.1),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Text(
                                        action['emoji'] as String,
                                        style: const TextStyle(fontSize: 28),
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            action['title'] as String,
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                              decoration: isCompleted ? TextDecoration.lineThrough : null,
                                              color: isCompleted ? Colors.grey : null,
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            action['desc'] as String,
                                            style: TextStyle(
                                              fontSize: 13,
                                              height: 1.4,
                                              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                                            ),
                                          ),
                                          const SizedBox(height: 16),
                                          // Metrics row
                                          Row(
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFFC15C3D).withValues(alpha: 0.1),
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Row(
                                                  children: [
                                                    const Icon(Icons.arrow_downward, size: 12, color: Color(0xFFC15C3D)),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      action['impact'] as String,
                                                      style: const TextStyle(
                                                        fontSize: 11,
                                                        fontWeight: FontWeight.bold,
                                                        color: Color(0xFFC15C3D),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              const SizedBox(width: 10),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                decoration: BoxDecoration(
                                                  color: Colors.amber.withValues(alpha: 0.1),
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Text(
                                                  '+${action['points']} pts',
                                                  style: const TextStyle(
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.bold,
                                                    color: Color(0xFFB58D1C),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          )
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              // Complete action button at the bottom
                              InkWell(
                                onTap: isCompleted ? null : () => _completeAction(index),
                                child: Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  color: isCompleted
                                      ? theme.primaryColor.withValues(alpha: 0.1)
                                      : theme.colorScheme.surface,
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        isCompleted ? Icons.check_circle : Icons.check_circle_outline,
                                        color: isCompleted ? theme.primaryColor : Colors.grey,
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        isCompleted ? 'Completed & Logged' : 'Mark Complete',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: isCompleted ? theme.primaryColor : Colors.grey[700],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                const SizedBox(height: 20),
                const Center(
                  child: Text(
                    'Pull down to refresh recommendations via Vertex AI',
                    style: TextStyle(fontSize: 12, color: Colors.grey, fontStyle: FontStyle.italic),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
