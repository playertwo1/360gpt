import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

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
  receivedAt: integer('received_at', { mode: 'timestamp_ms' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
}, (table) => [index('idx_telegram_updates_chat_status').on(table.chatId, table.status)]);

export const agentRuns = sqliteTable('agent_runs', {
  id: text('id').primaryKey(), documentId: text('document_id').references(() => documents.id), parentRunId: text('parent_run_id'),
  agentRole: text('agent_role').notNull(), status: text('status').notNull().default('queued'), inputSummary: text('input_summary'),
  outputJson: text('output_json'), startedAt: integer('started_at', { mode: 'timestamp_ms' }), completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
}, (table) => [index('idx_agent_runs_status_role').on(table.status, table.agentRole)]);

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

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), actor: text('actor').notNull(), action: text('action').notNull(),
  entityType: text('entity_type').notNull(), entityId: text('entity_id').notNull(), detailsJson: text('details_json').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [index('idx_audit_owner_created').on(table.ownerId, table.createdAt)]);
