import 'package:flutter_test/flutter_test.dart';
import 'package:ecotrace/main.dart';

void main() {
  testWidgets('EcoTrace Onboarding Splash screen widget test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const EcoTraceApp());

    // Verify that the splash page is showing the first onboarding slide
    expect(find.text('Track your Carbon Footprint'), findsOneWidget);
    expect(
      find.text('Automatically measure your commute, meals, and home energy consumption with India-localized factors.'),
      findsOneWidget,
    );

    // Verify that the Next button is present
    expect(find.text('Next'), findsOneWidget);
  });
}
