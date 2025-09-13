import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      print('AuthProvider: Initializing...');
      
      // Ensure API service is initialized first
      await _apiService.initialize();
      print('AuthProvider: API service initialized');
      
      final isAuth = await _apiService.isAuthenticated();
      print('AuthProvider: Is authenticated: $isAuth');
      
      if (isAuth) {
        // Load user data from stored info
        final role = await _apiService.getUserRole();
        final userId = await _apiService.getUserId();
        
        print('AuthProvider: Role: $role, UserId: $userId');
        
        if (role != null && userId != null) {
          // Create a minimal user object from stored data
          _user = User(
            id: userId,
            email: '', // Will be loaded from API if needed
            role: role,
          );
          print('AuthProvider: User created: ${_user?.role}');
        }
      } else {
        print('AuthProvider: Not authenticated, will redirect to login');
      }
    } catch (e) {
      print('AuthProvider: Error during initialization: $e');
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
      print('AuthProvider: Initialization complete. Loading: $_isLoading, User: ${_user?.role}');
    }
  }

  Future<bool> loginTenant(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Ensure API service is initialized
      await _apiService.initialize();
      
      final loginResponse = await _apiService.loginTenant(email, password);
      _user = loginResponse.user;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.logout();
      _user = null;
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
