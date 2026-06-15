import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/di/injection.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Local Hive Database for Offline-first 7-day cache
  await Hive.initFlutter();
  await Hive.openBox('emissionsBox');
  await Hive.openBox('settingsBox');

  // Initialize Dependency Injection
  configureDependencies();

  runApp(const EcoTraceApp());
}

class EcoTraceApp extends StatelessWidget {
  const EcoTraceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'EcoTrace',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system, // Dynamically toggle based on platform dark mode settings
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
