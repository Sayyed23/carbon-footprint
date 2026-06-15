import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // DPDP Consent Switches
  bool _bgLocationConsent = true;
  bool _anonymousAnalyticsConsent = true;
  bool _dailyReminders = true;

  void _exportUserData() {
    showDialog<void>(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Export Personal Data (DPDP Act)', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Outfit')),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('Your requested data packet has been prepared in standard JSON format.'),
              SizedBox(height: 12),
              Text(
                'Includes: Account profile, 5-step Quiz responses, daily emission logs, and EcoPoints ledger.',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: theme.primaryColor),
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Downloading eco_trace_profile_export.json...')),
                );
              },
              child: const Text('Download JSON', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  void _requestAccountDeletion() {
    showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Delete Account?', style: TextStyle(color: Color(0xFFC15C3D), fontWeight: FontWeight.bold, fontFamily: 'Outfit')),
          content: const Text(
            'This action is irreversible. Sourcing from India DPDP Act and GDPR guidelines, all Firestore records, logs, and authentication IDs will be purged within 30 days.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFC15C3D)),
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Account scheduled for deletion. Good bye!')),
                );
                context.go('/login');
              },
              child: const Text('Delete Permanently', style: TextStyle(color: Colors.white)),
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
        title: const Text('Profile & Settings', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Outfit')),
        centerTitle: true,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User Avatar Card
              Center(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: theme.primaryColor.withValues(alpha: 0.1),
                      child: Text('KJ', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: theme.primaryColor)),
                    ),
                    const SizedBox(height: 12),
                    Text('Karan Johar', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                    const Text('karan.johar@ecotrace.in', style: TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Carbon Goals Card
              Text(
                'Personal Target',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      const Icon(Icons.track_changes, size: 28, color: Color(0xFFD4A373)),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text('3-Month Target (15% Reduction)', style: TextStyle(fontWeight: FontWeight.bold)),
                            SizedBox(height: 4),
                            Text('Targeting 4.4 kg CO₂e / day limit', style: TextStyle(fontSize: 13, color: Colors.grey)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.edit, size: 20),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Target modification is coming soon!')),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // DPDP Act Consent Management Section
              Text(
                'Data Consent Settings (DPDP Act)',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Card(
                child: Column(
                  children: [
                    SwitchListTile(
                      title: const Text('Background Location Tracking', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: const Text('Used to auto-detect cycling/walking distances and compute transport offsets.', style: TextStyle(fontSize: 11)),
                      value: _bgLocationConsent,
                      activeTrackColor: theme.primaryColor,
                      onChanged: (val) => setState(() => _bgLocationConsent = val),
                    ),
                    const Divider(height: 1),
                    SwitchListTile(
                      title: const Text('Anonymous Demographic Sharing', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: const Text('Used to compute localized city-level averages for community reports.', style: TextStyle(fontSize: 11)),
                      value: _anonymousAnalyticsConsent,
                      activeTrackColor: theme.primaryColor,
                      onChanged: (val) => setState(() => _anonymousAnalyticsConsent = val),
                    ),
                    const Divider(height: 1),
                    SwitchListTile(
                      title: const Text('Push Notification Alerts', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: const Text('Daily budget status warnings and streak notification prompts.', style: TextStyle(fontSize: 11)),
                      value: _dailyReminders,
                      activeTrackColor: theme.primaryColor,
                      onChanged: (val) => setState(() => _dailyReminders = val),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Data Subject Rights Console
              Text(
                'Personal Data Actions',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Card(
                child: Column(
                  children: [
                    ListTile(
                      leading: Icon(Icons.download_rounded, color: theme.primaryColor),
                      title: const Text('Export Data Packet', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: _exportUserData,
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.delete_forever_rounded, color: Color(0xFFC15C3D)),
                      title: const Text('Request Account Deletion', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFFC15C3D))),
                      trailing: const Icon(Icons.chevron_right, color: Color(0xFFC15C3D)),
                      onTap: _requestAccountDeletion,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Logout Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFC15C3D)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () => context.go('/login'),
                  child: const Text(
                    'Log Out',
                    style: TextStyle(color: Color(0xFFC15C3D), fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
