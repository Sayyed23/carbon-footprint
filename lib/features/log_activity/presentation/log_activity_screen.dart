import 'package:flutter/material.dart';

class LogActivityScreen extends StatefulWidget {
  const LogActivityScreen({super.key});

  @override
  State<LogActivityScreen> createState() => _LogActivityScreenState();
}

class _LogActivityScreenState extends State<LogActivityScreen> {
  String _selectedCategory = 'Transport';
  bool _isScanning = false;
  bool _isRecording = false;

  // Manual Log Fields
  final _distanceController = TextEditingController();
  String _vehicleType = 'Petrol Car';
  final _foodWeightController = TextEditingController();
  String _foodType = 'Chicken';
  final _energyValController = TextEditingController();
  String _energyUnit = 'kWh (Electricity)';

  final List<String> _categories = ['Transport', 'Food', 'Energy', 'Shopping', 'Waste'];

  void _simulateReceiptScan() async {
    setState(() {
      _isScanning = true;
    });

    await Future<void>.delayed(const Duration(seconds: 3));

    if (!mounted) return;
    setState(() {
      _isScanning = false;
    });

    // Mock receipt data resolved by Gemini Flash
    _showLoggedDialog(
      title: 'Receipt Scanned Successfully!',
      details: 'Gemini 1.5 Flash extracted:\n\n'
          '🧾 HP Fuel Pump Invoice\n'
          '🚗 Fuel Type: Petrol\n'
          '📏 Quantity: 15 Litres (~120 km equivalent)\n'
          '⚠️ Carbon Impact: 23.0 kg CO₂e\n'
          '🏆 EcoPoints earned: +20',
    );
  }

  void _simulateVoiceLogging() async {
    setState(() {
      _isRecording = true;
    });

    await Future<void>.delayed(const Duration(seconds: 3));

    if (!mounted) return;
    setState(() {
      _isRecording = false;
    });

    // Mock voice data resolved by Gemini Live
    _showLoggedDialog(
      title: 'Voice Activity Logged!',
      details: 'Gemini Live transcribed & mapped:\n\n'
          '🗣️ "I just travelled 12km in Mumbai Metro"\n'
          '🚇 Mode: Urban Metro / Rail\n'
          '📏 Distance: 12 km\n'
          '✅ Carbon Impact: 0.37 kg CO₂e (Metro offset benefit applied)\n'
          '🏆 EcoPoints earned: +25',
    );
  }

  void _submitManualLog() {
    String title = '';
    String details = '';

    if (_selectedCategory == 'Transport') {
      final dist = double.tryParse(_distanceController.text) ?? 0;
      if (dist <= 0) return;
      double factor = 0.192; // Petrol
      if (_vehicleType == 'Diesel Car') factor = 0.171;
      if (_vehicleType == 'CNG Auto') factor = 0.089;
      if (_vehicleType == 'Metro / Rail') factor = 0.031;
      final impact = dist * factor;

      title = 'Commute Logged!';
      details = '🚗 Mode: $_vehicleType\n'
          '📏 Distance: $dist km\n'
          '⚠️ Carbon Impact: ${impact.toStringAsFixed(2)} kg CO₂e\n'
          '🏆 EcoPoints earned: +20';
    } else if (_selectedCategory == 'Food') {
      final weight = double.tryParse(_foodWeightController.text) ?? 0;
      if (weight <= 0) return;
      double factor = 6.9; // Chicken
      if (_foodType == 'Beef') factor = 27.0;
      if (_foodType == 'Rice') factor = 2.7;
      final impact = weight * factor;

      title = 'Diet Item Logged!';
      details = '🥩 Item: $_foodType\n'
          '📏 Quantity: $weight kg\n'
          '⚠️ Carbon Impact: ${impact.toStringAsFixed(2)} kg CO₂e\n'
          '🏆 EcoPoints earned: +5';
    } else {
      final value = double.tryParse(_energyValController.text) ?? 0;
      if (value <= 0) return;
      double factor = 0.82; // Electricity grid
      if (_energyUnit == 'LPG Cooking (Cylinder)') factor = 38.6;
      final impact = value * factor;

      title = 'Home Energy Logged!';
      details = '⚡ Resource: $_energyUnit\n'
          '📏 Quantity: $value units\n'
          '⚠️ Carbon Impact: ${impact.toStringAsFixed(2)} kg CO₂e\n'
          '🏆 EcoPoints earned: +10';
    }

    _showLoggedDialog(title: title, details: details);
    _distanceController.clear();
    _foodWeightController.clear();
    _energyValController.clear();
  }

  void _showLoggedDialog({required String title, required String details}) {
    showDialog<void>(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Outfit')),
          content: Text(details, style: const TextStyle(fontSize: 15, height: 1.4)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Awesome', style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  Widget _buildForm() {
    if (_selectedCategory == 'Transport') {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Select Vehicle Type', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _vehicleType,
            decoration: InputDecoration(
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
            items: ['Petrol Car', 'Diesel Car', 'CNG Auto', 'Metro / Rail', 'Electric Vehicle']
                .map((type) => DropdownMenuItem(value: type, child: Text(type)))
                .toList(),
            onChanged: (val) => setState(() => _vehicleType = val!),
          ),
          const SizedBox(height: 16),
          const Text('Distance Travelled (km)', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextField(
            controller: _distanceController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              hintText: 'e.g., 15.5',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      );
    } else if (_selectedCategory == 'Food') {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Diet / Ingredient Type', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _foodType,
            decoration: InputDecoration(
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
            items: ['Beef', 'Chicken', 'Rice', 'Dairy Milk', 'Vegan Meal']
                .map((type) => DropdownMenuItem(value: type, child: Text(type)))
                .toList(),
            onChanged: (val) => setState(() => _foodType = val!),
          ),
          const SizedBox(height: 16),
          const Text('Quantity (kg)', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextField(
            controller: _foodWeightController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              hintText: 'e.g., 0.5',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      );
    } else if (_selectedCategory == 'Energy') {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Utility Type', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _energyUnit,
            decoration: InputDecoration(
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
            items: ['kWh (Electricity)', 'LPG Cooking (Cylinder)']
                .map((type) => DropdownMenuItem(value: type, child: Text(type)))
                .toList(),
            onChanged: (val) => setState(() => _energyUnit = val!),
          ),
          const SizedBox(height: 16),
          const Text('Consumption Value', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextField(
            controller: _energyValController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              hintText: 'e.g., 120 (kWh) or 1 (cylinder)',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      );
    } else {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Center(
          child: Text(
            'Shopping & Waste categories support is logging dynamically. Try scanning a receipt or asking the Gemini Coach to log these categories.',
            textAlign: TextAlign.center,
            style: TextStyle(fontStyle: FontStyle.italic),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Log Carbon Footprint', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Outfit')),
        centerTitle: true,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // AI Logging options (Camera & Voice)
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: _isScanning ? null : _simulateReceiptScan,
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 24),
                        decoration: BoxDecoration(
                          color: theme.primaryColor.withValues(alpha: 0.06),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: theme.primaryColor.withValues(alpha: 0.2)),
                        ),
                        child: Column(
                          children: [
                            if (_isScanning)
                              const CircularProgressIndicator()
                            else ...[
                              Icon(Icons.camera_alt, size: 36, color: theme.primaryColor),
                              const SizedBox(height: 8),
                              const Text('Scan Receipt', style: TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text('Gemini 1.5 Flash', style: theme.textTheme.bodyMedium?.copyWith(fontSize: 11)),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: GestureDetector(
                      onLongPressStart: (_) => _simulateVoiceLogging(),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 24),
                        decoration: BoxDecoration(
                          color: _isRecording ? const Color(0xFFC15C3D).withValues(alpha: 0.1) : Colors.grey.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: _isRecording ? const Color(0xFFC15C3D) : theme.dividerColor,
                            width: _isRecording ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          children: [
                            if (_isRecording) ...[
                              const Icon(Icons.mic, size: 36, color: Color(0xFFC15C3D)),
                              const SizedBox(height: 8),
                              const Text('Recording...', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFC15C3D))),
                              const SizedBox(height: 4),
                              const Text('Speak to log', style: TextStyle(fontSize: 11)),
                            ] else ...[
                              Icon(Icons.mic, size: 36, color: theme.colorScheme.onSurface.withValues(alpha: 0.6)),
                              const SizedBox(height: 8),
                              const Text('Hold Mic Button', style: TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text('Voice Log (Gemini Live)', style: theme.textTheme.bodyMedium?.copyWith(fontSize: 11)),
                            ]
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              Row(
                children: [
                  Expanded(child: Divider(color: theme.dividerColor)),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.0),
                    child: Text('OR MANUAL LOG', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                  ),
                  Expanded(child: Divider(color: theme.dividerColor)),
                ],
              ),
              const SizedBox(height: 24),

              // Category Selector Slider
              SizedBox(
                height: 44,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final isSelected = cat == _selectedCategory;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: ChoiceChip(
                        label: Text(
                          cat,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: theme.primaryColor,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _selectedCategory = cat;
                            });
                          }
                        },
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),

              // Build Active manual form
              _buildForm(),
              const SizedBox(height: 32),

              // Log Entry Button
              if (_selectedCategory == 'Transport' || _selectedCategory == 'Food' || _selectedCategory == 'Energy')
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
                    onPressed: _submitManualLog,
                    child: const Text('Add Log Entry', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
