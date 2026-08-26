import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const companies = sqliteTable('companies', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), name: text('name').notNull(),
  documentHash: text('document_hash'), segment: text('segment'), healthScore: integer('health_score'),
  status: text('status').notNull().default('monitoring'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(), updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [index('idx_companies_owner_status').on(table.ownerId, table.status)]);

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), companyId: text('company_id').references(() => companies.id),
  source: text('source').notNull(), sourceMessageId: text('source_message_id'), originalName: text('original_name'),
  mimeType: text('mime_type'), storageKey: text('storage_key'), contentHash: text('content_hash'), rawText: text('raw_text'),
  status: text('status').notNull().default('received'), receivedAt: integer('received_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [index('idx_documents_owner_status').on(table.ownerId, table.status), index('idx_documents_company').on(table.companyId), uniqueIndex('uq_documents_source_message').on(table.source, table.sourceMessageId)]);

export const telegramUpdates = sqliteTable('telegram_updates', {
  updateId: text('update_id').primaryKey(),
  chatId: text('chat_id').notNull(),
  messageId: text('message_id').notNull(),
  documentId: text('document_id').notNull(),
  status: text('status').notNull(),
  errorCode: text('error_code'),
  attemptCount: integer('attempt_count').notNull().default(0),
  processingStartedAt: integer('processing_started_at', { mode: 'timestamp_ms' }),
  receivedAt: integer('received_at', { mode: 'timestamp_ms' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
}, (table) => [index('idx_telegram_updates_chat_status').on(table.chatId, table.status)]);

export const agentRuns = sqliteTable('agent_runs', {
  id: text('id').primaryKey(), documentId: text('document_id').references(() => documents.id), parentRunId: text('parent_run_id'),
  agentRole: text('agent_role').notNull(), status: text('status').notNull().default('queued'), inputSummary: text('input_summary'),
  outputJson: text('output_json'), startedAt: integer('started_at', { mode: 'timestamp_ms' }), completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
  attemptCount: integer('attempt_count').notNull().default(0), leaseToken: text('lease_token'),
  leaseExpiresAt: integer('lease_expires_at', { mode: 'timestamp_ms' }), availableAt: integer('available_at', { mode: 'timestamp_ms' }),
  lastErrorCode: text('last_error_code'),
}, (table) => [index('idx_agent_runs_status_role').on(table.status, table.agentRole), index('idx_agent_runs_queue').on(table.status, table.availableAt, table.leaseExpiresAt)]);

export const stateSnapshots = sqliteTable('state_snapshots', {
  stateId: text('state_id').notNull(), tenantId: text('tenant_id').notNull(), subjectRef: text('subject_ref').notNull(),
  stateVersion: integer('state_version').notNull(), eventId: text('event_id').notNull(), correlationId: text('correlation_id').notNull(),
  stateHash: text('state_hash').notNull(), overallStatus: text('overall_status').notNull(), snapshotJson: text('snapshot_json').notNull(),
  executiveAssessmentJson: text('executive_assessment_json'), generatedAt: integer('generated_at', { mode: 'timestamp_ms' }).notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [primaryKey({ columns: [table.stateId, table.stateVersion] }), uniqueIndex('uq_state_snapshots_event').on(table.eventId), uniqueIndex('uq_state_snapshots_scope_version').on(table.tenantId, table.subjectRef, table.stateVersion), index('idx_state_snapshots_latest').on(table.tenantId, table.subjectRef, table.stateVersion)]);

export const telegramRateLimits = sqliteTable('telegram_rate_limits', {
  bucketKey: text('bucket_key').primaryKey(), chatId: text('chat_id').notNull(), windowStartedAt: integer('window_started_at', { mode: 'timestamp_ms' }).notNull(),
  requestCount: integer('request_count').notNull().default(1),
}, (table) => [index('idx_telegram_rate_limits_window').on(table.windowStartedAt)]);

export const insights = sqliteTable('insights', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), companyId: text('company_id').references(() => companies.id),
  agentRunId: text('agent_run_id').references(() => agentRuns.id), kind: text('kind').notNull(), title: text('title').notNull(),
  summary: text('summary').notNull(), evidenceJson: text('evidence_json').notNull().default('[]'), confidence: integer('confidence'),
  severity: integer('severity').notNull().default(1), status: text('status').notNull().default('open'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [index('idx_insights_owner_status_severity').on(table.ownerId, table.status, table.severity)]);

export const decisions = sqliteTable('decisions', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), insightId: text('insight_id').references(() => insights.id),
  action: text('action').notNull(), rationale: text('rationale'), decidedAt: integer('decided_at', { mode: 'timestamp_ms' }).notNull(),
});

export const manualReviewRequests = sqliteTable('manual_review_requests', {
  reviewRequestId: text('review_request_id').primaryKey(),
  eventId: text('event_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  correlationId: text('correlation_id').notNull(),
  stateId: text('state_id').notNull(),
  stateVersion: integer('state_version').notNull(),
  reasonCode: text('reason_code').notNull(),
  category: text('category').notNull(),
  severity: text('severity').notNull(),
  reviewPriority: text('review_priority').notNull(),
  status: text('status').notNull().default('PENDING_TRIAGE'),
  ownerQueue: text('owner_queue').notNull(),
  assignedTo: text('assigned_to'),
  slaPolicyId: text('sla_policy_id').notNull(),
  escalationLevel: integer('escalation_level').notNull().default(0),
  dedupeKey: text('dedupe_key').notNull(),
  duplicateOf: text('duplicate_of'),
  problemStatement: text('problem_statement').notNull(),
  affectedScopeJson: text('affected_scope_json').notNull(),
  impact: text('impact').notNull(),
  requiredDecision: text('required_decision').notNull(),
  suggestedChecksJson: text('suggested_checks_json').notNull().default('[]'),
  reviewerRole: text('reviewer_role').notNull(),
  allowedResolutionsJson: text('allowed_resolutions_json').notNull().default('[]'),
  dueAt: integer('due_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
}, (table) => [
  index('idx_manual_review_tenant_status').on(table.tenantId, table.status),
  index('idx_manual_review_queue_priority').on(table.ownerQueue, table.reviewPriority),
  index('idx_manual_review_due_at').on(table.dueAt),
  uniqueIndex('uq_manual_review_dedupe').on(table.dedupeKey)
]);

export const manualReviewResolutions = sqliteTable('manual_review_resolutions', {
  resolutionId: text('resolution_id').primaryKey(),
  reviewRequestId: text('review_request_id').notNull().references(() => manualReviewRequests.reviewRequestId),
  tenantId: text('tenant_id').notNull(),
  decision: text('decision').notNull(),
  reviewerId: text('reviewer_id').notNull(),
  reviewerRole: text('reviewer_role').notNull(),
  rationale: text('rationale').notNull(),
  affectedScopeJson: text('affected_scope_json').notNull(),
  newEvidenceSourcesJson: text('new_evidence_sources_json').notNull().default('[]'),
  nextAction: text('next_action').notNull(),
  resolutionHash: text('resolution_hash').notNull().unique(),
  resolvedAt: integer('resolved_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [
  uniqueIndex('uq_resolutions_request').on(table.reviewRequestId),
  index('idx_resolutions_tenant_date').on(table.tenantId, table.resolvedAt)
]);

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), actor: text('actor').notNull(), action: text('action').notNull(),
  entityType: text('entity_type').notNull(), entityId: text('entity_id').notNull(), detailsJson: text('details_json').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [index('idx_audit_owner_created').on(table.ownerId, table.createdAt)]);
