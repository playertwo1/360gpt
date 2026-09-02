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
  status: text('status').notNull().default('received'), shortProtocol: integer('short_protocol'), receivedAt: integer('received_at', { mode: 'timestamp_ms' }).notNull(),
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

export const telegramInboundEvents = sqliteTable('telegram_inbound_events', {
  id: text('id').primaryKey(), updateId: text('update_id').notNull(), ownerId: text('owner_id').notNull(), chatId: text('chat_id').notNull(),
  messageId: text('message_id').notNull(), replyToMessageId: text('reply_to_message_id'), eventKind: text('event_kind').notNull(),
  text: text('text').notNull().default(''), payloadJson: text('payload_json').notNull().default('{}'), batchId: text('batch_id'),
  status: text('status').notNull().default('QUEUED'), availableAt: integer('available_at', { mode: 'timestamp_ms' }).notNull(),
  leaseToken: text('lease_token'), leaseExpiresAt: integer('lease_expires_at', { mode: 'timestamp_ms' }), attemptCount: integer('attempt_count').notNull().default(0),
  lastErrorCode: text('last_error_code'), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(), completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
}, (table) => [
  uniqueIndex('uq_telegram_inbound_update').on(table.updateId),
  index('idx_telegram_inbound_claim').on(table.status, table.availableAt, table.leaseExpiresAt),
  index('idx_telegram_inbound_chat').on(table.chatId, table.createdAt),
]);

export const telegramMessageBatches = sqliteTable('telegram_message_batches', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), chatId: text('chat_id').notNull(), status: text('status').notNull().default('OPEN'),
  messageCount: integer('message_count').notNull().default(1), combinedText: text('combined_text').notNull().default(''),
  firstMessageAt: integer('first_message_at', { mode: 'timestamp_ms' }).notNull(), lastMessageAt: integer('last_message_at', { mode: 'timestamp_ms' }).notNull(),
  dueAt: integer('due_at', { mode: 'timestamp_ms' }).notNull(), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  sealedAt: integer('sealed_at', { mode: 'timestamp_ms' }), completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
}, (table) => [index('idx_telegram_batches_chat_open').on(table.chatId, table.status, table.dueAt)]);

export const botFeedbackEvents = sqliteTable('bot_feedback_events', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), chatId: text('chat_id').notNull(), protocol: text('protocol'),
  userMessageId: text('user_message_id').notNull(), botMessageId: text('bot_message_id'), botText: text('bot_text'), feedbackText: text('feedback_text').notNull(),
  originalQuestionJson: text('original_question_json').notNull().default('[]'), failureType: text('failure_type'), status: text('status').notNull().default('QUEUED'),
  contentHash: text('content_hash').notNull(), claimToken: text('claim_token'), claimExpiresAt: integer('claim_expires_at', { mode: 'timestamp_ms' }), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(), processedAt: integer('processed_at', { mode: 'timestamp_ms' }),
}, (table) => [uniqueIndex('uq_bot_feedback_hash').on(table.ownerId, table.contentHash), index('idx_bot_feedback_status').on(table.status, table.createdAt)]);

export const botDirectives = sqliteTable('bot_directives', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), sourceFeedbackId: text('source_feedback_id').references(() => botFeedbackEvents.id),
  directive: text('directive').notNull(), scope: text('scope').notNull(), failureType: text('failure_type').notNull(), confidenceBps: integer('confidence_bps').notNull(),
  evidenceRefsJson: text('evidence_refs_json').notNull().default('[]'), contentHash: text('content_hash').notNull(), version: integer('version').notNull().default(1),
  status: text('status').notNull().default('CANDIDATE'), approvedBy: text('approved_by'), approvedAt: integer('approved_at', { mode: 'timestamp_ms' }),
  supersededBy: text('superseded_by'), revokedAt: integer('revoked_at', { mode: 'timestamp_ms' }), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [uniqueIndex('uq_bot_directive_version').on(table.ownerId, table.contentHash, table.version), index('idx_bot_directives_owner_status').on(table.ownerId, table.status, table.updatedAt)]);

export const botDirectiveApplications = sqliteTable('bot_directive_applications', {
  id: text('id').primaryKey(), directiveId: text('directive_id').notNull().references(() => botDirectives.id), directiveVersion: integer('directive_version').notNull(),
  ownerId: text('owner_id').notNull(), executionRef: text('execution_ref').notNull(), protocol: text('protocol'), outcome: text('outcome').notNull().default('APPLIED'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [uniqueIndex('uq_bot_directive_application').on(table.directiveId, table.executionRef), index('idx_bot_directive_app_owner').on(table.ownerId, table.createdAt)]);

export const executionErrorAudits = sqliteTable('execution_error_audits', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), workflowId: text('workflow_id').notNull(), executionId: text('execution_id'),
  jobId: text('job_id'), protocol: text('protocol'), chatId: text('chat_id'), errorClass: text('error_class').notNull(), retryable: integer('retryable', { mode: 'boolean' }).notNull(),
  sanitizedDetailsJson: text('sanitized_details_json').notNull().default('{}'), notificationStatus: text('notification_status').notNull().default('NOT_REQUIRED'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [uniqueIndex('uq_execution_error_execution').on(table.workflowId, table.executionId), index('idx_execution_error_job').on(table.jobId, table.createdAt)]);

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

export const clarificationRequests = sqliteTable('clarification_requests', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull().references(() => agentRuns.id),
  documentId: text('document_id').notNull().references(() => documents.id),
  ownerId: text('owner_id').notNull(),
  chatId: text('chat_id').notNull(),
  telegramMessageId: text('telegram_message_id'),
  status: text('status').notNull().default('PENDING'),
  questionsJson: text('questions_json').notNull(),
  evidenceJson: text('evidence_json').notNull().default('[]'),
  answerText: text('answer_text'),
  answerMessageId: text('answer_message_id'),
  interpretationJson: text('interpretation_json'),
  attemptCount: integer('attempt_count').notNull().default(0),
  dueAt: integer('due_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  resolvedAt: integer('resolved_at', { mode: 'timestamp_ms' }),
}, (table) => [
  index('idx_clarifications_chat_status').on(table.chatId, table.status, table.createdAt),
  index('idx_clarifications_job_status').on(table.jobId, table.status),
  index('idx_clarifications_due').on(table.status, table.dueAt),
]);

export const telegramDeliveries = sqliteTable('telegram_deliveries', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull(),
  stateId: text('state_id').notNull(),
  chatId: text('chat_id').notNull(),
  partIndex: integer('part_index').notNull(),
  partCount: integer('part_count').notNull(),
  contentHash: text('content_hash').notNull(),
  status: text('status').notNull().default('PENDING'),
  telegramMessageId: text('telegram_message_id'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  sentAt: integer('sent_at', { mode: 'timestamp_ms' }),
}, (table) => [
  uniqueIndex('uq_telegram_delivery_part').on(table.jobId, table.stateId, table.partIndex),
  index('idx_telegram_deliveries_status').on(table.status, table.createdAt),
]);

export const commandConfirmations = sqliteTable('command_confirmations', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  chatId: text('chat_id').notNull(),
  command: text('command').notNull(),
  argumentsJson: text('arguments_json').notNull().default('{}'),
  status: text('status').notNull().default('PENDING'),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  confirmedAt: integer('confirmed_at', { mode: 'timestamp_ms' }),
}, (table) => [
  index('idx_command_confirmations_chat_status').on(table.chatId, table.status, table.expiresAt),
]);

export const pobjKnowledgeItems = sqliteTable('pobj_knowledge_items', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), indicatorKey: text('indicator_key').notNull(),
  indicatorName: text('indicator_name').notNull(), layoutSignature: text('layout_signature').notNull(), knowledgeType: text('knowledge_type').notNull(),
  version: integer('version').notNull().default(1), status: text('status').notNull().default('CANDIDATE'), contentJson: text('content_json').notNull(),
  contentHash: text('content_hash').notNull(), sourceDocumentId: text('source_document_id').references(() => documents.id),
  sourceJobId: text('source_job_id').references(() => agentRuns.id), sourceEvidenceJson: text('source_evidence_json').notNull().default('[]'),
  approvedBy: text('approved_by'), approvedAt: integer('approved_at', { mode: 'timestamp_ms' }), validFrom: integer('valid_from', { mode: 'timestamp_ms' }),
  supersededBy: text('superseded_by'), revokedAt: integer('revoked_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(), updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [
  uniqueIndex('uq_pobj_knowledge_version').on(table.ownerId, table.indicatorKey, table.layoutSignature, table.knowledgeType, table.version),
  index('idx_pobj_knowledge_owner_status_layout').on(table.ownerId, table.status, table.layoutSignature),
  index('idx_pobj_knowledge_indicator_status').on(table.indicatorKey, table.status),
]);

export const pobjKnowledgeApplications = sqliteTable('pobj_knowledge_applications', {
  id: text('id').primaryKey(), knowledgeId: text('knowledge_id').notNull().references(() => pobjKnowledgeItems.id),
  knowledgeVersion: integer('knowledge_version').notNull(), ownerId: text('owner_id').notNull(),
  documentId: text('document_id').notNull().references(() => documents.id), jobId: text('job_id').notNull().references(() => agentRuns.id),
  result: text('result').notNull(), detailsJson: text('details_json').notNull().default('{}'), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [
  uniqueIndex('uq_pobj_knowledge_application').on(table.knowledgeId, table.documentId, table.jobId),
  index('idx_pobj_knowledge_application_owner').on(table.ownerId, table.createdAt),
]);

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

export const evidenceNodes = sqliteTable('evidence_nodes', {
  nodeId: text('node_id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  nodeType: text('node_type').notNull(),
  entityId: text('entity_id').notNull(),
  entityVersion: integer('entity_version').notNull().default(1),
  contentHash: text('content_hash').notNull(),
  payloadJson: text('payload_json').notNull().default('{}'),
  validFrom: integer('valid_from', { mode: 'timestamp_ms' }),
  validTo: integer('valid_to', { mode: 'timestamp_ms' }),
  observedAt: integer('observed_at', { mode: 'timestamp_ms' }),
  recordedAt: integer('recorded_at', { mode: 'timestamp_ms' }).notNull(),
  supersededAt: integer('superseded_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [
  uniqueIndex('uq_evidence_node_entity_version').on(table.tenantId, table.nodeType, table.entityId, table.entityVersion),
  index('idx_evidence_nodes_tenant_type').on(table.tenantId, table.nodeType),
  index('idx_evidence_nodes_entity').on(table.tenantId, table.entityId),
  index('idx_evidence_nodes_recorded').on(table.tenantId, table.recordedAt),
]);

export const evidenceEdges = sqliteTable('evidence_edges', {
  edgeId: text('edge_id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  relationshipType: text('relationship_type').notNull(),
  fromNodeId: text('from_node_id').notNull().references(() => evidenceNodes.nodeId),
  toNodeId: text('to_node_id').notNull().references(() => evidenceNodes.nodeId),
  contentHash: text('content_hash').notNull(),
  payloadJson: text('payload_json').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [
  uniqueIndex('uq_evidence_edge_relation').on(table.tenantId, table.relationshipType, table.fromNodeId, table.toNodeId),
  index('idx_evidence_edges_from').on(table.tenantId, table.fromNodeId),
  index('idx_evidence_edges_to').on(table.tenantId, table.toNodeId),
]);

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), actor: text('actor').notNull(), action: text('action').notNull(),
  entityType: text('entity_type').notNull(), entityId: text('entity_id').notNull(), detailsJson: text('details_json').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [index('idx_audit_owner_created').on(table.ownerId, table.createdAt)]);

export const shadowObservations = sqliteTable('shadow_observations', {
  id: text('id').primaryKey(),
  releaseId: text('release_id').notNull(),
  observedAt: integer('observed_at', { mode: 'timestamp_ms' }).notNull(),
  durationMs: integer('duration_ms').notNull(),
  totalCases: integer('total_cases').notNull(),
  completedCases: integer('completed_cases').notNull(),
  errors: integer('errors').notNull(),
  equivalenceRateBps: integer('equivalence_rate_bps').notNull(),
  divergenceRateBps: integer('divergence_rate_bps').notNull(),
  stateMutationCount: integer('state_mutation_count').notNull(),
  externalEffectCount: integer('external_effect_count').notNull(),
  pauseRequired: integer('pause_required', { mode: 'boolean' }).notNull(),
  dataScope: text('data_scope').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [
  uniqueIndex('uq_shadow_observations_release_time').on(table.releaseId, table.observedAt),
  index('idx_shadow_observations_release_time').on(table.releaseId, table.observedAt),
]);

export const canaryReviewRuns = sqliteTable('canary_review_runs', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  domain: text('domain').notNull(),
  capability: text('capability').notNull(),
  dataScope: text('data_scope').notNull(),
  caseCount: integer('case_count').notNull(),
  status: text('status').notNull().default('PENDING_REVIEW'),
  payloadJson: text('payload_json').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [
  index('idx_canary_review_runs_tenant_status').on(table.tenantId, table.status),
]);

export const canaryReviewDecisions = sqliteTable('canary_review_decisions', {
  id: text('id').primaryKey(),
  runId: text('run_id').notNull().references(() => canaryReviewRuns.id),
  tenantId: text('tenant_id').notNull(),
  decision: text('decision').notNull(),
  reviewerId: text('reviewer_id').notNull(),
  reviewerEmail: text('reviewer_email').notNull(),
  rationale: text('rationale').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [
  uniqueIndex('uq_canary_review_decisions_run').on(table.runId),
  index('idx_canary_review_decisions_tenant_created').on(table.tenantId, table.createdAt),
]);
