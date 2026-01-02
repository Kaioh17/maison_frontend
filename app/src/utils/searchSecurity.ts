/**
 * Secure search utility for client-side filtering
 * Includes input validation, sanitization, and security detection
 */

export interface SearchSecurityResult {
  isValid: boolean
  sanitized: string
  isSuspicious: boolean
  warnings: string[]
}

// Patterns that might indicate malicious intent
const SUSPICIOUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i, // Event handlers like onclick=
  /eval\(/i,
  /expression\(/i,
  /vbscript:/i,
  /data:text\/html/i,
  /&#x/i, // HTML entities
  /%[0-9a-f]{2}/i, // URL encoding
  /union\s+select/i, // SQL injection attempt
  /drop\s+table/i,
  /delete\s+from/i,
  /insert\s+into/i,
  /update\s+set/i,
  /exec\(/i,
  /system\(/i,
  /\.\.\//, // Path traversal
  /\.\.\\/, // Path traversal (Windows)
  /\${.*}/, // Template injection
  /\{\{.*\}\}/, // Template injection
]

// Maximum query length
const MAX_QUERY_LENGTH = 200

// Minimum query length for search
const MIN_QUERY_LENGTH = 1

/**
 * Validates and sanitizes search query
 */
export function validateAndSanitizeQuery(query: string): SearchSecurityResult {
  const warnings: string[] = []
  let sanitized = query
  let isSuspicious = false

  // Check for null/undefined
  if (query === null || query === undefined) {
    return {
      isValid: false,
      sanitized: '',
      isSuspicious: false,
      warnings: ['Query is null or undefined'],
    }
  }

  // Convert to string
  sanitized = String(query)

  // Check length
  if (sanitized.length > MAX_QUERY_LENGTH) {
    warnings.push(`Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`)
    sanitized = sanitized.slice(0, MAX_QUERY_LENGTH)
  }

  if (sanitized.trim().length < MIN_QUERY_LENGTH) {
    return {
      isValid: false,
      sanitized: sanitized.trim(),
      isSuspicious: false,
      warnings: ['Query is too short'],
    }
  }

  // Trim whitespace
  sanitized = sanitized.trim()

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      isSuspicious = true
      warnings.push(`Suspicious pattern detected: ${pattern.toString()}`)
      // Remove the suspicious content
      sanitized = sanitized.replace(pattern, '')
    }
  }

  // Remove any remaining HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '')

  // Remove control characters except newline, tab, and carriage return
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Normalize whitespace (multiple spaces to single space)
  sanitized = sanitized.replace(/\s+/g, ' ')

  // Final trim
  sanitized = sanitized.trim()

  return {
    isValid: sanitized.length >= MIN_QUERY_LENGTH && sanitized.length <= MAX_QUERY_LENGTH,
    sanitized,
    isSuspicious,
    warnings,
  }
}

/**
 * Logs search query for security monitoring
 */
export function logSearchQuery(
  query: string,
  result: SearchSecurityResult,
  context: { userId?: string; tenantId?: number; component?: string }
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'search_query',
    query: result.sanitized, // Only log sanitized version
    originalLength: query.length,
    sanitizedLength: result.sanitized.length,
    isSuspicious: result.isSuspicious,
    warnings: result.warnings,
    context,
  }

  // Log to console (which will be captured by logging utility)
  if (result.isSuspicious) {
    console.warn('[SEARCH_SECURITY] Suspicious query detected:', logEntry)
  } else {
    console.log('[SEARCH_SECURITY] Search query:', logEntry)
  }

  // Store in localStorage for security audit (limited storage)
  try {
    const securityLogs = JSON.parse(localStorage.getItem('maison_search_security_logs') || '[]')
    securityLogs.push(logEntry)
    
    // Keep only last 50 entries
    if (securityLogs.length > 50) {
      securityLogs.shift()
    }
    
    localStorage.setItem('maison_search_security_logs', JSON.stringify(securityLogs))
  } catch (error) {
    console.error('[SEARCH_SECURITY] Failed to save security log:', error)
  }
}

/**
 * Get security logs (for admin review)
 */
export function getSecurityLogs(): any[] {
  try {
    return JSON.parse(localStorage.getItem('maison_search_security_logs') || '[]')
  } catch (error) {
    console.error('[SEARCH_SECURITY] Failed to retrieve security logs:', error)
    return []
  }
}

/**
 * Clear security logs
 */
export function clearSecurityLogs(): void {
  try {
    localStorage.removeItem('maison_search_security_logs')
    console.log('[SEARCH_SECURITY] Security logs cleared')
  } catch (error) {
    console.error('[SEARCH_SECURITY] Failed to clear security logs:', error)
  }
}

