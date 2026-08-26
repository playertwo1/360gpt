CREATE TABLE `state_snapshots` (
	`state_id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`subject_ref` text NOT NULL,
	`state_version` integer NOT NULL,
	`event_id` text NOT NULL,
	`correlation_id` text NOT NULL,
	`state_hash` text NOT NULL,
	`overall_status` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`executive_assessment_json` text,
	`generated_at` integer NOT NULL,
	`published_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_state_snapshots_event` ON `state_snapshots` (`event_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_state_snapshots_scope_version` ON `state_snapshots` (`tenant_id`,`subject_ref`,`state_version`);--> statement-breakpoint
CREATE INDEX `idx_state_snapshots_latest` ON `state_snapshots` (`tenant_id`,`subject_ref`,`state_version`);--> statement-breakpoint
CREATE TABLE `telegram_rate_limits` (
	`bucket_key` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`window_started_at` integer NOT NULL,
	`request_count` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_telegram_rate_limits_window` ON `telegram_rate_limits` (`window_started_at`);--> statement-breakpoint
ALTER TABLE `agent_runs` ADD `attempt_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `agent_runs` ADD `lease_token` text;--> statement-breakpoint
ALTER TABLE `agent_runs` ADD `lease_expires_at` integer;--> statement-breakpoint
ALTER TABLE `agent_runs` ADD `available_at` integer;--> statement-breakpoint
ALTER TABLE `agent_runs` ADD `last_error_code` text;--> statement-breakpoint
CREATE INDEX `idx_agent_runs_queue` ON `agent_runs` (`status`,`available_at`,`lease_expires_at`);--> statement-breakpoint
ALTER TABLE `telegram_updates` ADD `attempt_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `telegram_updates` ADD `processing_started_at` integer;