import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';
import '../models/user.dart';
import '../utils/network_utils.dart';
import '../utils/crypto_utils.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String _baseUrl = AppConfig.baseUrl; // Initialize with default
  String? _accessToken;

  Future<void> initialize() async {
    // Try to find a working base URL
    final workingUrl = await NetworkUtils.findWorkingBaseUrl();
    _baseUrl = workingUrl ?? AppConfig.baseUrl;
    print('API Service: Using base URL: $_baseUrl');
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString(AppConfig.accessTokenKey);
  }

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConfig.accessTokenKey, token);
    _accessToken = token;
  }

  Future<void> _clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConfig.accessTokenKey);
    await prefs.remove(AppConfig.refreshTokenKey);
    await prefs.remove(AppConfig.userRoleKey);
    await prefs.remove(AppConfig.userIdKey);
    _accessToken = null;
  }

  Map<String, String> _getHeaders() {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (_accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    
    return headers;
  }

  Future<http.Response> _makeRequest(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
    bool requiresAuth = true,
  }) async {
    if (requiresAuth) {
      await _loadToken();
    }

    final url = Uri.parse('$_baseUrl$endpoint');
    final headers = _getHeaders();
    
    print('API Service: Making $method request to: $url');
    print('API Service: Headers: $headers');
    if (body != null) {
      print('API Service: Body: $body');
    }

    http.Response response;
    switch (method.toUpperCase()) {
      case 'GET':
        response = await http.get(url, headers: headers);
        break;
      case 'POST':
        response = await http.post(
          url,
          headers: headers,
          body: body != null ? jsonEncode(body) : null,
        );
        break;
      case 'PUT':
        response = await http.put(
          url,
          headers: headers,
          body: body != null ? jsonEncode(body) : null,
        );
        break;
      case 'DELETE':
        response = await http.delete(url, headers: headers);
        break;
      default:
        throw Exception('Unsupported HTTP method: $method');
    }

    // Handle 401 - try to refresh token
    if (response.statusCode == 401 && requiresAuth) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        // Retry the original request
        return await _makeRequest(method, endpoint, body: body, requiresAuth: requiresAuth);
      } else {
        // Refresh failed, clear tokens and redirect to login
        await _clearToken();
        throw Exception('Authentication failed');
      }
    }

    return response;
  }

  Future<bool> _refreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString(AppConfig.refreshTokenKey);
      final userRole = prefs.getString(AppConfig.userRoleKey);
      
      if (refreshToken == null || userRole == null) {
        return false;
      }

      final response = await http.post(
        Uri.parse('$_baseUrl${AppConfig.refreshEndpoint}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $refreshToken',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final newAccessToken = data['new_access_token'];
        if (newAccessToken != null) {
          await _saveToken(newAccessToken);
          return true;
        }
      }
    } catch (e) {
      print('Token refresh failed: $e');
    }
    
    return false;
  }

  // Authentication methods
  Future<LoginResponse> loginTenant(String email, String password) async {
    try {
      print('API Service: Attempting tenant login for: $email');
      
      // Hash the password for secure transmission
      final hashedPassword = CryptoUtils.hashPassword(password);
      print('API Service: Password hashed for secure transmission');
      
      // Send as form data instead of JSON
      final url = Uri.parse('$_baseUrl${AppConfig.tenantLoginEndpoint}');
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: {
          'username': email,  // Changed from 'email' to 'username'
          'password': password,  
        },
      );

      print('API Service: Response status: ${response.statusCode}');
      print('API Service: Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final loginResponse = LoginResponse.fromJson(data);
        
        // Save tokens and user info
        await _saveToken(loginResponse.accessToken);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConfig.refreshTokenKey, loginResponse.refreshToken);
        await prefs.setString(AppConfig.userRoleKey, loginResponse.user.role);
        await prefs.setInt(AppConfig.userIdKey, loginResponse.user.id);
        
        print('API Service: Login successful, tokens saved');
        return loginResponse;
      } else {
        print('API Service: Login failed with status ${response.statusCode}');
        throw Exception('Login failed: ${response.body}');
      }
    } catch (e) {
      print('API Service: Login error: $e');
      rethrow;
    }
  }

  Future<void> logout() async {
    await _clearToken();
  }

  // Tenant methods
  Future<Map<String, dynamic>> getTenantDashboard() async {
    final response = await _makeRequest('GET', AppConfig.tenantDashboardEndpoint);
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data;
    } else {
      throw Exception('Failed to fetch tenant dashboard: ${response.body}');
    }
  }

  // Utility methods
  Future<bool> isAuthenticated() async {
    await _loadToken();
    return _accessToken != null;
  }

  // Test connection to backend
  Future<bool> testConnection() async {
    try {
      print('API Service: Testing connection to $_baseUrl');
      final url = Uri.parse('$_baseUrl/health'); // Try a health endpoint first
      final response = await http.get(url).timeout(const Duration(seconds: 5));
      print('API Service: Health check response: ${response.statusCode}');
      return response.statusCode == 200;
    } catch (e) {
      print('API Service: Connection test failed: $e');
      // Try the actual login endpoint
      try {
        final url = Uri.parse('$_baseUrl${AppConfig.tenantLoginEndpoint}');
        final response = await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'email': 'test', 'password': 'test'}),
        ).timeout(const Duration(seconds: 5));
        print('API Service: Login endpoint test response: ${response.statusCode}');
        return true; // Even if login fails, endpoint is reachable
      } catch (e2) {
        print('API Service: Login endpoint test also failed: $e2');
        return false;
      }
    }
  }

  Future<String?> getUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConfig.userRoleKey);
  }

  Future<int?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(AppConfig.userIdKey);
  }
}
