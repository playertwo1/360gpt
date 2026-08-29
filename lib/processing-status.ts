export const PROCESSING_STATES = ['RECEIVED', 'PROCESSING', 'AWAITING_RETRY', 'READY_FOR_REVIEW', 'COMPLETED', 'ERROR'] as const;
export type ProcessingState = typeof PROCESSING_STATES[number];

export function publicProcessingState(documentStatus?: string | null, jobStatus?: string | null): ProcessingState {
  const document = documentStatus?.toLowerCase();
  const job = jobStatus?.toUpperCase();
  if (document === 'published' || document === 'processed' || document === 'local_reviewed') return 'COMPLETED';
  if (document === 'ai_review_ready' || document === 'ready_for_review') return 'READY_FOR_REVIEW';
  if (job === 'FAILED_FINAL' || document === 'failed_final') return 'ERROR';
  if (job === 'FAILED_RETRYABLE') return 'AWAITING_RETRY';
  if (job === 'PROCESSING') return 'PROCESSING';
  return 'RECEIVED';
}
