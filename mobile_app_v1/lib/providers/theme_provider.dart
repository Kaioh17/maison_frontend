import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ThemeProvider with ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.dark;
  bool _isDark = true;

  ThemeMode get themeMode => _themeMode;
  bool get isDark => _isDark;
  bool get isLight => !_isDark;

  ThemeProvider() {
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final themeString = prefs.getString(AppConfig.themeKey) ?? AppConfig.defaultTheme;
      
      switch (themeString) {
        case 'light':
          _themeMode = ThemeMode.light;
          _isDark = false;
          break;
        case 'dark':
          _themeMode = ThemeMode.dark;
          _isDark = true;
          break;
        case 'auto':
          _themeMode = ThemeMode.system;
          _isDark = WidgetsBinding.instance.platformDispatcher.platformBrightness == Brightness.dark;
          break;
        default:
          _themeMode = ThemeMode.dark;
          _isDark = true;
      }
      
      notifyListeners();
    } catch (e) {
      // Default to dark theme on error
      _themeMode = ThemeMode.dark;
      _isDark = true;
      notifyListeners();
    }
  }

  Future<void> setTheme(String theme) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConfig.themeKey, theme);
      
      switch (theme) {
        case 'light':
          _themeMode = ThemeMode.light;
          _isDark = false;
          break;
        case 'dark':
          _themeMode = ThemeMode.dark;
          _isDark = true;
          break;
        case 'auto':
          _themeMode = ThemeMode.system;
          _isDark = WidgetsBinding.instance.platformDispatcher.platformBrightness == Brightness.dark;
          break;
        default:
          _themeMode = ThemeMode.dark;
          _isDark = true;
      }
      
      notifyListeners();
    } catch (e) {
      // Handle error silently
    }
  }

  void toggleTheme() {
    if (_isDark) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }
}
