import 'dart:convert';
import 'package:crypto/crypto.dart';

class CryptoUtils {
  /// Hash password using SHA-256 with salt
  static String hashPassword(String password, {String? salt}) {
    // Use provided salt or generate a default one
    final saltToUse = salt ?? 'mobile_app_salt_2024';
    
    // Combine password with salt
    final saltedPassword = '$password$saltToUse';
    
    // Create SHA-256 hash
    final bytes = utf8.encode(saltedPassword);
    final digest = sha256.convert(bytes);
    
    return digest.toString();
  }
  
  /// Generate a random salt (for future use if needed)
  static String generateSalt() {
    final random = DateTime.now().millisecondsSinceEpoch.toString();
    final bytes = utf8.encode(random);
    final digest = sha256.convert(bytes);
    return digest.toString().substring(0, 16);
  }
  
  /// Verify password against hash (for future use if needed)
  static bool verifyPassword(String password, String hash, {String? salt}) {
    final hashedPassword = hashPassword(password, salt: salt);
    return hashedPassword == hash;
  }
}
