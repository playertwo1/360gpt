/**
 * engines/security/dlp-guard.mjs
 * Marco N2.2.10 — Segurança Avançada, DLP de Dados Pessoais & Defesa contra Injeção Indireta
 */

/**
 * Aplica mascaramento de dados sensíveis (DLP) em conformidade com a LGPD e sigilo bancário.
 */
export function maskSensitiveData(text) {
  if (typeof text !== "string") return text;

  let masked = text;

  // 1. Mascaramento de CPF (ex: 123.456.789-01 -> ***.456.789-**)
  masked = masked.replace(
    /\b(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})\b/g,
    "***.$2.***-**"
  );

  // 2. Mascaramento de Contas Correntes bancárias (ex: conta 123456-7 -> conta ***456-* )
  masked = masked.replace(
    /\b((?:conta|c\/c|cc)\s*(?:corrente)?\s*(?:n[ºo.]?)?\s*)(\d{3,8})-?([0-9xX])\b/gi,
    "$1*****-*"
  );

  // 3. Mascaramento de e-mails pessoais (ex: fael@live.de -> f***@live.de)
  masked = masked.replace(
    /\b([a-zA-Z0-9])[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
    "$1***@$2"
  );

  return masked;
}

const INDIRECT_INJECTION_TRIGGERS = [
  /ignore\s+(?:todas\s+as\s+)?(?:instrucoes|instruções|regras)\s+anteriores/i,
  /ignore\s+previous\s+instructions/i,
  /voc[eê]\s+agora\s+[eé]\s+um/i,
  /altere\s+o\s+pobj\s+para\s+100/i,
  /considere\s+que\s+a\s+meta\s+foi\s+batida/i,
  /revele\s+(?:o\s+)?(?:seu\s+)?(?:system\s+prompt|prompt\s+do\s+sistema)/i,
  /desconsidere\s+o\s+regulamento/i
];

/**
 * Analisa o conteúdo textual extraído de documentos e arquivos para barrar injeções indiretas.
 */
export function inspectDocumentForIndirectInjection(documentText) {
  if (typeof documentText !== "string") {
    return { is_safe: true, threat_type: "NONE" };
  }

  for (const trigger of INDIRECT_INJECTION_TRIGGERS) {
    if (trigger.test(documentText)) {
      return {
        is_safe: false,
        threat_type: "INDIRECT_PROMPT_INJECTION",
        triggered_pattern: String(trigger),
        recommended_action: "QUARANTINE_DOCUMENT",
        alert_message: "Tentativa de injeção indireta detectada no arquivo. Processamento interrompido por segurança."
      };
    }
  }

  return {
    is_safe: true,
    threat_type: "NONE"
  };
}