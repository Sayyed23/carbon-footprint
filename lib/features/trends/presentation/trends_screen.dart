import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class TrendsScreen extends StatefulWidget {
  const TrendsScreen({super.key});

  @override
  State<TrendsScreen> createState() => _TrendsScreenState();
}

class _TrendsScreenState extends State<TrendsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedTabIndex = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      setState(() {
        _selectedTabIndex = _tabController.index;
      });
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // Weekly Emissions (kg CO₂e) vs. Benchmark (4.4 kg target)
  final List<double> _weeklyData = [3.2, 4.5, 5.0, 3.8, 2.9, 5.8, 4.2];
  final double _weeklyBenchmark = 4.4;

  // Monthly Emissions (kg CO₂e) vs. Benchmark (30.8 kg weekly target)
  final List<double> _monthlyData = [25.4, 32.1, 28.5, 24.2];
  final double _monthlyBenchmark = 30.8;

  // AI-generated insights list
  final List<Map<String, String>> _insights = [
    {
      'emoji': '⚡',
      'title': 'Energy Spike Detected',
      'desc': 'Your home electricity use was 35% higher on Thursday compared to your weekly average. Try raising your AC thermostat from 22°C to 24°C to offset up to 1.8 kg of CO₂e.',
    },
    {
      'emoji': '🥗',
      'title': 'Sustainable Diet Win',
      'desc': 'Going meat-free for 3 consecutive days this week saved an estimated 10.2 kg of CO₂e compared to last week! Keep it up to earn the Plant-Based Pioneer badge.',
    },
    {
      'emoji': '🚇',
      'title': 'Commute Optimization',
      'desc': 'Your car trip emissions accounted for 60% of your total footprint. Commuting by Pune Metro instead of a petrol car just twice a week will save ₹380 and reduce emissions by 5.6 kg CO₂e.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Trends & Insights',
          style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Outfit'),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Period Selector Tabs
              Container(
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: theme.dividerColor),
                ),
                padding: const EdgeInsets.all(4),
                child: TabBar(
                  controller: _tabController,
                  indicator: BoxDecoration(
                    color: theme.primaryColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  labelColor: Colors.white,
                  unselectedLabelColor: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  tabs: const [
                    Tab(text: 'Weekly'),
                    Tab(text: 'Monthly'),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Bar Chart Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    )
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _selectedTabIndex == 0 ? 'Daily Emissions (kg CO₂e)' : 'Weekly Emissions (kg CO₂e)',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Row(
                          children: [
                            Container(
                              width: 12,
                              height: 12,
                              decoration: const BoxDecoration(
                                color: Color(0xFFC15C3D),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              'Target Limit',
                              style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold),
                            ),
                          ],
                        )
                      ],
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      height: 200,
                      child: BarChart(
                        BarChartData(
                          alignment: BarChartAlignment.spaceAround,
                          maxY: _selectedTabIndex == 0 ? 8.0 : 40.0,
                          barTouchData: BarTouchData(
                            touchTooltipData: BarTouchTooltipData(
                              getTooltipColor: (group) => theme.colorScheme.surface,
                              getTooltipItem: (group, groupIndex, rod, rodIndex) {
                                return BarTooltipItem(
                                  '${rod.toY.toStringAsFixed(1)} kg',
                                  TextStyle(
                                    color: theme.primaryColor,
                                    fontWeight: FontWeight.bold,
                                  ),
                                );
                              },
                            ),
                          ),
                          titlesData: FlTitlesData(
                            show: true,
                            bottomTitles: AxisTitles(
                              sideTitles: SideTitles(
                                showTitles: true,
                                getTitlesWidget: (double value, TitleMeta meta) {
                                  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                                  const monthWeeks = ['W1', 'W2', 'W3', 'W4'];
                                  final index = value.toInt();
                                  String text = '';
                                  if (_selectedTabIndex == 0) {
                                    if (index >= 0 && index < weekDays.length) {
                                      text = weekDays[index];
                                    }
                                  } else {
                                    if (index >= 0 && index < monthWeeks.length) {
                                      text = monthWeeks[index];
                                    }
                                  }
                                  return SideTitleWidget(
                                    meta: meta,
                                    space: 8,
                                    child: Text(
                                      text,
                                      style: const TextStyle(
                                        color: Colors.grey,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                            leftTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false),
                            ),
                            topTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false),
                            ),
                            rightTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false),
                            ),
                          ),
                          gridData: const FlGridData(show: false),
                          borderData: FlBorderData(show: false),
                          barGroups: _buildBarGroups(theme),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Peer Comparison Panel
              Text(
                'Community Benchmark',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: theme.primaryColor.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: theme.primaryColor.withValues(alpha: 0.1)),
                ),
                child: Row(
                  children: [
                    const Text('📊 ', style: TextStyle(fontSize: 36)),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'You emit 18% less than Pune average',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Your average daily carbon footprint is 3.9 kg CO₂e compared to the city average of 4.8 kg CO₂e.',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Gemini AI Insights List
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'AI Insights & Suggestions',
                    style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.purple.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.auto_awesome, size: 12, color: Colors.purple),
                        SizedBox(width: 4),
                        Text(
                          'Gemini AI',
                          style: TextStyle(fontSize: 10, color: Colors.purple, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _insights.length,
                itemBuilder: (context, index) {
                  final insight = _insights[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: theme.dividerColor),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          insight['emoji'] ?? '💡',
                          style: const TextStyle(fontSize: 24),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                insight['title'] ?? '',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                insight['desc'] ?? '',
                                style: TextStyle(
                                  fontSize: 13,
                                  height: 1.4,
                                  color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<BarChartGroupData> _buildBarGroups(ThemeData theme) {
    if (_selectedTabIndex == 0) {
      // Weekly view
      return List.generate(_weeklyData.length, (index) {
        final val = _weeklyData[index];
        final isOver = val > _weeklyBenchmark;
        return BarChartGroupData(
          x: index,
          barRods: [
            BarChartRodData(
              toY: val,
              color: isOver ? const Color(0xFFC15C3D) : theme.primaryColor,
              width: 22,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
              backDrawRodData: BackgroundBarChartRodData(
                show: true,
                toY: _weeklyBenchmark,
                color: const Color(0xFFC15C3D).withValues(alpha: 0.15),
              ),
            ),
          ],
        );
      });
    } else {
      // Monthly view
      return List.generate(_monthlyData.length, (index) {
        final val = _monthlyData[index];
        final isOver = val > _monthlyBenchmark;
        return BarChartGroupData(
          x: index,
          barRods: [
            BarChartRodData(
              toY: val,
              color: isOver ? const Color(0xFFC15C3D) : theme.primaryColor,
              width: 32,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
              backDrawRodData: BackgroundBarChartRodData(
                show: true,
                toY: _monthlyBenchmark,
                color: const Color(0xFFC15C3D).withValues(alpha: 0.15),
              ),
            ),
          ],
        );
      });
    }
  }
}
