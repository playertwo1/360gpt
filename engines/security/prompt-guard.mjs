/**
 * engines/security/prompt-guard.mjs
 * Motor de defesa contra Prompt Injection e Exfiltração (Marco N9.2).
 */

const SUSPICIOUS_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /desconsidere\s+(todas\s+as\s+)?instruções/i,
  /system\s+prompt/i,
  /exiba\s+(o\s+)?prompt\s+do\s+sistema/i,
  /reveal\s+(your\s+)?instructions/i,
  /drop\s+table/i,
  /truncate\s+table/i,
  /delete\s+from\s+pj_/i,
  /curl\s+http/i,
  /fetch\s*\(/i,
  /webhook\.site/i,
  /api[_-]?key/i,
  /senha\s+do\s+banco/i,
  /password/i
];

export function inspectInputSecurity(text) {
  if (typeof text !== "string" || !text.trim()) {
    return { safe: true, threats: [] };
  }

  const detected = [];
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      detected.push(pattern.source);
    }
  }

  if (detected.length > 0) {
    return {
      safe: false,
      threat_level: detected.length >= 2 ? "HIGH" : "MEDIUM",
      threats: detected,
      action: "BLOCK_AND_FLAG",
      reason_code: "SUSPICIOUS_PROMPT_INJECTION_OR_DLP"
    };
  }

  return { safe: true, threats: [] };
}