import 'package:flutter/material.dart';

class SocialScreen extends StatelessWidget {
  const SocialScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Mock Leaderboard Data
    final List<Map<String, dynamic>> leaderboard = [
      {'rank': 1, 'name': 'Aditi Sharma', 'points': 850, 'city': 'Pune', 'isMe': false},
      {'rank': 2, 'name': 'Rahul Verma', 'points': 720, 'city': 'Mumbai', 'isMe': false},
      {'rank': 3, 'name': 'Karan Johar (You)', 'points': 580, 'city': 'Pune', 'isMe': true},
      {'rank': 4, 'name': 'Sneha Patil', 'points': 510, 'city': 'Bengaluru', 'isMe': false},
      {'rank': 5, 'name': 'Amit Patel', 'points': 430, 'city': 'Ahmedabad', 'isMe': false},
    ];

    // Mock Badges Data
    final List<Map<String, dynamic>> badges = [
      {'title': 'Train Tamer', 'desc': 'Took public transit 20+ times this month', 'icon': '🚇', 'unlocked': true},
      {'title': 'Plant-Based Pioneer', 'desc': 'Zero meat week dietary accomplishment', 'icon': '🥦', 'unlocked': true},
      {'title': 'Solar Saver', 'desc': 'First month of net-zero energy at home', 'icon': '☀️', 'unlocked': false},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Community & Rewards', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Outfit')),
        centerTitle: true,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // EcoPoints Status Panel
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [theme.primaryColor, const Color(0xFF4A7C59)],
                  ),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'TOTAL REWARDS',
                          style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '580 EcoPoints',
                          style: theme.textTheme.headlineMedium?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 18,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Ranked #3 in Pune (Tier 2 Cohort)',
                          style: TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                      ],
                    ),
                    const Text('🏆', style: TextStyle(fontSize: 54)),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Active Challenges Section
              Text(
                'Active Challenges',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('🏙️ ', style: TextStyle(fontSize: 24)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Pune Goes Green',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Keep city transport emissions under 3 kg CO₂ for 5 days.',
                                  style: theme.textTheme.bodyMedium,
                                ),
                                const SizedBox(height: 12),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(4),
                                  child: LinearProgressIndicator(
                                    value: 0.6,
                                    minHeight: 8,
                                    backgroundColor: Colors.grey[200],
                                    valueColor: AlwaysStoppedAnimation<Color>(theme.primaryColor),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: const [
                                    Text('3 of 5 days', style: TextStyle(fontSize: 11, color: Colors.grey)),
                                    Text('+100 EcoPoints', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  ],
                                )
                              ],
                            ),
                          )
                        ],
                      ),
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12.0),
                        child: Divider(),
                      ),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('⚔️ ', style: TextStyle(fontSize: 24)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Friend Duel: vs. Aditi S.',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '2-week head-to-head emission reduction challenge.',
                                  style: theme.textTheme.bodyMedium,
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: const [
                                    Text('Ends in 5 days', style: TextStyle(fontSize: 11, color: Colors.grey)),
                                    Text('Aditi is leading by 1.2kg!', style: TextStyle(fontSize: 11, color: Color(0xFFC15C3D), fontWeight: FontWeight.bold)),
                                  ],
                                )
                              ],
                            ),
                          )
                        ],
                      )
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Friend Leaderboard Section
              Text(
                'Weekly Leaderboard',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: leaderboard.length,
                itemBuilder: (context, index) {
                  final person = leaderboard[index];
                  final isMe = person['isMe'] as bool;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: isMe
                          ? theme.primaryColor.withValues(alpha: 0.08)
                          : theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isMe ? theme.primaryColor : theme.dividerColor,
                        width: isMe ? 2 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Text(
                          '#${person['rank']}',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: isMe ? theme.primaryColor : Colors.grey,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                person['name'] as String,
                                style: TextStyle(
                                  fontWeight: isMe ? FontWeight.bold : FontWeight.w600,
                                  color: isMe ? theme.primaryColor : null,
                                ),
                              ),
                              Text(
                                person['city'] as String,
                                style: const TextStyle(fontSize: 11, color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          '${person['points']} pts',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isMe ? theme.primaryColor : null,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),

              // Achievement Badges Section
              Text(
                'Achievement Badges',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.8,
                ),
                itemCount: badges.length,
                itemBuilder: (context, index) {
                  final badge = badges[index];
                  final unlocked = badge['unlocked'] as bool;
                  return Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: unlocked ? theme.primaryColor.withValues(alpha: 0.4) : theme.dividerColor,
                      ),
                    ),
                    child: Opacity(
                      opacity: unlocked ? 1.0 : 0.4,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(badge['icon'] as String, style: const TextStyle(fontSize: 36)),
                          const SizedBox(height: 8),
                          Text(
                            badge['title'] as String,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            unlocked ? 'Unlocked' : 'Locked',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: unlocked ? theme.primaryColor : Colors.grey,
                            ),
                          )
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
