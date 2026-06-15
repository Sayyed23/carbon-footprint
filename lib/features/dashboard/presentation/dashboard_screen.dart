import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _carbonAnimation;

  // Mock Dashboard State
  final double _dailyBudget = 5.2; // 5.2 kg CO₂e daily target
  final double _currentEmissions = 3.8; // Current logged emissions
  final int _streak = 7; // Streak counter

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _carbonAnimation = Tween<double>(begin: 0, end: _currentEmissions / _dailyBudget).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.decelerate),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final percentage = _currentEmissions / _dailyBudget;
    final isOverBudget = _currentEmissions > _dailyBudget;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Namaste, Eco Racer 👋',
                        style: TextStyle(fontSize: 16, color: Colors.grey, fontWeight: FontWeight.w500),
                      ),
                      Text(
                        'Your Carbon Footprint',
                        style: theme.textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Outfit',
                        ),
                      ),
                    ],
                  ),
                  // Streak Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFD166).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFFFD166), width: 1.5),
                    ),
                    child: Row(
                      children: [
                        const Text('🔥 ', style: TextStyle(fontSize: 16)),
                        Text(
                          '$_streak Days',
                          style: const TextStyle(
                            color: Color(0xFFB58D1C),
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
              const SizedBox(height: 24),

              // Animated Carbon Ring Card
              Center(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.02),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      )
                    ],
                  ),
                  child: Column(
                    children: [
                      AnimatedBuilder(
                        animation: _carbonAnimation,
                        builder: (context, child) {
                          return CustomPaint(
                            size: const Size(180, 180),
                            painter: CarbonRingPainter(
                              progress: _carbonAnimation.value,
                              primaryColor: isOverBudget ? const Color(0xFFC15C3D) : theme.primaryColor,
                              backgroundColor: theme.brightness == Brightness.light
                                  ? const Color(0xFFE2E8F0)
                                  : const Color(0xFF24322C),
                            ),
                            child: SizedBox(
                              width: 180,
                              height: 180,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    '${_currentEmissions.toStringAsFixed(1)} kg',
                                    style: TextStyle(
                                      fontSize: 32,
                                      fontWeight: FontWeight.black,
                                      color: isOverBudget ? const Color(0xFFC15C3D) : theme.primaryColor,
                                      fontFamily: 'Outfit',
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  const Text(
                                    'CO₂ e Today',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.grey,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Budget: ${_dailyBudget.toStringAsFixed(1)} kg',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            isOverBudget ? Icons.warning_amber_rounded : Icons.check_circle_outline,
                            color: isOverBudget ? const Color(0xFFC15C3D) : const Color(0xFF4A7C59),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            isOverBudget
                                ? 'Alert: You are ${(percentage * 100 - 100).toStringAsFixed(0)}% above budget'
                                : 'Great job! You have ${(100 - percentage * 100).toStringAsFixed(0)}% budget left',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: isOverBudget ? const Color(0xFFC15C3D) : const Color(0xFF4A7C59),
                            ),
                          )
                        ],
                      )
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Benchmark & Tips Feed Card (Vertex Recommendation Mock)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: theme.brightness == Brightness.light
                        ? [const Color(0xFFE3F2FD), const Color(0xFFE8F5E9)]
                        : [const Color(0xFF14213d), const Color(0xFF0F261C)],
                  ),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text('⚡ ', style: TextStyle(fontSize: 18)),
                        Text(
                          "Today's Top Action",
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Switch your commute today — AQI in Pune is 187. Metro is healthier AND saves 1.4 kg CO₂ compared to your usual car trip.',
                      style: TextStyle(fontSize: 14, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Category Breakdown Donut Chart
              Text(
                'Category Breakdown',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Container(
                height: 200,
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(24),
                ),
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      flex: 5,
                      child: PieChart(
                        PieChartData(
                          sectionsSpace: 4,
                          centerSpaceRadius: 40,
                          sections: [
                            PieChartSectionData(
                              color: const Color(0xFF0F5132),
                              value: 45,
                              title: '45%',
                              radius: 40,
                              titleStyle: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 12),
                            ),
                            PieChartSectionData(
                              color: const Color(0xFF2EC4B6),
                              value: 25,
                              title: '25%',
                              radius: 40,
                              titleStyle: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 12),
                            ),
                            PieChartSectionData(
                              color: const Color(0xFFD4A373),
                              value: 15,
                              title: '15%',
                              radius: 40,
                              titleStyle: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 12),
                            ),
                            PieChartSectionData(
                              color: const Color(0xFFC15C3D),
                              value: 10,
                              title: '10%',
                              radius: 40,
                              titleStyle: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 12),
                            ),
                            PieChartSectionData(
                              color: Colors.grey,
                              value: 5,
                              title: '5%',
                              radius: 40,
                              titleStyle: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 5,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLegendItem(const Color(0xFF0F5132), 'Transport'),
                          _buildLegendItem(const Color(0xFF2EC4B6), 'Food'),
                          _buildLegendItem(const Color(0xFFD4A373), 'Energy'),
                          _buildLegendItem(const Color(0xFFC15C3D), 'Shopping'),
                          _buildLegendItem(Colors.grey, 'Waste'),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 30-Day Sparkline / LineChart
              Text(
                '30-Day Emission Trend',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Container(
                height: 220,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: LineChart(
                  LineChartData(
                    gridData: const FlGridData(show: false),
                    titlesData: const FlTitlesData(
                      leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    ),
                    borderData: FlBorderData(show: false),
                    minX: 0,
                    maxX: 7,
                    minY: 0,
                    maxY: 8,
                    lineBarsData: [
                      LineChartBarData(
                        spots: const [
                          FlSpot(0, 3.2),
                          FlSpot(1, 4.5),
                          FlSpot(2, 5.0),
                          FlSpot(3, 3.8),
                          FlSpot(4, 2.9),
                          FlSpot(5, 5.8),
                          FlSpot(6, 4.2),
                          FlSpot(7, 3.8),
                        ],
                        isCurved: true,
                        color: theme.primaryColor,
                        barWidth: 4,
                        isStrokeCapRound: true,
                        dotData: const FlDotData(show: false),
                        belowBarData: BarAreaData(
                          show: true,
                          color: theme.primaryColor.withOpacity(0.1),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

// Custom Painter for the Animated Carbon Ring
class CarbonRingPainter extends CustomPainter {
  final double progress;
  final Color primaryColor;
  final Color backgroundColor;

  CarbonRingPainter({
    required this.progress,
    required this.primaryColor,
    required this.backgroundColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 10;
    final strokeWidth = 16.0;

    // Background track
    final bgPaint = Paint()
      ..color = backgroundColor
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    canvas.drawCircle(center, radius, bgPaint);

    // Active progress arc
    final progressPaint = Paint()
      ..color = primaryColor
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final startAngle = -math.pi / 2;
    // Cap progress rendering to 1.0 (full circle) representation visually to avoid infinite overlap
    final sweepAngle = 2 * math.pi * progress.clamp(0.0, 1.0);

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CarbonRingPainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.primaryColor != primaryColor ||
        oldDelegate.backgroundColor != backgroundColor;
  }
}
