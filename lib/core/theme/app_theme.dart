import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors
  static const Color primaryGreen = Color(0xFF0F5132); // Deep Forest Emerald
  static const Color secondaryMint = Color(0xFF2EC4B6); // Clean Mint Accent
  static const Color backgroundLight = Color(0xFFF4F6F4); // Cream Off-White
  static const Color backgroundDark = Color(0xFF101613); // Deep Jungle Shadow

  // Color-Blind Safe Emission Alert Palette (Contrast-checked & double differentiated)
  static const Color safeGreen = Color(0xFF4A7C59); // Sage Green (Safe Zone)
  static const Color moderateAmber = Color(0xFFD4A373); // Rich Ochre (Moderate Zone)
  static const Color highTerracotta = Color(0xFFC15C3D); // Warm Terracotta (High/Alert Zone)

  // Surface Colors
  static const Color cardLight = Colors.white;
  static const Color cardDark = Color(0xFF18221E);

  // Text Colors
  static const Color textLightPrimary = Color(0xFF212529);
  static const Color textLightSecondary = Color(0xFF6C757D);
  static const Color textDarkPrimary = Color(0xFFE9ECEF);
  static const Color textDarkSecondary = Color(0xFFADB5BD);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryGreen,
      colorScheme: const ColorScheme.light(
        primary: primaryGreen,
        secondary: secondaryMint,
        surface: cardLight,
        error: highTerracotta,
      ),
      scaffoldBackgroundColor: backgroundLight,
      cardTheme: const CardThemeData(
        color: cardLight,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
          side: BorderSide(color: Color(0xFFE2E8F0), width: 1),
        ),
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(fontFamily: 'Outfit', fontSize: 32, fontWeight: FontWeight.bold, color: textLightPrimary),
        headlineMedium: TextStyle(fontFamily: 'Outfit', fontSize: 24, fontWeight: FontWeight.bold, color: textLightPrimary),
        titleLarge: TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.w600, color: textLightPrimary),
        bodyLarge: TextStyle(fontFamily: 'Inter', fontSize: 16, color: textLightPrimary),
        bodyMedium: TextStyle(fontFamily: 'Inter', fontSize: 14, color: textLightSecondary),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: primaryGreen,
      colorScheme: const ColorScheme.dark(
        primary: primaryGreen,
        secondary: secondaryMint,
        surface: cardDark,
        error: highTerracotta,
      ),
      scaffoldBackgroundColor: backgroundDark,
      cardTheme: const CardThemeData(
        color: cardDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
          side: BorderSide(color: Color(0xFF24322C), width: 1),
        ),
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(fontFamily: 'Outfit', fontSize: 32, fontWeight: FontWeight.bold, color: textDarkPrimary),
        headlineMedium: TextStyle(fontFamily: 'Outfit', fontSize: 24, fontWeight: FontWeight.bold, color: textDarkPrimary),
        titleLarge: TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.w600, color: textDarkPrimary),
        bodyLarge: TextStyle(fontFamily: 'Inter', fontSize: 16, color: textDarkPrimary),
        bodyMedium: TextStyle(fontFamily: 'Inter', fontSize: 14, color: textDarkSecondary),
      ),
    );
  }
}
