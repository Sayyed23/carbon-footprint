import 'package:flutter/material.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  int _userEcoPoints = 580; // Starting mock balance
  final List<Map<String, dynamic>> _myOffsets = [
    {
      'id': 'ET-738-PN',
      'project': 'SayTrees - Pune Urban Forest',
      'type': 'Reforestation',
      'age': '8 months (Sapling)',
      'coordinates': '18.5204° N, 73.8567° E',
      'lastInspected': '12 days ago',
      'status': 'Healthy',
    }
  ];

  final List<Map<String, dynamic>> _projects = [
    {
      'id': 'p1',
      'ngo': 'SayTrees',
      'title': 'Pune Urban Forest Project',
      'desc': 'Fostering biodiversity in urban regions using Miyawaki planting methods.',
      'costPoints': 500,
      'costCash': 100,
      'location': 'Pune, Maharashtra',
      'icon': '🌳',
    },
    {
      'id': 'p2',
      'ngo': 'SankalpTaru',
      'title': 'Western Ghats Corridor Restoration',
      'desc': 'Replanting critical ecological pathways in Kerala forest reserves.',
      'costPoints': 800,
      'costCash': 150,
      'location': 'Silent Valley, Kerala',
      'icon': '🌲',
    },
    {
      'id': 'p3',
      'ngo': 'Grow-Trees',
      'title': 'Aravali Range Buffer Zone',
      'desc': 'Combating desertification through planting indigenous dry-region trees.',
      'costPoints': 1000,
      'costCash': 200,
      'location': 'Alwar, Rajasthan',
      'icon': '🌵',
    },
  ];

  final List<Map<String, dynamic>> _recs = [
    {
      'id': 'rec1',
      'title': '100 kWh Wind Energy Certificate',
      'desc': 'Off-grid wind project certificate sourced from Karnataka wind farms.',
      'costCash': 120,
      'source': 'CleanEnergy India Ltd.',
    },
    {
      'id': 'rec2',
      'title': '250 kWh Solar Power Certificate',
      'desc': 'Standard solar power grid input certificate from Thar Desert solar park.',
      'costCash': 280,
      'source': 'Thar Grid Corp.',
    },
  ];

  void _redeemWithPoints(int index) {
    final proj = _projects[index];
    final cost = proj['costPoints'] as int;

    if (_userEcoPoints < cost) {
      showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Insufficient Balance', style: TextStyle(fontWeight: FontWeight.bold)),
          content: Text(
            'You need $cost EcoPoints to redeem this project. Keep completing daily actions to earn more!',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK'),
            ),
          ],
        ),
      );
      return;
    }

    setState(() {
      _userEcoPoints -= cost;
      // Add to my offsets list
      _myOffsets.insert(0, {
        'id': 'ET-NEW-${_myOffsets.length + 100}',
        'project': '${proj['ngo']} - ${proj['title']}',
        'type': 'Reforestation',
        'age': 'Planted Today',
        'coordinates': 'Pending Allocation',
        'lastInspected': 'Just Registered',
        'status': 'Allocated',
      });
    });

    _showSuccessDialog(
      title: 'Points Redeemed!',
      body: 'You successfully redeemed $cost EcoPoints for a sapling planting in: \n"${proj['title']}"\n\nA new tree has been allocated to your account and is tracked in your Transparency Dashboard.',
    );
  }

  void _buyWithGooglePay(String title, int amount, bool isREC) {
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        final theme = Theme.of(context);
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: [
              Image.network(
                'https://upload.wikimedia.org/wikipedia/commons/b/b5/Google_Pay_%28GPay%29_Logo_2020.svg',
                height: 24,
                errorBuilder: (context, error, stackTrace) => const Icon(Icons.payment, color: Colors.blue),
              ),
              const SizedBox(width: 8),
              const Text('Google Pay', style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Secure checkout via Google Pay API.'),
              const SizedBox(height: 16),
              Text(
                'Merchant: EcoTrace India Foundation',
                style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey),
              ),
              Text(
                'Product: $title',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total Amount:', style: TextStyle(fontWeight: FontWeight.bold)),
                  Text(
                    '₹${amount.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: theme.primaryColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.primaryColor,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                Navigator.pop(context);
                if (isREC) {
                  _showSuccessDialog(
                    title: 'REC Purchased!',
                    body: 'Your purchase of "$title" for ₹$amount was successful via Google Pay.\n\nYour Green Grid Certificate has been generated.',
                  );
                } else {
                  setState(() {
                    _myOffsets.insert(0, {
                      'id': 'ET-PAY-${_myOffsets.length + 200}',
                      'project': title,
                      'type': 'Reforestation Contribution',
                      'age': 'Funding Confirmed',
                      'coordinates': 'Pending Sowing',
                      'lastInspected': 'N/A',
                      'status': 'Funding Cleared',
                    });
                  });
                  _showSuccessDialog(
                    title: 'Contribution Successful!',
                    body: 'Your cash contribution of ₹$amount to "$title" was successful. Thank you for your climate advocacy!',
                  );
                }
              },
              child: const Text('Pay with Google Pay', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  void _showSuccessDialog({required String title, required String body}) {
    showDialog<void>(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Outfit')),
          content: Text(body, style: const TextStyle(fontSize: 14, height: 1.4)),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.primaryColor,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text('Great', style: TextStyle(color: Colors.white)),
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
          'Offset Marketplace',
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
              // Points Balance Panel
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [const Color(0xFF4A7C59), theme.primaryColor],
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
                          'YOUR ECOBALANCE',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '$_userEcoPoints EcoPoints',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            fontFamily: 'Outfit',
                          ),
                        ),
                      ],
                    ),
                    const Text('🪙', style: TextStyle(fontSize: 44)),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Transparency Dashboard Section
              Text(
                'Transparency Tracking Dashboard',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              const Text(
                'Track and audit exactly where your reforestation offsets are physically located.',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: theme.dividerColor),
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.location_on, color: Colors.green),
                        SizedBox(width: 8),
                        Text(
                          'Your Active Reforestation Offsets',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _myOffsets.length,
                      itemBuilder: (context, index) {
                        final offset = _myOffsets[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.grey.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Tree ID: ${offset['id']}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: theme.primaryColor,
                                      fontSize: 13,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.green.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      offset['status'] as String,
                                      style: const TextStyle(
                                        color: Colors.green,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                offset['project'] as String,
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Coordinates: ${offset['coordinates']}',
                                style: const TextStyle(fontSize: 11, color: Colors.grey),
                              ),
                              Text(
                                'Age: ${offset['age']} | Last Inspected: ${offset['lastInspected']}',
                                style: const TextStyle(fontSize: 11, color: Colors.grey),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // NGO Projects Section
              Text(
                'Redeem Tree Plantings (India Projects)',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _projects.length,
                itemBuilder: (context, index) {
                  final proj = _projects[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(proj['icon'] as String, style: const TextStyle(fontSize: 24)),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      proj['title'] as String,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                    ),
                                    Text(
                                      'by ${proj['ngo']} • ${proj['location']}',
                                      style: const TextStyle(fontSize: 11, color: Colors.grey),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            proj['desc'] as String,
                            style: TextStyle(fontSize: 13, color: Colors.grey[700], height: 1.3),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              // Redeem Points Button
                              Expanded(
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: theme.primaryColor,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                  onPressed: () => _redeemWithPoints(index),
                                  child: Text(
                                    '${proj['costPoints']} Points',
                                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              // Pay Cash Button
                              Expanded(
                                child: OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    side: BorderSide(color: theme.primaryColor),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                  onPressed: () => _buyWithGooglePay(
                                    '${proj['ngo']} - ${proj['title']}',
                                    proj['costCash'] as int,
                                    false,
                                  ),
                                  child: Text(
                                    '₹${proj['costCash']}',
                                    style: TextStyle(color: theme.primaryColor, fontSize: 13, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                            ],
                          )
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 28),

              // Renewable Energy Certificates Section
              Text(
                'Renewable Energy Certificates (REC)',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _recs.length,
                itemBuilder: (context, index) {
                  final rec = _recs[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Text('🔌 ', style: TextStyle(fontSize: 20)),
                              Text(
                                'Green Power Offset',
                                style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 11),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            rec['title'] as String,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            rec['desc'] as String,
                            style: TextStyle(fontSize: 12, color: Colors.grey[700], height: 1.3),
                          ),
                          const SizedBox(height: 14),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Source: ${rec['source']}',
                                style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Colors.grey),
                              ),
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFC15C3D),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                icon: const Icon(Icons.payment, size: 14, color: Colors.white),
                                label: Text(
                                  '₹${rec['costCash']}',
                                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                                onPressed: () => _buyWithGooglePay(
                                  rec['title'] as String,
                                  rec['costCash'] as int,
                                  true,
                                ),
                              ),
                            ],
                          )
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
