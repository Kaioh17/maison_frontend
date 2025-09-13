import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AdminProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Tenant> _tenants = [];
  bool _isLoading = false;
  String? _error;

  List<Tenant> get tenants => _tenants;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadTenants() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final tenants = await _apiService.getTenants();
      _tenants = tenants;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> deleteTenant(int tenantId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.deleteTenant(tenantId);
      // Remove from local list
      _tenants.removeWhere((tenant) => tenant.id == tenantId);
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

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
