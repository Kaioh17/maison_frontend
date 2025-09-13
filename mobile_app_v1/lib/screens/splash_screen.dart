import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    try {
      print('SplashScreen: Starting initialization...');
      
      // Initialize auth provider with timeout (includes API service initialization)
      await Future.any([
        context.read<AuthProvider>().initialize(),
        Future.delayed(const Duration(seconds: 10), () {
          throw TimeoutException('Auth initialization timed out', const Duration(seconds: 10));
        }),
      ]);
      
      print('SplashScreen: Auth initialization complete');
      
      // Small delay for splash effect
      await Future.delayed(const Duration(seconds: 1));
      
      print('SplashScreen: Initialization complete, navigation should happen automatically');
      
      // Fallback navigation if router doesn't redirect automatically
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        final authProvider = context.read<AuthProvider>();
        if (authProvider.isAuthenticated) {
          print('SplashScreen: Fallback - redirecting to tenant dashboard');
          context.go('/tenant');
        } else {
          print('SplashScreen: Fallback - redirecting to login');
          context.go('/login');
        }
      }
    } catch (e) {
      print('SplashScreen: Error during initialization: $e');
      // Force navigation to login on error
      if (mounted) {
        context.go('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.directions_car,
              size: 80,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 24),
            Text(
              'Maison',
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                color: Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Transportation Management',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 48),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
