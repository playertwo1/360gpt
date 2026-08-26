CREATE TABLE `manual_review_requests` (
	`review_request_id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`state_id` text NOT NULL,
	`state_version` integer NOT NULL,
	`reason_code` text NOT NULL,
	`category` text NOT NULL,
	`severity` text NOT NULL,
	`review_priority` text NOT NULL,
	`status` text DEFAULT 'PENDING_TRIAGE' NOT NULL,
	`owner_queue` text NOT NULL,
	`assigned_to` text,
	`sla_policy_id` text NOT NULL,
	`escalation_level` integer DEFAULT 0 NOT NULL,
	`dedupe_key` text NOT NULL,
	`duplicate_of` text,
	`problem_statement` text NOT NULL,
	`affected_scope_json` text NOT NULL,
	`impact` text NOT NULL,
	`required_decision` text NOT NULL,
	`suggested_checks_json` text DEFAULT '[]' NOT NULL,
	`reviewer_role` text NOT NULL,
	`allowed_resolutions_json` text DEFAULT '[]' NOT NULL,
	`due_at` integer,
	`created_at` integer NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_manual_review_tenant_status` ON `manual_review_requests` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_manual_review_queue_priority` ON `manual_review_requests` (`owner_queue`,`review_priority`);--> statement-breakpoint
CREATE INDEX `idx_manual_review_due_at` ON `manual_review_requests` (`due_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_manual_review_dedupe` ON `manual_review_requests` (`dedupe_key`);--> statement-breakpoint
CREATE TABLE `manual_review_resolutions` (
	`resolution_id` text PRIMARY KEY NOT NULL,
	`review_request_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`decision` text NOT NULL,
	`reviewer_id` text NOT NULL,
	`reviewer_role` text NOT NULL,
	`rationale` text NOT NULL,
	`affected_scope_json` text NOT NULL,
	`new_evidence_sources_json` text DEFAULT '[]' NOT NULL,
	`next_action` text NOT NULL,
	`resolution_hash` text NOT NULL,
	`resolved_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`review_request_id`) REFERENCES `manual_review_requests`(`review_request_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `manual_review_resolutions_resolution_hash_unique` ON `manual_review_resolutions` (`resolution_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_resolutions_request` ON `manual_review_resolutions` (`review_request_id`);--> statement-breakpoint
CREATE INDEX `idx_resolutions_tenant_date` ON `manual_review_resolutions` (`tenant_id`,`resolved_at`);